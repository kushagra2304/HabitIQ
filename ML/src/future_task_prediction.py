# src/predict_task_completion.py

import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# Load the data
data = pd.read_csv("data/tasks_dataset.csv", parse_dates=["date"], dayfirst=True)
data["date"] = pd.to_datetime(data["date"], errors="coerce")

# Drop rows with missing critical fields
data = data.dropna(subset=["task_text", "label", "completed", "date"])

# Extract date-based features
data["hour"] = data["date"].dt.hour
data["day_of_week"] = data["date"].dt.dayofweek  # Monday=0, Sunday=6

# Features and target
X = data[["task_text", "label", "hour", "day_of_week"]]
y = data["completed"].astype(int)

# Preprocessing pipeline
preprocessor = ColumnTransformer(transformers=[
    ("text", TfidfVectorizer(stop_words="english", max_features=5000), "task_text"),
    ("label", OneHotEncoder(handle_unknown="ignore"), ["label"]),
    ("time", "passthrough", ["hour", "day_of_week"])
])

# Final pipeline with classifier
pipeline = Pipeline([
    ("preprocess", preprocessor),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
])

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Train model
pipeline.fit(X_train, y_train)

# Evaluate model
y_pred = pipeline.predict(X_test)
print("📊 Classification Report (Completion Prediction):\n")
print(classification_report(y_test, y_pred))

# Save model
os.makedirs("models", exist_ok=True)
joblib.dump(pipeline, "models/completion_predictor.pkl")
print("✅ Completion predictor model saved to models/completion_predictor.pkl")
