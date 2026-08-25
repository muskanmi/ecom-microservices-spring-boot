import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Typography } from "@mui/material";
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
      console.log(response, "response");

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative bg-paper w-full max-w-[380px] rounded pt-10 pb-8 px-8 shadow-2xl">
        <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -left-[11px] top-24" />
        <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -right-[11px] top-24" />

        <Typography className="!font-mono !text-[11px] !tracking-widest !uppercase !text-muted !mb-1">
          Marketplace · Admit One
        </Typography>
        <Typography className="!font-display !font-bold !text-3xl !mb-8 !leading-tight">
          Welcome back
        </Typography>

        <div
          className="border-t-2 border-dashed border-black/20 absolute left-0 right-0"
          style={{ top: "107px" }}
        />

        <div className="mt-6">
          <LoginForm onSubmit={handleLogin} errorMessage={errorMessage} />
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-ink border-b-[1.5px] border-gold no-underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
