import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { getHomePath } from '../helpers/roles';

function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={getHomePath(userRole) || redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
