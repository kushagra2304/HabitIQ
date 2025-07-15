import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import ProgressChart from "@/components/reused/progressChart";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [taskLabel, setTaskLabel] = useState("Work / Professional");
  const [completionStats, setCompletionStats] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const taskLabels = [
    "Work / Professional",
    "Personal / Errands",
    "Health & Fitness",
    "Learning / Development",
    "Household / Chores",
    "Social / Relationships",
    "Hobbies / Recreation",
    "Mental & Self‑Care",
  ];

  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:5000/api/today-tasks/${user.id}`)
        .then((res) => setTasks(res.data))
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      console.log("📡 Fetching 30-day completion stats for user:", user.id);

      axios
        .get(`http://localhost:5000/api/completion-stats/${user.id}?days=30`)
        .then((res) => {
          console.log("✅ Raw stats response:", res);
          console.log("📦 res.data content type:", typeof res.data);

          if (Array.isArray(res.data)) {
            const reversed = res.data.reverse();
            console.log("📊 Formatted chart data (reversed):", reversed);
            setCompletionStats(reversed);
          } else {
            console.warn("⚠️ Unexpected data format. Expected array but got:", res.data);
            setCompletionStats([]);
          }
        })
        .catch((err) => {
          console.error("❌ Error fetching stats:", err);
          setCompletionStats([]);
        });
    }
  }, [user]);

const handleAddTask = () => {
  if (!task.trim()) return alert("Task cannot be empty");
  if (!user?.id) return alert("User not logged in");

  const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " "); // MySQL datetime format

  const newTask = {
    user_id: user.id,
    task_text: task,
    date: currentDateTime,
    completed: 0,
    is_saved: 0,
    label: taskLabel,
  };

  axios
    .post("http://localhost:5000/api/add-task", newTask)
    .then((res) => {
      setTasks((prev) => [...prev, res.data]);
      setTask("");
      setStartTime(null);
      setEndTime(null);
      setTaskLabel(taskLabels[0]);
    })
    .catch((err) => {
      console.error("Error adding task:", err);
      alert("Failed to add task.");
    });
};


  const handleToggle = (id, checked) => {
    axios
      .put(`http://localhost:5000/api/tasks/${id}/toggle`, {
        completed: checked,
      })
      .then(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, completed: checked } : task
          )
        );
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  const handleSaveProgress = () => {
    axios
      .post("http://localhost:5000/api/save-progress", {
        tasks: tasks.map((task) => ({ id: task.id })),
      })
      .then(() => navigate("/all-tasks"))
      .catch((err) => console.error("Error saving progress:", err));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        Good Morning, {user?.name || "User"} 👋
      </h1>

      <Card className="mt-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">
            Your Task Progress (Last 30 Days)
          </h2>
          <CardContent className="h-72">
            <ProgressChart data={completionStats} />
          </CardContent>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Today’s Tasks</h2>
            <Button variant="outline" onClick={() => navigate("/all-tasks")}>
              View All Tasks
            </Button>
          </div>

          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => handleToggle(task.id, checked)}
              />
              <span
                className={
                  task.completed ? "line-through text-gray-500" : ""
                }
              >
                {task.task_text}
              </span>
              {task.label && (
                <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-2 py-0.5 rounded-full">
                  {task.label}
                </span>
              )}
            </div>
          ))}

          <Button className="mt-4" onClick={handleSaveProgress}>
            Save Progress
          </Button>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50">
            <Button className="px-6 py-2 text-base font-medium">+ Add Task</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Write your task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            {/* <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Start Time</label>
                <TimePicker
                  onChange={setStartTime}
                  value={startTime}
                  disableClock={true}
                  clearIcon={null}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">End Time</label>
                <TimePicker
                  onChange={setEndTime}
                  value={endTime}
                  disableClock={true}
                  clearIcon={null}
                />
              </div>
            </div> */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium">Task Category</label>
              <select
                className="border border-gray-300 rounded-md p-2 text-sm"
                value={taskLabel}
                onChange={(e) => setTaskLabel(e.target.value)}
              >
                {taskLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddTask}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
