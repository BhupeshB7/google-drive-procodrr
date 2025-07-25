import axios from "axios"; 
const API_URL = "http://localhost:3000/api";
import { toast } from "sonner";
const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (response?.status === 429) {
            // Show toast for rate limit
            toast.error(response.data.error || 'Too many requests, please try again later');

            // Redirect to login after showing toast
            if (window.location.pathname !== "/login") {
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            }

            return Promise.reject(error);
        }

        // Handle other auth errors
        if (response?.status === 401) {
            toast.error('Session expired, please login again');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }

        return Promise.reject(error);
    }
);
export const createUser = async ({ name, email, password }) => {
  return await api.post(
    "/user/register",
    { name, email, password },
    { withCredentials: true }
  );
};

export const loginUser = async ({ email, password }) => {
  return await api.post(
    "/user/login",
    { email, password },
    {
      withCredentials: true,
    }
  );
};
export const getUserProfile = async () => {
  return await api.get("/user/profile", {
    withCredentials: true,
  });
};

export const logoutUser = async () => {
  return await api.post(
    "/user/logOut",
    {},
    {
      withCredentials: true,
    }
  );
};

export const logoutAllDevices = async () => {
  return await api.post(
    "/user/logoutAll-device",
    {},
    {
      withCredentials: true,
    }
  );
};

export const loginWithGoogle = async (idToken) => {
    try {
        const response = await api.post(
            "/user/google-auth",
            { idToken },
            { withCredentials: true }
        );
        return response.data; // ✅ success case
    } catch (error) {
        console.log(error);
        // ✅ clean and safe error response
        const responseData = error?.response?.data;

        return {
            error: true,
            message:
                responseData?.error || responseData?.message || "Login failed. Please try again later.",
            status: error?.response?.status || 500,
        };
    }
};

export const loginWithGitHub = async (code) => {
  const response = await api.post(
    "/user/github-auth",
    {
      code,
    },
    {
      withCredentials: true,
    }
  ); 
  return response.data;
};

export const sendOTP = async (email) => {
  return await api.post("/user/send-otp", {
    email,
  });
};

export const verifyOTP = async (email, otp) => {
  return await api.post("/user/verify-otp", {
    email,
    otp,
  });
};
