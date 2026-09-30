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
import SolveProblemPage from "./pages/SolveProblemPage";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo"
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload"

function App(){
  const location = useLocation();
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

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

      {/* 5. Admin Routes */}
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/problems" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/problems" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/problems" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/problems" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/problems" />} />

      {/* 6. Problem Solve Arena */}
      <Route path="/problem/:problemId" element={<SolveProblemPage />} />
      <Route path="/solve/:problemId" element={<SolveProblemPage />} />

      {/* 7. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
  );
}

export default App;