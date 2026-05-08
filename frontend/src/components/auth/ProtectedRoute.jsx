import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 * On first mount, calls fetchMe to hydrate user from stored token.
 * Shows a loading spinner while re-hydrating.
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token, fetchMe } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(!user && !!token);

  useEffect(() => {
    if (token && !user) {
      fetchMe().finally(() => setChecking(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="pulse-ring w-12 h-12 bg-crimson-700 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
            </svg>
          </div>
          <p className="text-sm text-white/40">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * GuestRoute — redirects authenticated users away from login/register.
 */
export function GuestRoute({ children }) {
  const { token, user } = useAuthStore();

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
