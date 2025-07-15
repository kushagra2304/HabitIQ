# src/train_classifier.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib
import os

# Load dataset from tasks.csv and safely parse the date column
data = pd.read_csv("data/tasks_dataset.csv", parse_dates=["date"], dayfirst=True)

# Coerce any bad date values to NaT
data["date"] = pd.to_datetime(data["date"], errors="coerce")

# Optional: Drop rows with invalid dates if date is important (commented out for now)
# data = data.dropna(subset=["date"])

# Drop rows with missing task_text or label
data = data.dropna(subset=["task_text", "label"])

# Feature (input) and target (label)
X = data["task_text"]
y = data["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Build ML pipeline: TF-IDF + Logistic Regression Classifier
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english", max_features=5000)),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
])

# Train the model
pipeline.fit(X_train, y_train)

# Predict and evaluate
y_pred = pipeline.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred))

# Save the trained pipeline to models/
os.makedirs("models", exist_ok=True)
joblib.dump(pipeline, "models/task_classifier.pkl")
print("Model saved to models/task_classifier.pkl")
