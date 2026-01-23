import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../api/services/authService";

const ProtectedRoute = () => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
