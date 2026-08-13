import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (formData) => {
    try {
      const response = await loginUser(formData);
      const { token } = response.data;

      login(token);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password";
      setErrorMessage(message);
    }
  };

  return (
    <div>
      <h1>Log In</h1>
      <LoginForm onSubmit={handleLogin} errorMessage={errorMessage} />
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
