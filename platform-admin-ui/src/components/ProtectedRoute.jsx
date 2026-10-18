import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = sessionStorage.getItem("adminToken");
  const role = sessionStorage.getItem("adminRole");

  if (!token || role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
