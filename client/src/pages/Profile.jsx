import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogOut,
  Moon,
  Sun,
  Settings,
  Edit3,
  Camera,
  Check,
  X,
  Phone,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import DeviceList from "@/components/DeviceList";
const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("Bhupesh Bhaskar");
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    console.log("Name updated to:", editedName);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(user?.name);
  };

  return (
    <div className="min-h-screen p-2 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="opacity-70">
            Manage your Google Drive account and preferences
          </p>
        </div>

        {/* Main Profile Card */}
        <Card className="border-0 shadow-2xl rounded-3xl   backdrop-blur-sm">
          <CardHeader>
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6  ">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4   shadow-xl">
                  <AvatarImage src={user?.image} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                  <Camera className="w-6 h-6  " />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-xl font-bold border-2 focus:border-blue-500"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="p-2"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl font-bold">
                        {user?.name}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-blue-50 rounded-full"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm opacity-70">{user?.email}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Account Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Information
              </h3>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={user?.email}
                    readOnly
                    className=" border-gray-200 dark:border-gray-600  focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value="••••••••••••"
                      readOnly
                      className="  border-gray-200 dark:border-gray-600"
                    />
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </div>{" "}
            <DeviceList user={user} handleLogout={handleLogout} />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                Switch to {theme === "dark" ? "Light" : "Dark"} Mode
              </Button>

              <Button
                onClick={handleLogout}
                className="px-6 py-3 rounded-xl  bg-[var(--destructive)]  hover:opacity-80 hover:bg-[var(--destructive)]  text-white font-medium transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 opacity-60">
          <p className="text-sm">Google Drive • Secure cloud storage</p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <button className="hover:opacity-100 transition-opacity">
              Privacy Policy
            </button>
            <span>•</span>
            <button className="hover:opacity-100 transition-opacity">
              Terms of Service
            </button>
            <span>•</span>
            <button className="hover:opacity-100 transition-opacity">
              Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
