import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginUser,
  getUserProfile,
  logoutUser,
  logoutAllDevices,
  createUser,
} from "@/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isLoggedIn = useMemo(() => !!user, [user]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchUserProfile();
  }, []);
  const fetchUserProfile = async () => {
    try {
      const res = await getUserProfile();

      if (res.status === 200) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };
  const register = async ({ name, email, password }) => {
    console.log("register called");
    try {
      const result = await createUser({ name, email, password });
      console.log(result);
      if (result.status === 201) {
        toast.success("Registered successfully");
        navigate("/", { replace: true });
        return { success: true };
      }
    } catch (err) {
      console.log("register failed", err.response.data.message);
      toast.error(`Register failed:  ${err.response.data.error}`);
      return { success: false };
    } finally {
      toast.dismiss();
    }
  };

  const login = async ({ email, password }) => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return { success: false };
    }
  
    try {
      const loadingToast = toast.loading("Logging in...");
      const result = await loginUser({ email, password });
  
      if (result.status === 200) {
        toast.dismiss(loadingToast); 
        toast.success("Logged in successfully");
  
        await fetchUserProfile();  
        navigate("/", { replace: true });
  
        return { success: true };
      }
    } catch (err) {
      toast.dismiss();
      console.log("Login failed:", err?.response?.data);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong during login";
      toast.error(`Login failed: ${message}`);
      return { success: false };
    }
  };
  

  const logout = async () => {
    const result = await logoutUser();
    if (result.status === 200) {
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
  };
  const allLogout = () => {
    logoutAllDevices();
    setUser(null);
    toast.success("Logged out successfully");
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        isLoggedIn,
        logout,
        allLogout,
        fetchUserProfile,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
