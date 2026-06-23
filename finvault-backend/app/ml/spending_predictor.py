"""
Spending Predictor
==================
Two models running in parallel — the API returns both:

Linear Regression
  Simple, interpretable, works with as few as 3 months of data.
  Feature: ordinal month index (0, 1, 2, ...).
  Predicts next month by extending the trend line.
  Good for stable or slowly-changing spending patterns.

ARIMA (AutoRegressive Integrated Moving Average)
  Captures seasonality and autocorrelation that LinReg can't see.
  Requires at least 6 data points to fit reliably; falls back to LinReg
  when there isn't enough history.
  Order ARIMA(2,1,1): AR(2) captures 2-month dependencies, d=1
  differences to remove trend, MA(1) handles residual noise.
  These are starting values — tune with ACF/PACF plots once you have
  12+ months of real data.

Data flow
---------
Training:   pull monthly totals from DB → fit → save to models/
Inference:  load saved model → predict 1 step ahead → return

Retraining schedule: monthly, or whenever > 30 new expenses are added.
The training script calls retrain_from_db() directly.
"""
from __future__ import annotations

import warnings
from datetime import date
from typing import Optional

import numpy as np

from app.ml.model_registry import (
    load_joblib,
    load_pickle,
    save_joblib,
    save_pickle,
    write_metadata,
)

MODEL_LR = "spending_lr"
MODEL_ARIMA = "spending_arima"
MIN_POINTS_ARIMA = 6
MIN_POINTS_LR = 3

_lr_model = None
_arima_result = None


# ---- Training -----------------------------------------------------------


def train(monthly_totals: list[float]) -> dict:
    """
    Train both models on a list of monthly spending totals (oldest first).
    Returns training metadata dict.
    """
    from sklearn.linear_model import LinearRegression

    n = len(monthly_totals)
    metrics: dict = {"data_points": n}

    if n < MIN_POINTS_LR:
        raise ValueError(
            f"Need at least {MIN_POINTS_LR} months of data to train. Got {n}."
        )

    y = np.array(monthly_totals, dtype=float)
    X = np.arange(n).reshape(-1, 1)

    # --- Linear Regression ---
    lr = LinearRegression()
    lr.fit(X, y)
    lr_next = float(lr.predict([[n]])[0])
    lr_r2 = float(lr.score(X, y))

    save_joblib(lr, MODEL_LR)
    metrics["lr_r2"] = round(lr_r2, 4)
    metrics["lr_next_month_prediction"] = round(max(lr_next, 0), 2)

    global _lr_model
    _lr_model = None  # invalidate singleton

    # --- ARIMA ---
    arima_ok = False
    if n >= MIN_POINTS_ARIMA:
        try:
            from statsmodels.tsa.arima.model import ARIMA

            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model = ARIMA(y, order=(2, 1, 1))
                result = model.fit()

            save_pickle(result, MODEL_ARIMA)
            arima_forecast = float(result.forecast(steps=1)[0])
            metrics["arima_aic"] = round(result.aic, 4)
            metrics["arima_next_month_prediction"] = round(max(arima_forecast, 0), 2)
            arima_ok = True

            global _arima_result
            _arima_result = None  # invalidate singleton

        except Exception as exc:
            metrics["arima_error"] = str(exc)

    metrics["arima_trained"] = arima_ok
    write_metadata(MODEL_LR, metrics)
    return metrics


def retrain_from_db(db) -> dict:
    """
    Pull monthly totals from the live database and retrain.
    Called by the training script and the /ml/retrain endpoint.
    """
    from sqlalchemy import func, select, extract
    from app.models.expense import Expense

    rows = db.execute(
        select(
            extract("year", Expense.date).label("year"),
            extract("month", Expense.date).label("month"),
            func.sum(Expense.amount).label("total"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
    ).all()

    if not rows:
        raise ValueError("No expense data in database to train spending predictor.")

    monthly_totals = [float(r.total) for r in rows]
    return train(monthly_totals)


# ---- Inference ----------------------------------------------------------


def _get_lr():
    global _lr_model
    if _lr_model is None:
        _lr_model = load_joblib(MODEL_LR)
    return _lr_model


def _get_arima():
    global _arima_result
    if _arima_result is None:
        _arima_result = load_pickle(MODEL_ARIMA)
    return _arima_result


def predict(monthly_totals: Optional[list[float]] = None) -> dict:
    """
    Return next-month predictions from both models.
    `monthly_totals` is provided when called during retraining; otherwise
    models are loaded from disk and applied to the stored training window.
    """
    import numpy as np

    lr = _get_lr()
    arima = _get_arima()

    if lr is None:
        raise RuntimeError("Spending predictor not trained. Run: python scripts/train_models.py")

    # To predict the *next* point, we need to know n (the training length).
    # We stored this in metadata; reconstruct from the model's coef_ shape.
    # LinearRegression trained on X = [[0],[1],...,[n-1]] so next input = [[n]]
    # We infer n from the intercept domain — but simplest: we need monthly_totals.
    # If not provided, fall back to meta n.
    from app.ml.model_registry import read_metadata
    meta = read_metadata().get(MODEL_LR, {})
    n = meta.get("data_points", 12)

    lr_pred = float(max(lr.predict([[n]])[0], 0))

    result = {
        "linear_regression": {
            "next_month_prediction": round(lr_pred, 2),
            "model_r2": meta.get("lr_r2"),
            "description": "Trend-based linear extrapolation",
        },
        "arima": None,
        "recommended": "linear_regression",
        "data_points_used": n,
    }

    if arima is not None:
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                arima_pred = float(max(arima.forecast(steps=1)[0], 0))
            result["arima"] = {
                "next_month_prediction": round(arima_pred, 2),
                "model_aic": meta.get("arima_aic"),
                "description": "ARIMA(2,1,1) — captures autocorrelation and short-term patterns",
            }
            result["recommended"] = "arima"
        except Exception as exc:
            result["arima_error"] = str(exc)

    return result
