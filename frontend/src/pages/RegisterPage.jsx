import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Typography } from "@mui/material";
import RegisterForm from "../components/RegisterForm";
import { registerUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (formData) => {
    try {
      console.log(formData);

      const response = await registerUser(formData);
      const { token } = response.data;
      console.log(token);

      console.log(response);

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative bg-paper w-full max-w-[380px] rounded pt-10 pb-8 px-8 shadow-2xl">
        <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -left-[11px] top-24" />
        <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -right-[11px] top-24" />

        <Typography className="!font-mono !text-[11px] !tracking-widest !uppercase !text-muted !mb-1">
          Marketplace · New Vendor Pass
        </Typography>
        <Typography className="!font-display !font-bold !text-3xl !mb-8 !leading-tight">
          Join the market
        </Typography>

        <div
          className="border-t-2 border-dashed border-black/20 absolute left-0 right-0"
          style={{ top: "107px" }}
        />

        <div className="mt-6">
          <RegisterForm onSubmit={handleRegister} errorMessage={errorMessage} />
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-ink border-b-[1.5px] border-gold no-underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
