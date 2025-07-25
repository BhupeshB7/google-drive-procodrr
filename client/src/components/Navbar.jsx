import React, { useState, useRef, useEffect } from "react";
import {
  HardDrive,
  User,
  Moon,
  Sun,
  LogOut,
  Monitor,
  MailPlusIcon,
  Mail,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, allLogout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const handleAllDevicesLogout = () => {
    allLogout();
    setIsUserDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsUserDropdownOpen(false);
  };

  const handleLogin = () => {
    navigate("/login"); // ✅ Redirect to login
  };

  const handleRegister = () => {
    navigate("/register"); // ✅ Redirect to register
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav className="border-b p-4 md:p-2 shadow-sm transition-colors duration-200 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Drive icon */}
        <div className="flex items-center">
          <button className="hidden lg:flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            <HardDrive className="h-6 w-6" />
            <span className="font-medium text-lg">Drive</span>
          </button>
        </div>

        {/* Right - Theme & User */}
        <div className="flex items-center ">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 transform hover:scale-105"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={`flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 transform   ${
                isUserDropdownOpen ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  className="w-8 h-8 rounded-full"
                  alt="Profile Picture"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>

            <div
              className={`absolute right-6 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-50 transform transition-all duration-200 origin-top-right ${
                isUserDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed in
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleProfile}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors duration-150"
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>

              <div className="my-1 border-t border-gray-200 dark:border-gray-600"></div>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>

              <button
                onClick={handleAllDevicesLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors duration-150"
              >
                <Monitor className="h-4 w-4 mr-3" />
                All Devices Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
