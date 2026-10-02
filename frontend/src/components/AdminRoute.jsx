import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

/**
 * AdminRoute Component
 * Strictly guards admin routes against unauthenticated guests and non-admin users.
 * - Guests (unauthenticated): redirected to /login with original location in state.from
 * - Non-admin authenticated users: redirected to /
 * - Admin users: allowed to render the protected children
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth || {});
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
