# src/analyze_weak_areas.py

import pandas as pd
import os

# Load the dataset
data = pd.read_csv("data/tasks_dataset.csv", parse_dates=["date"], dayfirst=True)

# Coerce invalid dates
data["date"] = pd.to_datetime(data["date"], errors="coerce")

# Drop rows with missing key fields
data = data.dropna(subset=["task_text", "label", "completed"])

# Ensure 'completed' is binary
data["completed"] = data["completed"].astype(int)

# Group by label
summary = data.groupby("label").agg(
    total_tasks=("id", "count"),
    completed_tasks=("completed", "sum")
)

# Add completion rate
summary["completion_rate (%)"] = (summary["completed_tasks"] / summary["total_tasks"]) * 100
summary = summary.sort_values("completion_rate (%)")

# Display summary
print("📊 Task Category Performance Summary:\n")
print(summary)

# Identify weak areas
weak_areas = summary[summary["completion_rate (%)"] < 50]
print("\n🚨 Categories that need more attention (completion < 50%):")
print(weak_areas[["completion_rate (%)"]])

# ✅ Create 'reports/' folder if it doesn't exist
os.makedirs("reports", exist_ok=True)

# ✅ Export to CSV
summary.to_csv("reports/task_summary_report.csv")
weak_areas.to_csv("reports/weak_areas.csv")

print("\n✅ Reports saved to 'reports/' folder.")


def analyze_weak_areas(file_path):
    """Analyze weak areas from the labeled tasks CSV."""
    df = pd.read_csv(file_path)

    # Completion rate by label
    label_stats = df.groupby('label').agg(
        total_tasks=('label', 'count'),
        completed=('completed', 'sum')
    )
    label_stats['completion_rate'] = label_stats['completed'] / label_stats['total_tasks']
    
    # Find low frequency or low completion labels
    low_performance = label_stats.sort_values(by=['completion_rate', 'total_tasks']).head(3)

    return low_performance.reset_index()

