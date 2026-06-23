#!/usr/bin/env python3
"""
Master Training Script
======================
Trains all four Phase 4 ML models in sequence and reports metrics.

Usage (from finvault-backend/):
    python scripts/train_models.py              # train all
    python scripts/train_models.py --only cat   # train only categorizer
    python scripts/train_models.py --only spend # train only spending predictor
    python scripts/train_models.py --only anomaly
    python scripts/train_models.py --only goal

Environment: activate your .venv first.
    source .venv/bin/activate
    python scripts/train_models.py

Data requirements
-----------------
  Categorizer:       training_data/categories.csv (already included)
  Spending predictor: needs at least 3 months of expenses in finvault.db
  Anomaly detector:  needs at least 10 expenses in finvault.db
  Goal predictor:    uses synthetic data — no DB records needed
"""
import argparse
import sys
import time
from pathlib import Path

# Make app/ importable from scripts/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal, init_db


def banner(text: str):
    bar = "─" * (len(text) + 4)
    print(f"\n┌{bar}┐")
    print(f"│  {text}  │")
    print(f"└{bar}┘")


def tick(label: str, metrics: dict, elapsed: float):
    print(f"  ✓  {label} ({elapsed:.2f}s)")
    for k, v in metrics.items():
        print(f"       {k}: {v}")


def fail(label: str, err: Exception):
    print(f"  ✗  {label} — {type(err).__name__}: {err}")


def train_categorizer():
    banner("1 / 4   Expense Categorizer (TF-IDF + Logistic Regression)")
    from app.ml.categorizer import train

    csv_path = Path(__file__).parent.parent / "training_data" / "categories.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Training data not found at {csv_path}")

    t0 = time.time()
    metrics = train(str(csv_path))
    tick("Categorizer", metrics, time.time() - t0)
    return metrics


def train_spending(db):
    banner("2 / 4   Spending Predictor (Linear Regression + ARIMA)")
    from app.ml.spending_predictor import retrain_from_db

    t0 = time.time()
    metrics = retrain_from_db(db)
    tick("Spending Predictor", metrics, time.time() - t0)
    return metrics


def train_anomaly(db):
    banner("3 / 4   Anomaly Detector (Isolation Forest)")
    from app.ml.anomaly_detector import retrain_from_db

    t0 = time.time()
    metrics = retrain_from_db(db)
    tick("Anomaly Detector", metrics, time.time() - t0)
    return metrics


def train_goal():
    banner("4 / 4   Goal Achievement Predictor (Logistic Regression)")
    from app.ml.goal_predictor import train

    t0 = time.time()
    metrics = train()
    tick("Goal Predictor", metrics, time.time() - t0)
    return metrics


def main():
    parser = argparse.ArgumentParser(description="Train Finvault ML models")
    parser.add_argument(
        "--only",
        choices=["cat", "spend", "anomaly", "goal"],
        help="Train only one model instead of all four",
    )
    args = parser.parse_args()

    print("\n🧠  Finvault ML Training Pipeline")
    print(f"    Models directory: finvault-backend/models/")

    # Ensure tables exist before opening a session
    init_db()
    db = SessionLocal()

    try:
        only = args.only
        errors = 0

        if only is None or only == "cat":
            try:
                train_categorizer()
            except Exception as e:
                fail("Categorizer", e)
                errors += 1

        if only is None or only == "spend":
            try:
                train_spending(db)
            except Exception as e:
                fail("Spending Predictor", e)
                print("     → Import some expenses first: POST /upload-csv")
                errors += 1

        if only is None or only == "anomaly":
            try:
                train_anomaly(db)
            except Exception as e:
                fail("Anomaly Detector", e)
                print("     → Import some expenses first: POST /upload-csv")
                errors += 1

        if only is None or only == "goal":
            try:
                train_goal()
            except Exception as e:
                fail("Goal Predictor", e)
                errors += 1

        print("\n" + ("─" * 45))
        if errors == 0:
            print("✅  All models trained successfully.")
            print("    Restart uvicorn (or the models auto-reload on next request).")
        else:
            print(f"⚠️   {errors} model(s) failed — see messages above.")
        print()

    finally:
        db.close()


if __name__ == "__main__":
    main()
