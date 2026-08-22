import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export default function RequireAuth() {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
