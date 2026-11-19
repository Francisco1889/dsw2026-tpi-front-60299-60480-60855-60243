import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { getHomePath } from '../helpers/roles';

function ProtectedRoute({ children, role, redirectTo = '/login' }) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={getHomePath(userRole) || redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
