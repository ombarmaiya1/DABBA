import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * Loading receipt placeholder during session verification
 */
function SessionLoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono text-xs uppercase tracking-wider text-secondary">
      <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-on-surface">Validating DABBA Session...</p>
    </div>
  );
}

/**
 * ProtectedRoute — Ensures the user is authenticated.
 * If not, redirects to /login with the intended redirect path preserved in URL query.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SessionLoadingSpinner />;
  }

  if (!user) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnPath}`} replace />;
  }

  return children;
}

/**
 * Helper to determine the home destination for an authenticated user based on role.
 */
export function getHomeRoute(user) {
  if (!user) return '/';
  switch (user.userType) {
    case 'Restaurant':
      return '/restaurant/dashboard';
    case 'Rider':
      return '/rider';
    case 'Admin':
      return '/admin';
    case 'Customer':
    default:
      return '/restaurants';
  }
}

/**
 * GuestOnlyRoute — For landing, login, register, and password-reset flows.
 * If already authenticated, redirects user to their appropriate role console or requested destination.
 */
export function GuestOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');

  if (loading) {
    return <SessionLoadingSpinner />;
  }

  if (user) {
    if (redirectTarget && redirectTarget !== '/') {
      return <Navigate to={redirectTarget} replace />;
    }
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  return children;
}

/**
 * RoleProtectedRoute — Ensures the user is logged in AND possesses one of the allowed roles.
 * Prevents unauthorized roles (e.g. customer trying to access restaurant admin or rider console).
 */
export function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SessionLoadingSpinner />;
  }

  if (!user) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnPath}`} replace />;
  }

  if (!allowedRoles.includes(user.userType)) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-[460px] w-full bg-surface-container-lowest border-2 border-on-background p-8 ticket-shadow text-center">
          <div className="inline-flex p-3 bg-primary/10 text-primary border border-primary mb-4">
            <ShieldAlert size={28} />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold block mb-1">
            Access Restricted
          </span>
          <h1 className="font-headline font-black text-2xl uppercase tracking-tight text-on-surface">
            Unauthorized Role
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-3 leading-relaxed">
            Your current account type (<strong>{user.userType}</strong>) does not have authorization
            to access this section. This portal is restricted to: {allowedRoles.join(', ')}.
          </p>
          <div className="mt-6 pt-4 border-t border-dashed border-outline-variant flex justify-center">
            <Link
              to={getHomeRoute(user)}
              className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90"
            >
              <ArrowLeft size={14} /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
