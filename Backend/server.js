const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Test the connection
db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ Connected to Aiven MySQL");
  }
});

app.post("/api/signup", (req, res) => {
  const { name, email, password, phone_number, start_time, end_time } = req.body;

  const sql = `
    INSERT INTO users (name, email, password, phone_number, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, password, phone_number, start_time, end_time], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json({ message: "User registered successfully!" });
  });
});


app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("🟡 Login Attempt:");
  console.log("➡️ Email:", email);
  console.log("➡️ Password:", password);

  if (!email || !password) {
    console.warn("⚠️ Missing email or password");
    return res.status(400).json({ error: "Email and password are required." });
  }

  const sql = `SELECT id, name, email, password FROM users WHERE email = ?`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ Error during login:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      console.warn("❌ No user found with this email");
      return res.status(401).json({ error: "Invalid email" });
    }

    const user = results[0];
    console.log("✅ User Found:", user.email);
    console.log("🔑 DB Password:", user.password);
    console.log("🔑 Entered Password:", password);

    if (user.password === password) {
      console.log("✅ Password matched. Login successful!");
      
      // Don't send password in the response
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user: userData,
      });
    } else {
      console.warn("❌ Password mismatch");
      return res.status(401).json({ error: "Invalid password" });
    }
  });
});


app.get("/api/tasks", (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  const sql = `
    SELECT id, task_text, completed, date,label
    FROM tasks
    WHERE user_id = ?
    ORDER BY date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching tasks:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json(results);
  });
});

app.put("/api/tasks/:id/toggle", (req, res) => {
  const taskId = req.params.id;
  const { completed } = req.body;

  const sql = `UPDATE tasks SET completed = ? WHERE id = ?`;
  db.query(sql, [completed, taskId], (err, result) => {
    if (err) {
      console.error("❌ Error updating task:", err);
      return res.status(500).json({ error: "Failed to update task" });
    }
    res.status(200).json({ success: true });
  });
});



app.get("/api/today-tasks/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT * FROM tasks 
    WHERE user_id = ? AND DATE(date) = CURDATE() AND is_saved = 0
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching today’s tasks:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(results);
  });
});

app.post('/api/add-task', (req, res) => {
  const { user_id, task_text, date, completed, is_saved, label } = req.body;

  const sql = `
    INSERT INTO tasks (user_id, task_text, date, completed, is_saved, label)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, task_text, date, completed, is_saved, label], (err, result) => {
    if (err) {
      console.error("Error inserting task:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ id: result.insertId, ...req.body });
  });
});




app.post("/api/save-progress", (req, res) => {
  const { tasks } = req.body; // [{ id: 1 }, { id: 2 }, ...]

  const ids = tasks.map(task => task.id); // ✅ Extract all IDs once
  const sql = `UPDATE tasks SET is_saved = 1 WHERE id IN (?)`;

  db.query(sql, [ids], (err, result) => {
    if (err) {
      console.error("❌ Error saving progress:", err);
      return res.status(500).json({ error: "Failed to save progress" });
    }
    res.status(200).json({ success: true, message: "Progress saved" });
  });
});

app.get("/api/completion-stats/:userId", (req, res) => {
  const userId = req.params.userId;
  const days = parseInt(req.query.days) || 30;

  

  const sql = `
    SELECT 
      DATE(date) AS date,
      SUM(completed) AS completed,
      COUNT(*) AS total
    FROM tasks
    WHERE user_id = ? AND DATE(date) >= CURDATE() - INTERVAL ? DAY
    GROUP BY DATE(date)
    ORDER BY date ASC
  `;

  db.query(sql, [userId, days], (err, results) => {
    if (err) {
      console.error("❌ Error fetching stats:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

   

    const data = results.map((row) => {
      const percentage = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;
      console.log(`📅 ${row.date}: ${row.completed}/${row.total} => ${percentage}%`);
      return {
        date: row.date,
        percentage: percentage,
      };
    });

  
    res.json(data);
  });
});
app.get("/api/lacking-categories/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const days = parseInt(req.query.days) || 30;

  const sql = `
    SELECT label, COUNT(*) AS total, 
      SUM(completed = 0) AS missed
    FROM tasks
    WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY label
    HAVING missed > 0
  `;

  db.query(sql, [userId, days], (err, results) => {
    if (err) {
      console.error("❌ Error fetching lacking categories:", err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log("✅ Raw results from DB:", results);

    const suggestions = results.map((row) => ({
      label: row.label,
      missed: row.missed,
    }));

    console.log("📦 Final suggestions to send:", suggestions);
    res.json({ suggestions });
  });
});









// Example route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
