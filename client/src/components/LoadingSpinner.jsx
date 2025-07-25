import React from "react";
import { Cloud, Upload, Download, FileText, Folder } from "lucide-react";

const LoadingSpinner = ({ message = "please wait ..." }) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 
    bg-gradient-to-br from-blue-50 via-white to-indigo-50 
    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Main spinner container with glassmorphism effect */}
      <div className="relative   backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* Central cloud spinner */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>

          {/* Inner cloud icon */}
          <div className="relative z-10 bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full">
            <Cloud className="w-8 h-8    animate-pulse" />
          </div>

          {/* Floating data icons */}
          <div className="absolute inset-0 w-20 h-20">
            <div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 animate-bounce"
              style={{ animationDelay: "0s" }}
            >
              <Upload className="w-4 h-4 text-blue-500 opacity-60" />
            </div>
            <div
              className="absolute top-1/2 -right-2 transform -translate-y-1/2 animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              <FileText className="w-4 h-4 text-indigo-500 opacity-60" />
            </div>
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce"
              style={{ animationDelay: "1s" }}
            >
              <Download className="w-4 h-4 text-purple-500 opacity-60" />
            </div>
            <div
              className="absolute top-1/2 -left-2 transform -translate-y-1/2 animate-bounce"
              style={{ animationDelay: "1.5s" }}
            >
              <Folder className="w-4 h-4 text-blue-400 opacity-60" />
            </div>
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="text-center">
          <h3 className="text-lg font-semibold  mb-2">
            {message}
          </h3>
          <div className="flex items-center justify-center space-x-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>

        <div className="mt-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
