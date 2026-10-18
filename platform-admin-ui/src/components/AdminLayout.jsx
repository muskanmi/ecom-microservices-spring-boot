import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import {
  DashboardOutlined,
  GroupsOutlined,
  Inventory2Outlined,
  LogoutOutlined,
  PeopleOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";
import { logoutAdmin } from "../api/authApi";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlined />,
  },
  {
    label: "Seller Management",
    path: "/sellers",
    icon: <GroupsOutlined />,
  },
  {
    label: "Customer Management",
    path: "/customers",
    icon: <PeopleOutlined />,
  },
  {
    label: "Marketplace Orders",
    path: "/orders",
    icon: <ShoppingBagOutlined />,
  },
  {
    label: "Catalog Oversight",
    path: "/catalog",
    icon: <Inventory2Outlined />,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logoutAdmin();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#FFFCF4] text-[#2D3A3A]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E0D1] bg-white px-5 py-4 md:px-10">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#233636] font-serif text-xl text-[#E9B44C]">
            M.
          </div>

          <div>
            <p className="text-sm font-bold tracking-[0.2em]">MARKETPLACE</p>
            <p className="text-xs text-[#77796F]">Platform Administration</p>
          </div>
        </NavLink>

        <Button
          onClick={handleLogout}
          startIcon={<LogoutOutlined />}
          sx={{ color: "#2D3A3A", textTransform: "none" }}
        >
          Sign out
        </Button>
      </header>

      <div className="mx-auto grid max-w-[1600px] md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-[#E7E0D1] bg-white p-5 md:min-h-[calc(100vh-73px)] md:border-b-0 md:border-r md:p-7">
          <p className="mb-5 text-[10px] font-bold tracking-[0.22em] text-[#8B7850]">
            MAIN MENU
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 border px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "border-[#D8D0BD] bg-[#F5F0E4] font-semibold text-[#233636]"
                      : "border-transparent text-[#68706A] hover:bg-[#F9F6EF]"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 px-5 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
