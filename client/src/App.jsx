import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./components/NotFound";
import DashboardLayout from "./components/DashboardLayout";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Loading Drive</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Getting your files ready...</p>
      </div>
    </div>
  </div>
);

const CompactLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-3 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-3 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
    </div>
  </div>
);

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Register = React.lazy(() => import("./pages/Register"));
const Login = React.lazy(() => import("./pages/Login"));
const Profile = React.lazy(() => import("./pages/Profile"));
const FileViewer = React.lazy(() => import("./pages/FileViewer"));
const Trash = React.lazy(() => import("./pages/Trash"));
const FileAnalyticsDashboard = React.lazy(() => import("./pages/FileAnalyticsDashboard"));
const RecentFiles = React.lazy(() => import("./pages/RecentFiles"));
const StarredFiles = React.lazy(() => import("./pages/StarredFiles"));

const App = () => {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="drive-theme">
        <Toaster richColors position="top-center" theme="system" />
        <Router>
          <AuthProvider>
            <main>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route 
                    path="/register" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Register />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/login" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Login />
                      </Suspense>
                    } 
                  />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<DashboardLayout />}>
                    <Route 
                      index 
                      element={
                        <Suspense fallback={<CompactLoadingSpinner />}>
                          <Dashboard />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="directory/:parentId" 
                      element={
                        <Suspense fallback={<CompactLoadingSpinner />}>
                          <Dashboard />
                        </Suspense>
                      } 
                    />
                  </Route>
                  <Route
                    path="/file/:fileId"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <FileViewer mode="private" />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/view/:fileId"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <FileViewer mode="view" />
                      </Suspense>
                    }
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Profile />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/trash" 
                    element={
                      <Suspense fallback={<CompactLoadingSpinner />}>
                        <Trash />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/recent" 
                    element={
                      <Suspense fallback={<CompactLoadingSpinner />}>
                        <RecentFiles />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/starred" 
                    element={
                      <Suspense fallback={<CompactLoadingSpinner />}>
                        <StarredFiles />
                      </Suspense>
                    } 
                  />
                  <Route
                    path="/analytics"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <FileAnalyticsDashboard />
                      </Suspense>
                    }
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </div>
  );
};

export default App;