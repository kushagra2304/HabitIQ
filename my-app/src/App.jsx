import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import AllTasks from "./pages/alltasks";
import Progress from "./pages/progress";
import Navbar from "./components/reused/NavBar"; 
import Login from "./pages/login"; 
import Signup from "./pages/signup"; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar /> {/* ✅ Static Navbar visible on all pages */}

        <div className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/all-tasks" element={<AllTasks />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
