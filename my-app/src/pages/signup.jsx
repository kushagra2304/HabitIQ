import { use, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
  const fullData = {
    ...form,
    start_time: startTime,
    end_time: endTime,
  };

  try {
    const res = await axios.post("http://localhost:5000/api/signup", fullData);
    alert("Signup successful 🎉");
    navigate("/login"); 
  } catch (err) {
    console.error("Signup error:", err);
    alert("Signup failed. Check console.");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">Sign Up</h1>

          <div className="space-y-4">
            <Input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <Input
              type="tel"
              name="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={handleChange}
            />

            <div className="flex gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Start Time</label>
                <TimePicker
                  onChange={setStartTime}
                  value={startTime}
                  disableClock={true}
                  clearIcon={null}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">End Time</label>
                <TimePicker
                  onChange={setEndTime}
                  value={endTime}
                  disableClock={true}
                  clearIcon={null}
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleSignup}>
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
