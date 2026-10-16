import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Typography } from "@mui/material";

import RegisterForm from "../components/RegisterForm";
import { registerSeller } from "../services/authApi";

const RegisterPage = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    try {
      setErrorMessage("");

      const response = await registerSeller(formData);

      const { token, role } = response.data;

      if (role !== "SELLER") {
        setErrorMessage("Seller registration could not be completed.");
        return;
      }

      localStorage.setItem("token", token);

      navigate("/admin", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FFFCF4]">
      <div className="relative bg-[#F7F1E5] w-full max-w-[380px] rounded pt-10 pb-8 px-8 shadow-2xl">
        <span className="absolute w-[22px] h-[22px] bg-[#164E4A] rounded-full -left-[11px] top-24" />

        <span className="absolute w-[22px] h-[22px] bg-[#164E4A] rounded-full -right-[11px] top-24" />

        <Typography className="!font-mono !text-[11px] !tracking-widest !uppercase !text-[#7A817B] !mb-1">
          Marketplace · Seller Registration
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

        <p className="mt-5 text-center text-sm text-[#7A817B]">
          Already have a seller account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#164E4A] border-b-[1.5px] border-[#E9B12C] no-underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
