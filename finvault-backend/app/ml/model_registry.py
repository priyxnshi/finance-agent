"""
Model Registry
==============
Central place for saving, loading, and describing every ML artifact.

All model files live under finvault-backend/models/ (gitignored).
A JSON metadata file (models/metadata.json) records when each model was
last trained and basic evaluation stats, so the /ml/status endpoint can
report model freshness without loading the models themselves.

Directory layout
----------------
models/
  categorizer.joblib           TF-IDF vectorizer + Logistic Regression pipeline
  spending_lr.joblib           LinearRegression on monthly totals
  spending_arima.pkl           statsmodels ARIMA fit result
  anomaly_detector.joblib      IsolationForest + label encoder
  goal_predictor.joblib        Logistic Regression for goal success probability
  metadata.json                Training timestamps + evaluation metrics
"""
import json
import pickle
from datetime import datetime
from pathlib import Path

import joblib

# Resolve relative to this file so the path is correct regardless of the
# working directory uvicorn is started from.
MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models"
METADATA_PATH = MODELS_DIR / "metadata.json"


def _ensure_dir():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


# ---- save/load joblib (sklearn objects) ----------------------------------


def save_joblib(obj, name: str) -> Path:
    _ensure_dir()
    path = MODELS_DIR / f"{name}.joblib"
    joblib.dump(obj, path)
    return path


def load_joblib(name: str):
    path = MODELS_DIR / f"{name}.joblib"
    if not path.exists():
        return None
    return joblib.load(path)


# ---- save/load pickle (statsmodels ARIMA fit) ----------------------------


def save_pickle(obj, name: str) -> Path:
    _ensure_dir()
    path = MODELS_DIR / f"{name}.pkl"
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    return path


def load_pickle(name: str):
    path = MODELS_DIR / f"{name}.pkl"
    if not path.exists():
        return None
    with open(path, "rb") as f:
        return pickle.load(f)


# ---- metadata -----------------------------------------------------------


def read_metadata() -> dict:
    if not METADATA_PATH.exists():
        return {}
    with open(METADATA_PATH) as f:
        return json.load(f)


def write_metadata(key: str, payload: dict):
    _ensure_dir()
    meta = read_metadata()
    meta[key] = {"trained_at": datetime.utcnow().isoformat(), **payload}
    with open(METADATA_PATH, "w") as f:
        json.dump(meta, f, indent=2)


def model_exists(name: str) -> bool:
    return (MODELS_DIR / f"{name}.joblib").exists() or (MODELS_DIR / f"{name}.pkl").exists()


def list_model_status() -> dict:
    meta = read_metadata()
    names = ["categorizer", "spending_lr", "spending_arima", "anomaly_detector", "goal_predictor"]
    return {
        name: {
            "trained": model_exists(name),
            **meta.get(name, {}),
        }
        for name in names
    }
