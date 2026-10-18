import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  ArrowForward,
  LockOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { loginAdmin } from "../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("adminToken");
  const role = sessionStorage.getItem("adminRole");

  if (token && role === "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin({ email, password });

      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("adminUserId", String(data.userId));
      sessionStorage.setItem("adminRole", data.role);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect. Check whether Auth Service is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#FFFCF4] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#233636] px-12 py-14 text-[#FFFCF4] lg:flex lg:items-center xl:px-20">
        <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-8 h-64 w-64 rounded-full border border-white/10" />

        <div className="relative max-w-xl">
          <div className="mb-20 flex h-14 w-14 items-center justify-center border border-[#E9B44C]/70 font-serif text-3xl text-[#E9B44C]">
            M.
          </div>

          <p className="mb-5 text-xs font-semibold tracking-[0.25em] text-[#E9B44C]">
            MARKETPLACE · ADMINISTRATION
          </p>

          <h1 className="font-editorial text-5xl leading-tight xl:text-6xl">
            One marketplace.
            <br />
            Complete oversight.
          </h1>

          <p className="mt-7 max-w-md text-sm leading-8 text-[#D1D9D1]">
            Manage sellers, oversee customers, and keep your marketplace running
            smoothly from one secure workspace.
          </p>

          <div className="mt-20 flex items-center gap-3 text-[10px] tracking-[0.2em] text-[#E9B44C]">
            <LockOutlined fontSize="small" />
            SECURE PLATFORM ACCESS
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-14 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center bg-[#233636] font-serif text-2xl text-[#E9B44C]">
              M.
            </div>
            <span className="text-xs font-bold tracking-[0.2em]">
              MARKETPLACE
            </span>
          </div>

          <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[#9A8250]">
            WELCOME BACK
          </p>

          <h2 className="font-editorial text-4xl text-[#233636] sm:text-5xl">
            Admin sign in
          </h2>

          <p className="mb-9 mt-4 text-sm leading-7 text-[#77796F]">
            Sign in with your authorized administrator account.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              placeholder="admin@marketplace.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "3px",
                  backgroundColor: "#FFFFFF",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DED7C7",
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "3px",
                  backgroundColor: "#FFFFFF",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DED7C7",
                },
              }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <ArrowForward />
                )
              }
              sx={{
                mt: "10px !important",
                py: 1.8,
                px: 2.5,
                borderRadius: "3px",
                backgroundColor: "#233636",
                textTransform: "none",
                justifyContent: "space-between",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#2D4945",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Verifying access..." : "Sign in to Admin Console"}
            </Button>
          </form>

          <div className="mt-7 flex items-center gap-3 border border-[#E7E0D1] bg-[#F7F3E9] p-4">
            <VerifiedUserOutlined sx={{ color: "#526B59" }} />
            <p className="text-xs leading-6 text-[#69756C]">
              Restricted access. Authorized administrators only.
            </p>
          </div>

          <p className="mt-12 text-xs leading-6 text-[#96958A]">
            © {new Date().getFullYear()} Marketplace. Platform administration.
          </p>
        </div>
      </section>
    </main>
  );
}
