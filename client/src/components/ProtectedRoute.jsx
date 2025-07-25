import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = () => {
  const { isLoggedIn, authLoading } = useAuth();
  if (authLoading) {
    return <LoadingSpinner />;
  }
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace={true} />;
};

export default ProtectedRoute;
