"""
Goal Achievement Predictor
===========================
Model:   Logistic Regression (binary classifier)
Input:   Goal features (progress %, days remaining, required monthly savings,
         actual monthly savings rate, pace status)
Output:  Probability 0-1 that the goal will be achieved by target_date

Why Logistic Regression and not a neural net?
  - A personal finance app has tens of goals, not millions.
    LR is perfectly calibrated at this scale and gives interpretable
    coefficients ("each 1% of progress adds X to your odds").
  - Probabilities it outputs are well-calibrated by default (unlike
    raw SVM scores or tree ensembles without isotonic calibration).

Feature set
  progress_pct          current / target (0-1)
  days_remaining_norm   days_remaining / 365 clipped at [0,1]
  savings_rate          required_monthly / actual_monthly (>1 = falling behind)
  pace_ahead            1 if pace_status=="ahead" else 0
  pace_on_track         1 if pace_status=="on_track" else 0
  has_history           1 if we have enough data to estimate pace

Synthetic training data
  Real users won't have historical goal outcomes yet, so we generate
  10,000 synthetic goal trajectories with known outcomes to bootstrap
  the model. These mimic realistic distributions:
    - Goals with >80% progress and pace "ahead"  → succeed with p ~0.95
    - Goals with <20% progress and pace "behind" → succeed with p ~0.12
  Replace with real outcome data once your user base accumulates it.
"""
from __future__ import annotations

import numpy as np

from app.ml.model_registry import (
    load_joblib,
    save_joblib,
    write_metadata,
)

MODEL_NAME = "goal_predictor"
_model = None


# ---- Feature engineering -----------------------------------------------


def _build_features(goals: list[dict]) -> np.ndarray:
    rows = []
    for g in goals:
        progress_pct = float(g.get("progress_percent", 0)) / 100.0
        days_rem = float(g.get("days_remaining", 0))
        days_norm = float(np.clip(days_rem / 365.0, 0, 2))

        req_monthly = float(g.get("required_monthly_savings", 0))
        actual_monthly = float(g.get("actual_monthly_savings", 0))
        if actual_monthly > 0:
            savings_rate = req_monthly / actual_monthly
        else:
            savings_rate = 3.0  # can't save enough = high rate = bad signal

        pace = g.get("pace_status", "insufficient_data")
        rows.append([
            progress_pct,
            days_norm,
            float(np.clip(savings_rate, 0, 5)),
            1.0 if pace == "ahead" else 0.0,
            1.0 if pace == "on_track" else 0.0,
            0.0 if pace == "insufficient_data" else 1.0,
        ])
    return np.array(rows, dtype=float)


# ---- Synthetic training data -------------------------------------------


def _generate_synthetic_data(n: int = 10_000, seed: int = 42) -> tuple:
    rng = np.random.default_rng(seed)

    progress = rng.beta(2, 2, n)           # 0-1, peaked around 0.5
    days_norm = rng.uniform(0, 1.5, n)
    savings_rate = rng.gamma(2, 0.8, n)    # right-skewed, mode ~1
    ahead = (rng.random(n) < 0.3).astype(float)
    on_track = ((rng.random(n) < 0.35) & (ahead == 0)).astype(float)
    has_hist = (rng.random(n) < 0.8).astype(float)

    X = np.column_stack([progress, days_norm,
                         np.clip(savings_rate, 0, 5),
                         ahead, on_track, has_hist])

    # Ground-truth probability formula (domain-expert heuristic)
    log_odds = (
        3.5 * progress
        + 0.8 * days_norm
        - 1.2 * np.clip(savings_rate - 1, 0, 4)
        + 1.5 * ahead
        + 0.8 * on_track
        + 0.4 * has_hist
        - 0.5
    )
    true_prob = 1 / (1 + np.exp(-log_odds))
    y = (rng.random(n) < true_prob).astype(int)

    return X, y


# ---- Training ----------------------------------------------------------


def train() -> dict:
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import roc_auc_score
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline

    X, y = _generate_synthetic_data()
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=500, C=0.5, solver="lbfgs")),
    ])
    pipe.fit(X_tr, y_tr)

    auc = roc_auc_score(y_te, pipe.predict_proba(X_te)[:, 1])
    acc = float((pipe.predict(X_te) == y_te).mean())

    save_joblib(pipe, MODEL_NAME)
    metrics = {
        "training_samples": len(X_tr),
        "roc_auc": round(auc, 4),
        "accuracy": round(acc, 4),
        "note": "Trained on synthetic data. Replace with real goal outcomes over time.",
    }
    write_metadata(MODEL_NAME, metrics)

    global _model
    _model = None  # invalidate singleton
    return metrics


# ---- Inference ---------------------------------------------------------


def _load():
    global _model
    if _model is None:
        _model = load_joblib(MODEL_NAME)
    return _model


def predict_goal_probability(goal: dict, actual_monthly_savings: float = 0.0) -> dict:
    """
    goal: dict from /goal/{id} API response (includes progress_percent,
          days_remaining, required_monthly_savings, pace_status)
    actual_monthly_savings: what the user actually saved last month
    """
    pipe = _load()
    if pipe is None:
        raise RuntimeError("Goal predictor not trained. Run: python scripts/train_models.py")

    features = _build_features([{
        **goal,
        "actual_monthly_savings": actual_monthly_savings,
    }])

    prob = float(pipe.predict_proba(features)[0][1])
    label = (
        "Very Likely" if prob >= 0.8
        else "Likely" if prob >= 0.6
        else "Uncertain" if prob >= 0.4
        else "Unlikely"
    )

    return {
        "goal_id": goal.get("id"),
        "goal_name": goal.get("name"),
        "achievement_probability": round(prob, 4),
        "label": label,
        "features_used": {
            "progress_percent": goal.get("progress_percent"),
            "days_remaining": goal.get("days_remaining"),
            "required_monthly_savings": goal.get("required_monthly_savings"),
            "actual_monthly_savings": actual_monthly_savings,
            "pace_status": goal.get("pace_status"),
        },
    }


def predict_all_goals(db) -> list[dict]:
    """Predict achievement probability for every goal in the DB."""
    from sqlalchemy import select
    from app.models.goal import Goal
    from app.services.goal_service import compute_goal_progress
    from app.services.analytics_service import get_monthly_spending

    goals = list(db.scalars(select(Goal)))
    if not goals:
        return []

    actual_monthly = get_monthly_spending(db)

    results = []
    for g in goals:
        progress = compute_goal_progress(g)
        goal_dict = {
            "id": g.id,
            "name": g.name,
            "progress_percent": progress.progress_percent,
            "days_remaining": progress.days_remaining,
            "required_monthly_savings": progress.required_monthly_savings,
            "pace_status": progress.pace_status,
        }
        results.append(predict_goal_probability(goal_dict, actual_monthly))

    return results
