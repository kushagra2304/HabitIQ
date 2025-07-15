import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // Access the login function from context
  

 const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/login", {
      email,
      password,
    });

    if (res.status === 200) {
      login(res.data.user); // ✅ Update global auth context
      alert("Login successful 🎉");
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed. See console for details.");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">Login</h1>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              
onChange={(e) => setPassword(e.target.value.trim())}
            />

            <Button className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
