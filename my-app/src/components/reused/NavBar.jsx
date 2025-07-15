import { Button } from "@/components/ui/button";
import { Menu as MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext"; // ✅ Auth context
import {
  Menu,
  MenuItem,
  MenuButton,
} from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { loggedIn, logout, user } = useAuth(); // ✅ Access user for name
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 shadow-md bg-white">
      {/* Left: Hamburger + Logo */}
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <MenuIcon className="w-6 h-6" />
            <span className="text-lg font-semibold hidden sm:inline">TaskTracker</span>
          </div>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <Button variant="ghost" className="w-full text-left" onClick={() => navigate("/")}>
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full text-left" onClick={() => navigate("/all-tasks")}>
              All Tasks
            </Button>
            <Button variant="ghost" className="w-full text-left" onClick={() => navigate("/progress")}>
              Progress
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Right: Auth */}
      <div className="space-x-2">
        {loggedIn ? (
          <Menu
            menuButton={
              <MenuButton className="px-4 py-2 border rounded">
                👤 {user?.name|| user?.email || "Profile"}
              </MenuButton>
            }
            transition
          >
            <MenuItem onClick={() => alert("Profile page coming soon!")}>My Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        ) : (
          <>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
