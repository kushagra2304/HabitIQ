import React, { useState } from "react";
import axios from "axios";

const GenerateReportPage = () => {
  const [userId, setUserId] = useState("");
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [reportPath, setReportPath] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!userId) {
      setError("Please enter a User ID.");
      return;
    }

    console.log("⏳ Generating report for User ID:", userId);
    setLoading(true);
    setError("");
    setReportPath(null);

    try {
      const response = await axios.post("http://localhost:5000/api/ml/report", {
        user_id: userId,
        format,
      });

      console.log("✅ Response received:", response.data);

      if (response.data?.path) {
        const path = response.data.path;
        setReportPath(path);
        console.log("📄 Report generated at:", path);
      } else {
        console.error("❌ Report generation failed (no path returned).");
        setError("Report generation failed.");
      }
    } catch (err) {
      console.error("❌ Server error:", err);
      setError("Server error during report generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Generate Performance Report</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>User ID:</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Format:</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option value="pdf">PDF</option>
          <option value="html">HTML</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ padding: "0.6rem 1.2rem", background: "#4CAF50", color: "white" }}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {reportPath && (
        <div style={{ marginTop: "1.5rem" }}>
          <strong>Report Ready:</strong>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <a
              href={`http://localhost:5000${reportPath}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.5rem 1rem",
                background: "#2196F3",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              View Report
            </a>

            <a
              href={`http://localhost:5000${reportPath}`}
              download={`report_user_${userId}.${format}`}
              style={{
                padding: "0.5rem 1rem",
                background: "#f44336",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Download Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateReportPage;
