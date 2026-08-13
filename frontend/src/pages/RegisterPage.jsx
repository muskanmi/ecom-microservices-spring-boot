import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { registerUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (formData) => {
    try {
      const response = await registerUser(formData);
      const { token } = response.data;

      login(token);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setErrorMessage(message);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <RegisterForm onSubmit={handleRegister} errorMessage={errorMessage} />
      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
