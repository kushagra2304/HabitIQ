import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext"; // ✅ Import context

export default function AllTasks() {
  const { user } = useAuth(); // ✅ Get user from context
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`http://localhost:5000/api/tasks?user_id=${user.id}`) // ✅ Correct endpoint for all tasks
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, [user]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  const grouped = filteredTasks.reduce((acc, task) => {
    const dateOnly = task.date.slice(0, 10); // ✅ Extract only date part
    acc[dateOnly] = acc[dateOnly] || [];
    acc[dateOnly].push(task);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">All Tasks</h1>
      <div className="flex gap-2 mb-4">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>Completed</Button>
        <Button variant={filter === "incomplete" ? "default" : "outline"} onClick={() => setFilter("incomplete")}>Incomplete</Button>
      </div>

      {Object.keys(grouped).sort().reverse().map((date) => (
        <Card key={date}>
          <CardContent className="space-y-2 p-4">
            <h2 className="font-semibold text-lg">{date}</h2>
           {grouped[date].map((task) => (
  <div key={task.id} className="flex items-center gap-2">
    <Checkbox checked={task.completed} disabled />
    <span className={task.completed ? "line-through text-gray-500" : ""}>
      {task.task_text}
    </span>
    {task.label && (
      <span className="text-sm text-gray-600 ml-2">
        ({task.label})
      </span>
    )}
  </div>
))}

          </CardContent>
        </Card>
      ))}
    </div>
  );
}
