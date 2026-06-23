"""
ML Routes — Phase 4
===================
All ML endpoints. Models are loaded lazily (on first request) and cached
as module-level singletons in each ml/*.py file. No model is loaded at
import time, so a cold server start is fast even before training.

Endpoints
---------
POST /predict-category          Categorise a single description
POST /predict-category/batch    Categorise many descriptions at once
GET  /predict-spending          Next-month forecast (LR + ARIMA)
GET  /detect-anomalies          Flag unusual recent expenses
GET  /predict-goals             Achievement probability for every goal
GET  /ml/status                 Which models are trained + when
POST /ml/retrain                Re-train all models (or one) from live DB
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.model_registry import list_model_status

router = APIRouter(tags=["Machine Learning"])


# ---- Schemas ------------------------------------------------------------


class CategoryRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=300)


class CategoryBatchRequest(BaseModel):
    descriptions: list[str] = Field(..., min_items=1, max_items=100)


class RetrainRequest(BaseModel):
    models: list[str] = Field(
        default=["all"],
        description="Which models to retrain: 'all' or subset of "
                    "['categorizer','spending','anomaly','goal']",
    )


# ---- Category prediction ------------------------------------------------


@router.post("/predict-category")
def predict_category(payload: CategoryRequest):
    """
    Predict the spending category for a transaction description.

    Returns predicted category, confidence score (0-1), and per-class
    probability breakdown.

    Requires the categorizer model to be trained first:
        python scripts/train_models.py --only cat
    """
    from app.ml.categorizer import predict

    try:
        return predict(payload.description)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/predict-category/batch")
def predict_category_batch(payload: CategoryBatchRequest):
    """
    Categorise up to 100 descriptions in one call.
    Useful for bulk-categorising an imported CSV.
    """
    from app.ml.categorizer import predict_batch

    try:
        return {"predictions": predict_batch(payload.descriptions)}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ---- Spending prediction ------------------------------------------------


@router.get("/predict-spending")
def predict_spending(db: Session = Depends(get_db)):
    """
    Predict next month's total spending using both models:
      - Linear Regression (trend extrapolation)
      - ARIMA(2,1,1) (autocorrelation-aware, if enough history)

    The 'recommended' field names whichever model has more data to work
    with. For brand-new installs (< 6 months of data) this will be
    'linear_regression'.

    Requires spending predictor to be trained:
        python scripts/train_models.py --only spend
    """
    from app.ml.spending_predictor import predict

    try:
        return predict()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ---- Anomaly detection --------------------------------------------------


@router.get("/detect-anomalies")
def detect_anomalies(
    limit: int = Query(100, ge=1, le=500, description="How many recent expenses to scan"),
    db: Session = Depends(get_db),
):
    """
    Run Isolation Forest over the most recent `limit` expenses and return
    each one annotated with:
      - anomaly: true/false
      - anomaly_score: 0-1 (1 = most anomalous)
      - reason: human-readable explanation when flagged

    Requires anomaly detector to be trained:
        python scripts/train_models.py --only anomaly
    """
    from app.ml.anomaly_detector import detect_from_db

    try:
        results = detect_from_db(db, limit=limit)
        anomalies = [r for r in results if r["anomaly"]]
        return {
            "scanned": len(results),
            "anomalies_found": len(anomalies),
            "results": results,
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---- Goal achievement prediction ----------------------------------------


@router.get("/predict-goals")
def predict_goals(db: Session = Depends(get_db)):
    """
    For every active savings goal, predict the probability (0-1) of
    reaching the target by the target date.

    Uses current month's spending as the "actual_monthly_savings" proxy.
    The label field gives a plain-language reading:
      Very Likely (≥ 0.80), Likely (≥ 0.60), Uncertain (≥ 0.40), Unlikely.

    Requires goal predictor to be trained:
        python scripts/train_models.py --only goal
    """
    from app.ml.goal_predictor import predict_all_goals

    try:
        return {"predictions": predict_all_goals(db)}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ---- Model status -------------------------------------------------------


@router.get("/ml/status")
def ml_status():
    """
    Returns which models are trained, when they were last trained, and
    their evaluation metrics — without loading any model weights.
    """
    return {"models": list_model_status()}


# ---- Retrain ------------------------------------------------------------


@router.post("/ml/retrain")
def retrain(payload: RetrainRequest, db: Session = Depends(get_db)):
    """
    Trigger retraining from the live database.

    Pass {"models": ["all"]} to retrain everything, or list specific
    models: ["categorizer", "spending", "anomaly", "goal"].

    This runs synchronously — for production, move to a background task.
    For a local dev tool used by one person, synchronous is fine.
    """
    from app.ml import categorizer, spending_predictor, anomaly_detector, goal_predictor
    from pathlib import Path

    targets = payload.models
    do_all = "all" in targets

    results = {}

    if do_all or "categorizer" in targets:
        try:
            csv_path = Path(__file__).resolve().parent.parent.parent / "training_data" / "categories.csv"
            results["categorizer"] = categorizer.train(str(csv_path))
        except Exception as e:
            results["categorizer"] = {"error": str(e)}

    if do_all or "spending" in targets:
        try:
            results["spending"] = spending_predictor.retrain_from_db(db)
        except Exception as e:
            results["spending"] = {"error": str(e)}

    if do_all or "anomaly" in targets:
        try:
            results["anomaly"] = anomaly_detector.retrain_from_db(db)
        except Exception as e:
            results["anomaly"] = {"error": str(e)}

    if do_all or "goal" in targets:
        try:
            results["goal"] = goal_predictor.train()
        except Exception as e:
            results["goal"] = {"error": str(e)}

    return {"retrain_results": results}
