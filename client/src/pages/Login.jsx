import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Lock, LogIn, MailPlus, User } from "lucide-react";
import { getUserProfile, loginWithGitHub, loginWithGoogle } from "@/api";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner"; // ✅ Import toast

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const GITHUB_REDIRECT_URI = encodeURIComponent(
    `${import.meta.env.VITE_GITHUB_REDIRECT_URI}`
  );

  const { login, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleGitHubCallback(code);
    }
  }, []);

  const handleGitHubCallback = async (code) => {
    try {
      const data = await loginWithGitHub(code);
      if (data.status === "success") {
        await fetchUserProfile();
        toast.success("Logged in successfully ");
        navigate("/", { replace: true });
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong with GitHub login. Please try again.");
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=user:email`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login({ email, password });
    console.log("user result", result);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md px-6 py-8 rounded-xl shadow-lg border bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white mb-4">
              <User size={28} />
            </div>
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="opacity-70 text-sm">Sign in to your Drive account</p>
          </div>

          <div>
            <label
              className="flex items-center text-sm font-medium mb-1"
              htmlFor="email"
            >
              <MailPlus className="mr-2" size={14} /> Email Address
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-primary transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="relative">
            <label
              className="flex items-center text-sm font-medium mb-1"
              htmlFor="password"
            >
              <Lock className="mr-2" size={14} /> Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-primary transition pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-7.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all flex items-center justify-center mt-2"
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <LogIn className="mr-2" />
            )}
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="flex items-center my-4">
            <span className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></span>
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <span className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const data = await loginWithGoogle(
                    credentialResponse.credential
                  );

                  if (data.error) {
                    toast.error(
                      data.message || "Google login failed. Please try again."
                    );
                  } else {
                    await fetchUserProfile();
                    toast.success("Logged in successfully.");
                    navigate("/", { replace: true });
                  }
                } catch (error) {
                  console.log("Unexpected error:", error);
                  toast.error(error?.message || "Google login failed.");
                }
              }}
              useOneTap={true}
            />

            <button
              type="button"
              onClick={handleGitHubLogin}
              className="cursor-pointer flex flex-row-reverse gap-3 items-center justify-center bg-white text-gray-900 rounded px-2 py-1 border border-gray-300 dark:border-gray-600 w-[100%] h-[40px] text-sm font-medium transition-colors duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-2"
                fill="currentColor"
              >
                <path
                  fill="currentColor"
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                />
              </svg>
              Continue as
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm flex justify-between items-center text-gray-600 dark:text-gray-300">
          <Link to="/forgot-password" className="hover:underline">
            Forgot password?
          </Link>
          <span>
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
