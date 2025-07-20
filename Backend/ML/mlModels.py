from flask import Flask, request, jsonify, send_from_directory
import os
import joblib
from src.train_classifier import classify_task
from src.future_task_prediction import predict_completion
from src.weak_area import analyze_weak_areas
from src.generate_report import generate_report
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

app = Flask(__name__)

@app.route('/api/ml/classify', methods=['POST'])
def classify():
    task_text = request.json['task_text']
    label = classify_task(task_text)
    return jsonify({'label': label})

@app.route('/api/ml/predict_completion', methods=['POST'])
def predict():
    task = request.json
    result = predict_completion(task)
    return jsonify({'will_complete': result})

@app.route('/api/ml/analyze_weak_areas', methods=['POST'])
def analyze():
    user_id = request.json['user_id']
    weak_fields = analyze_weak_areas(user_id)
    return jsonify({'weak_areas': weak_fields})

@app.route("/api/ml/generate_report", methods=["POST"])
def generate_report():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID missing"}), 400

    # Make sure reports directory exists
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "ML", "reports"))
    os.makedirs(reports_dir, exist_ok=True)

    # Generate proper PDF
    filename = f"user_{user_id}_report.pdf"
    file_path = os.path.join(reports_dir, filename)

    c = canvas.Canvas(file_path, pagesize=letter)
    c.drawString(100, 750, f"Performance Report for User ID: {user_id}")
    c.drawString(100, 720, "This is a test report using ReportLab.")
    c.save()

    print(f"✅ PDF saved at: {file_path}")

    return jsonify({
        "message": "Report generated successfully",
        "path": f"/reports/{filename}"  # This must match your serving route
    }), 200

@app.route("/reports/<path:filename>")
def serve_report(filename):
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "ML", "reports"))
    return send_from_directory(reports_dir, filename)

if __name__ == '__main__':
    app.run(port=5001)
