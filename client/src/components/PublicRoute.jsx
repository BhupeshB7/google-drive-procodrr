import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const PublicRoute = () => {
  const { isLoggedIn, authLoading } = useAuth();
  if (authLoading) {
    return <LoadingSpinner />;
  }
  return !isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;
