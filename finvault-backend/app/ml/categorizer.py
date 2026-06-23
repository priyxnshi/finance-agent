"""
Expense Categorizer
===================
Model:   TF-IDF (char n-grams 2-4) + Logistic Regression pipeline
Input:   Raw transaction description string
Output:  One of {Food, Travel, Bills, Shopping, Entertainment}

Why char n-grams instead of word tokens?
  - Merchant names are short and noisy ("KFC", "IRCTC", "MakeMyTrip")
  - Char n-grams capture substrings like "flight", "zomato", "netflix"
    even when surrounded by extra text or misspelled
  - More robust than word tokenizing against OOV merchant names

Retraining
----------
  Run:  python scripts/train_models.py
  The script loads training_data/categories.csv, trains the pipeline,
  evaluates it on a held-out split, and saves the result via model_registry.
  Add more rows to categories.csv to improve coverage over time.
"""
from __future__ import annotations

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.ml.model_registry import (
    load_joblib,
    save_joblib,
    write_metadata,
)

CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Entertainment"]
MODEL_NAME = "categorizer"

# Singleton — loaded once on first prediction, reused afterwards
_pipeline: Pipeline | None = None


# ---- Training -----------------------------------------------------------


def train(csv_path: str) -> dict:
    """
    Train the TF-IDF + Logistic Regression pipeline on a labeled CSV.

    Returns classification metrics so the training script can log them.
    """
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=["description", "category"])
    df = df[df["category"].isin(CATEGORIES)]

    X = df["description"].str.lower()
    y = df["category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                analyzer="char_wb",   # char n-grams, word boundaries respected
                ngram_range=(2, 4),
                min_df=1,
                max_features=8000,
                sublinear_tf=True,    # log(1 + tf) — smooths high-frequency terms
            ),
        ),
        (
            "clf",
            LogisticRegression(
                max_iter=1000,
                C=1.0,               # regularization strength; tune if overfitting
                class_weight="balanced",  # handles unequal class sizes in training data
                solver="lbfgs",
                multi_class="multinomial",
            ),
        ),
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    report = classification_report(y_test, y_pred, output_dict=True)

    # Persist
    save_joblib(pipeline, MODEL_NAME)
    metrics = {
        "accuracy": round(report["accuracy"], 4),
        "macro_f1": round(report["macro avg"]["f1-score"], 4),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "categories": CATEGORIES,
    }
    write_metadata(MODEL_NAME, metrics)

    # Invalidate singleton so next prediction loads the fresh model
    global _pipeline
    _pipeline = None

    return metrics


# ---- Inference ----------------------------------------------------------


def _load() -> Pipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = load_joblib(MODEL_NAME)
    return _pipeline


def predict(description: str) -> dict:
    """
    Returns predicted category + per-class probabilities.

    Raises RuntimeError if no model has been trained yet.
    """
    pipeline = _load()
    if pipeline is None:
        raise RuntimeError(
            "Categorizer not trained yet. Run: python scripts/train_models.py"
        )

    text = [description.lower()]
    category = pipeline.predict(text)[0]
    proba = pipeline.predict_proba(text)[0]
    classes = pipeline.classes_.tolist()

    return {
        "predicted_category": category,
        "confidence": round(float(proba.max()), 4),
        "probabilities": {cls: round(float(p), 4) for cls, p in zip(classes, proba)},
    }


def predict_batch(descriptions: list[str]) -> list[dict]:
    pipeline = _load()
    if pipeline is None:
        raise RuntimeError("Categorizer not trained yet. Run: python scripts/train_models.py")

    texts = [d.lower() for d in descriptions]
    categories = pipeline.predict(texts)
    probas = pipeline.predict_proba(texts)
    classes = pipeline.classes_.tolist()

    return [
        {
            "description": desc,
            "predicted_category": cat,
            "confidence": round(float(p.max()), 4),
            "probabilities": {cls: round(float(prob), 4) for cls, prob in zip(classes, p)},
        }
        for desc, cat, p in zip(descriptions, categories, probas)
    ]
