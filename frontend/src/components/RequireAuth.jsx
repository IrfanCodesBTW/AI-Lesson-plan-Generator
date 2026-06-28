import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function RequireAuth({ children }) {
  const { user, token } = useAuth();
  const location = useLocation();
  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
