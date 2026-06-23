"""
Anomaly Detector
================
Model:   Isolation Forest
Input:   Recent expense records (amount, category, day-of-week, day-of-month)
Output:  Anomaly score per expense + binary flag

Why Isolation Forest?
  - Unsupervised: no labelled "this is fraud" data needed
  - O(n log n) — fast on small personal-finance datasets
  - Naturally handles skewed amount distributions (most days: small
    coffee-sized spends; occasional outliers: rent, flights)
  - contamination=0.05 assumes ~5% of expenses are unusual — tune to taste

Features used
  amount          Raw rupee value (most important signal)
  amount_log      log1p(amount) — compresses the long tail without losing info
  day_of_week     0=Mon … 6=Sun (weekday vs weekend patterns)
  day_of_month    1-31 (salary day, rent day, etc.)
  category_enc    Label-encoded category integer

Retraining
  Trains on all expenses currently in the DB.
  Re-run whenever you have significantly more data (50+ new expenses).
"""
from __future__ import annotations

import numpy as np

from app.ml.model_registry import (
    load_joblib,
    save_joblib,
    write_metadata,
)

MODEL_NAME = "anomaly_detector"
MIN_SAMPLES = 10          # Isolation Forest needs at least this many rows
CONTAMINATION = 0.05      # expected fraction of anomalies

_model = None
_category_map: dict | None = None


# ---- Training -----------------------------------------------------------


def _build_features(records: list[dict], category_map: dict) -> np.ndarray:
    rows = []
    for r in records:
        amount = float(r["amount"])
        cat_enc = category_map.get(r["category"], 0)
        rows.append([
            amount,
            float(np.log1p(amount)),
            int(r["day_of_week"]),
            int(r["day_of_month"]),
            cat_enc,
        ])
    return np.array(rows, dtype=float)


def train(records: list[dict]) -> dict:
    """
    records: list of dicts with keys: amount, category, day_of_week, day_of_month
    """
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import LabelEncoder

    if len(records) < MIN_SAMPLES:
        raise ValueError(
            f"Need at least {MIN_SAMPLES} expense records. Got {len(records)}."
        )

    # Build stable category → int mapping
    categories = sorted({r["category"] for r in records})
    cat_map = {c: i for i, c in enumerate(categories)}

    X = _build_features(records, cat_map)

    iso = IsolationForest(
        n_estimators=100,
        contamination=CONTAMINATION,
        random_state=42,
        n_jobs=-1,
    )
    iso.fit(X)

    # Save model + category map as a tuple
    save_joblib((iso, cat_map), MODEL_NAME)

    # Quick self-evaluation: how many flagged on training set
    preds = iso.predict(X)
    n_anomalies = int((preds == -1).sum())

    metrics = {
        "training_samples": len(records),
        "categories": categories,
        "n_anomalies_flagged_on_train": n_anomalies,
        "contamination": CONTAMINATION,
    }
    write_metadata(MODEL_NAME, metrics)

    global _model, _category_map
    _model, _category_map = None, None  # invalidate singletons

    return metrics


def retrain_from_db(db) -> dict:
    from sqlalchemy import select
    from app.models.expense import Expense

    rows = db.execute(select(Expense)).scalars().all()
    if not rows:
        raise ValueError("No expense data in database.")

    records = [
        {
            "amount": r.amount,
            "category": r.category,
            "day_of_week": r.date.weekday(),
            "day_of_month": r.date.day,
        }
        for r in rows
    ]
    return train(records)


# ---- Inference ----------------------------------------------------------


def _load():
    global _model, _category_map
    if _model is None:
        bundle = load_joblib(MODEL_NAME)
        if bundle is not None:
            _model, _category_map = bundle
    return _model, _category_map


def detect(expenses: list[dict]) -> list[dict]:
    """
    expenses: list of dicts — id, amount, category, date, description
    Returns same list enriched with: anomaly (bool), anomaly_score (float),
    reason (str)
    """
    iso, cat_map = _load()
    if iso is None:
        raise RuntimeError(
            "Anomaly detector not trained. Run: python scripts/train_models.py"
        )

    from datetime import date as date_type
    import datetime

    records = []
    for e in expenses:
        d = e["date"]
        if isinstance(d, str):
            d = date_type.fromisoformat(d)
        records.append({
            "amount": e["amount"],
            "category": e.get("category", "Other"),
            "day_of_week": d.weekday(),
            "day_of_month": d.day,
        })

    X = _build_features(records, cat_map)
    preds = iso.predict(X)           # 1 = normal, -1 = anomaly
    scores = iso.score_samples(X)    # lower = more anomalous

    results = []
    for expense, pred, score in zip(expenses, preds, scores):
        is_anomaly = pred == -1
        # Normalise score to 0-1 (1 = most anomalous) for the UI
        normalised = float(np.clip(1 - (score - scores.min()) / (scores.ptp() + 1e-9), 0, 1))
        reason = ""
        if is_anomaly:
            if expense["amount"] > float(np.percentile([e["amount"] for e in expenses], 90)):
                reason = f"Amount ₹{expense['amount']:,.0f} is unusually high for {expense.get('category', 'this category')}."
            else:
                reason = "Unusual combination of amount, category, and timing."

        results.append({
            **expense,
            "anomaly": is_anomaly,
            "anomaly_score": round(normalised, 4),
            "reason": reason,
        })

    return results


def detect_from_db(db, limit: int = 100) -> list[dict]:
    from sqlalchemy import select
    from app.models.expense import Expense

    rows = db.execute(
        select(Expense).order_by(Expense.date.desc()).limit(limit)
    ).scalars().all()

    expenses = [
        {
            "id": r.id,
            "amount": r.amount,
            "category": r.category,
            "date": r.date.isoformat(),
            "description": r.description or "",
        }
        for r in rows
    ]
    return detect(expenses)
