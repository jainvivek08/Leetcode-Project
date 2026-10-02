import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProblemsPage from "./pages/ProblemsPage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, logoutUser } from "./authSlice";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Route-based code splitting: Lazy load heavy components
const SolveProblemPage = lazy(() => import("./pages/SolveProblemPage"));
const DeveloperProfile = lazy(() => import("./pages/DeveloperProfile"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const RoadmapsPage = lazy(() => import("./pages/RoadmapsPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));

// Admin Routes (Lazy loaded)
const Admin = lazy(() => import("./pages/Admin"));
const ProblemForm = lazy(() => import("./components/ProblemForm"));
const AdminUpdate = lazy(() => import("./components/AdminUpdate"));
const AdminDelete = lazy(() => import("./components/AdminDelete"));
const AdminVideo = lazy(() => import("./components/AdminVideo"));
const AdminUpload = lazy(() => import("./components/AdminUpload"));

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <span className="loading loading-spinner loading-lg text-primary"></span>
    <span className="text-xs text-base-content/60 font-medium tracking-wide">Loading...</span>
  </div>
);

function App(){
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Listen for global 401 session expiration
  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(logoutUser());
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [dispatch]);

  // Dynamic document title based on active route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'CodeQuest - Level Up Your Coding Skills';
    } else if (path === '/problems' || path === '/practice') {
      document.title = 'Problems | CodeQuest';
    } else if (path === '/leaderboard') {
      document.title = 'Leaderboard | CodeQuest';
    } else if (path === '/profile') {
      document.title = 'Profile | CodeQuest';
    } else if (path.startsWith('/admin')) {
      document.title = 'Admin Portal | CodeQuest';
    } else if (path === '/roadmaps' || path === '/explore') {
      document.title = 'Roadmaps | CodeQuest';
    } else if (path === '/settings') {
      document.title = 'Settings | CodeQuest';
    } else if (path === '/login') {
      document.title = 'Log In | CodeQuest';
    } else if (path === '/signup') {
      document.title = 'Sign Up | CodeQuest';
    } else if (
      path.startsWith('/problem/') ||
      path.startsWith('/problems/') ||
      path.startsWith('/solve/') ||
      path === '/compiler'
    ) {
      document.title = 'Solve Problem | CodeQuest';
    }
  }, [location.pathname]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* 1. Landing Page as default root */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Coding Workspace / Problems Arena */}
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/practice" element={<ProblemsPage />} />
          <Route path="/explore" element={<RoadmapsPage />} />
          <Route path="/roadmaps" element={<RoadmapsPage />} />
          <Route path="/compiler" element={<SolveProblemPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* 3. Modern Auth Routes (Sign In & Sign Up in-place) */}
          <Route path="/login" element={isAuthenticated ? <Navigate to={location.state?.from || "/problems"} replace /> : <Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to={location.state?.from || "/problems"} replace /> : <Signup />} />

          {/* 4. Developer Profile & Settings Pages */}
          <Route path="/profile" element={<DeveloperProfile />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* 5. Admin Routes (Strictly Protected) */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/create" element={<AdminRoute><ProblemForm mode="create" /></AdminRoute>} />
          <Route path="/admin/update" element={<AdminRoute><AdminUpdate /></AdminRoute>} />
          <Route path="/admin/update/:id" element={<AdminRoute><ProblemForm mode="edit" /></AdminRoute>} />
          <Route path="/admin/delete" element={<AdminRoute><AdminDelete /></AdminRoute>} />
          <Route path="/admin/video" element={<AdminRoute><AdminVideo /></AdminRoute>} />
          <Route path="/admin/upload/:problemId" element={<AdminRoute><AdminUpload /></AdminRoute>} />

          {/* 6. Problem Solve Arena (Supports both canonical /problems/:slug and backward-compatible /problem/:id) */}
          <Route path="/problems/:slug" element={<SolveProblemPage />} />
          <Route path="/problem/:id" element={<SolveProblemPage />} />
          <Route path="/problem/:problemId" element={<SolveProblemPage />} />
          <Route path="/solve/:problemId" element={<SolveProblemPage />} />

          {/* 7. Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;