import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Typography } from "@mui/material";

import LoginForm from "../components/LoginForm";
import { loginUser } from "../services/authApi";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      setErrorMessage("");

      const response = await loginUser(formData);

      const { token, role } = response.data;

      // Seller Admin is only available to SELLER users
      if (role !== "SELLER") {
        setErrorMessage(
          "You do not have Seller access. Please use a Seller account.",
        );
        return;
      }

      // Store JWT for Seller Admin API requests
      localStorage.setItem("token", token);

      navigate("/admin", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password";

      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FFFCF4]">
      <div className="relative bg-[#F7F1E5] w-full max-w-[380px] rounded pt-10 pb-8 px-8 shadow-2xl">
        <span className="absolute w-[22px] h-[22px] bg-[#164E4A] rounded-full -left-[11px] top-24" />

        <span className="absolute w-[22px] h-[22px] bg-[#164E4A] rounded-full -right-[11px] top-24" />

        <Typography className="!font-mono !text-[11px] !tracking-widest !uppercase !text-[#7A817B] !mb-1">
          Marketplace · Seller Access
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

        <p className="mt-5 text-center text-sm text-[#7A817B]">
          Don't have a seller account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#164E4A] border-b-[1.5px] border-[#E9B12C] no-underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
