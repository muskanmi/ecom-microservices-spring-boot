import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default DashboardPage;
