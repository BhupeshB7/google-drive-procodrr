import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  Home,
  ArrowLeft,
  FileText,
  Folder,
} from "lucide-react";

const NotFound = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Create floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Cloud illustration */}
        <div className="mb-8 relative">
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <CloudOff className="w-32 h-32 text-gray-300 mx-auto animate-bounce" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 w-32 h-32 rounded-full opacity-10 blur-xl" />
          </div>

          {/* Floating file icons */}
          <div className="absolute -top-4 -left-8 animate-float">
            <FileText className="w-6 h-6 text-blue-400 opacity-60" />
          </div>
          <div
            className="absolute -top-2 -right-6 animate-float"
            style={{ animationDelay: "0.5s" }}
          >
            <Folder className="w-7 h-7 text-indigo-400 opacity-60" />
          </div>
          <div
            className="absolute -bottom-6 left-4 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <Cloud className="w-5 h-5 text-purple-400 opacity-60" />
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-pulse">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">
            File Not Found in the Cloud
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            The file or folder you're looking for seems to have drifted away
            into the digital clouds. Let's help you find your way back.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Home
          </button>
        </div>
        {/* Footer message */}
        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? Visit our help center or contact support</p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
