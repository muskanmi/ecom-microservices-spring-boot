import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  ArrowForward,
  DashboardOutlined,
  GroupsOutlined,
  Inventory2Outlined,
  LockOutlined,
  LogoutOutlined,
  ShoppingBagOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";

const API_URL = "http://localhost:8081";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(() => {
    const token = sessionStorage.getItem("adminToken");
    return token && sessionStorage.getItem("adminRole") === "ADMIN"
      ? { token, userId: sessionStorage.getItem("adminUserId") }
      : null;
  });

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        throw new Error(
          data.message || "Login failed. Check your credentials.",
        );
      }

      if (data.role !== "ADMIN" || !data.token) {
        throw new Error("Access denied. An Admin account is required.");
      }

      const dashboardResponse = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (!dashboardResponse.ok) {
        throw new Error("Admin verification failed. Please try again.");
      }

      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("adminUserId", String(data.userId));
      sessionStorage.setItem("adminRole", data.role);

      setAdmin({ token: data.token, userId: data.userId });
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect. Check whether Auth Service is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUserId");
    sessionStorage.removeItem("adminRole");
    setAdmin(null);
    setPassword("");
  }

  if (admin) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] text-[#2D3A3A]">
        <header className="flex items-center justify-between border-b border-[#E7E0D1] bg-white px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#233636] font-serif text-xl text-[#E9B44C]">
              M.
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.2em]">MARKETPLACE</p>
              <p className="text-xs text-[#77796F]">Platform Administration</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutOutlined />}
            sx={{ color: "#2D3A3A", textTransform: "none" }}
          >
            Sign out
          </Button>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            PLATFORM OVERVIEW
          </p>
          <h1 className="font-editorial text-4xl md:text-5xl">
            Welcome, Administrator.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#73776E]">
            Your platform administration workspace is ready. Use this console to
            oversee marketplace operations.
          </p>

          <Alert
            icon={<VerifiedUserOutlined />}
            severity="success"
            className="mt-7"
          >
            Admin authentication and dashboard authorization verified.
          </Alert>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Seller Management",
                description: "Review seller accounts and onboarding.",
                icon: <GroupsOutlined />,
                status: "Coming next",
              },
              {
                title: "Customer Management",
                description: "View and manage customer accounts.",
                icon: <AdminPanelSettingsOutlined />,
                status: "Coming next",
              },
              {
                title: "Marketplace Orders",
                description: "Oversee marketplace order activity.",
                icon: <ShoppingBagOutlined />,
                status: "Coming next",
              },
              {
                title: "Catalog Oversight",
                description: "Review products across the marketplace.",
                icon: <Inventory2Outlined />,
                status: "Coming next",
              },
              {
                title: "Admin Dashboard",
                description: "Your protected admin session is active.",
                icon: <DashboardOutlined />,
                status: "Connected",
              },
            ].map((item) => (
              <Paper
                key={item.title}
                elevation={0}
                className="border border-[#E7E0D1] bg-white p-6"
                sx={{ borderRadius: "4px" }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: "#F3EFE3",
                    color: "#2D3A3A",
                    width: 46,
                    height: 46,
                  }}
                >
                  {item.icon}
                </Avatar>
                <h2 className="mt-5 font-editorial text-2xl">{item.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#77796F]">
                  {item.description}
                </p>
                <Divider sx={{ my: 2, borderColor: "#E7E0D1" }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7850]">
                  {item.status}
                </span>
              </Paper>
            ))}
          </div>

          <p className="mt-10 text-xs text-[#8A8A80]">
            Marketplace Platform Admin · User ID {admin.userId}
          </p>
        </main>
      </div>
    );
  }

  return (
    <main className="grid min-h-screen bg-[#FFFCF4] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#233636] px-12 py-14 text-[#FFFCF4] lg:flex lg:items-center xl:px-20">
        <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-8 h-64 w-64 rounded-full border border-white/10" />

        <div className="relative max-w-xl">
          <div className="mb-20 flex h-14 w-14 items-center justify-center border border-[#E9B44C]/70 font-editorial text-3xl text-[#E9B44C]">
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
            <div className="flex h-11 w-11 items-center justify-center bg-[#233636] font-editorial text-2xl text-[#E9B44C]">
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
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2D3A3A",
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
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2D3A3A",
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
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
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
