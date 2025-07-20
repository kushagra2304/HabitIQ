const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/classify", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5000/classify", {
      task_text: req.body.task_text,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).send("Classification Failed");
  }
});

router.post("/predict-completion", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5000/predict_completion", req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).send("Prediction Failed");
  }
});

router.post("/analyze-weak-areas", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5000/analyze_weak_areas", {
      user_id: req.body.user_id,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).send("Analysis Failed");
  }
});

router.post("/generate-report", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5000/generate_report", {
      user_id: req.body.user_id,
      format: req.body.format || "pdf",
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).send("Report generation failed");
  }
});

module.exports = router;
