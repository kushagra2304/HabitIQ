# src/generate_report.py

import pandas as pd
import joblib
import os

# 1️⃣ Load past task data
data = pd.read_csv("data/tasks_dataset.csv", parse_dates=["date"], dayfirst=True)
data["date"] = pd.to_datetime(data["date"], errors="coerce")
data = data.dropna(subset=["task_text", "label", "completed", "date"])
data["completed"] = data["completed"].astype(int)

# 2️⃣ Analyze past weak areas
summary = data.groupby("label").agg(
    total_tasks=("id", "count"),
    completed_tasks=("completed", "sum")
)
summary["completion_rate (%)"] = (summary["completed_tasks"] / summary["total_tasks"]) * 100
summary = summary.sort_values("completion_rate (%)")
weak_areas = summary[summary["completion_rate (%)"] < 50]

# 3️⃣ Predict completion risk for upcoming tasks
# Example: next week's task draft (you can later make this dynamic)
future_tasks = pd.DataFrame([
    {"task_text": "Do 1 hour of coding practice", "label": "Learning / Development", "date": "2025-07-16"},
    {"task_text": "Morning walk and exercise", "label": "Health & Fitness", "date": "2025-07-17"},
    {"task_text": "Plan grocery shopping", "label": "Household / Chores", "date": "2025-07-18"}
])

# Extract features
future_tasks["date"] = pd.to_datetime(future_tasks["date"])
future_tasks["hour"] = future_tasks["date"].dt.hour
future_tasks["day_of_week"] = future_tasks["date"].dt.dayofweek
X_future = future_tasks[["task_text", "label", "hour", "day_of_week"]]

# Load model and predict
model = joblib.load("models/completion_predictor.pkl")
future_tasks["completion_risk"] = model.predict(X_future)
future_tasks["risk_level"] = future_tasks["completion_risk"].map({1: "Low", 0: "High"})

# 4️⃣ Save Report
os.makedirs("reports", exist_ok=True)

# Save past performance
summary.to_csv("reports/past_summary.csv")
weak_areas.to_csv("reports/weak_areas.csv")
future_tasks.to_csv("reports/future_task_risks.csv", index=False)

# 5️⃣ Print report
print("📘 Personalized Task Report\n")

print("🔎 Past Completion Summary:\n")
print(summary)

print("\n🚨 Weak Areas (Under 50% Completion):\n")
print(weak_areas[["completion_rate (%)"]])

print("\n🔮 Future Task Risk Prediction:\n")
print(future_tasks[["task_text", "label", "risk_level"]])

print("\n✅ Reports saved to /reports folder.")
