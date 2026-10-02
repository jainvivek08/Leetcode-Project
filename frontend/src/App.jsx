import { Routes, Route, Navigate, useLocation } from "react-router";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import DeveloperProfile from "./pages/DeveloperProfile";
import SettingsPage from "./pages/SettingsPage";
import ProblemsPage from "./pages/ProblemsPage";
import RoadmapsPage from "./pages/RoadmapsPage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, logoutUser } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemForm from "./components/ProblemForm";
import SolveProblemPage from "./pages/SolveProblemPage";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";
import AdminUpdate from "./components/AdminUpdate";
import AdminRoute from "./components/AdminRoute";

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
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
  <>
    <Routes>
      {/* 1. Landing Page as default root */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Coding Workspace / Problems Arena */}
      <Route path="/problems" element={<ProblemsPage />} />
      <Route path="/practice" element={<ProblemsPage />} />
      <Route path="/explore" element={<RoadmapsPage />} />
      <Route path="/roadmaps" element={<RoadmapsPage />} />
      <Route path="/compiler" element={<SolveProblemPage />} />

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
  </>
  );
}

export default App;