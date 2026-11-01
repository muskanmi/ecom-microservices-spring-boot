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

const COLORS = {
  teal: "#173F3D",
  tealDark: "#153B39",
  cream: "#F7F1E5",
  creamLight: "#FFFCF6",
  beige: "#E7DDCC",
  gold: "#EBAA20",
  text: "#243B39",
  muted: "#77796F",
};

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardOutlined,
  },
  {
    label: "Seller Management",
    path: "/sellers",
    icon: GroupsOutlined,
  },
  {
    label: "Customer Management",
    path: "/customers",
    icon: PeopleOutlined,
  },
  {
    label: "Marketplace Orders",
    path: "/orders",
    icon: ShoppingBagOutlined,
  },
  {
    label: "Catalog Oversight",
    path: "/catalog",
    icon: Inventory2Outlined,
  },
];

function MarketplaceBrand() {
  return (
    <NavLink
      to="/dashboard"
      aria-label="Marketplace administration home"
      className="flex shrink-0 items-center gap-2.5"
    >
      <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md bg-[#173F3D]">
        <ShoppingBagOutlined sx={{ fontSize: 22, color: "#FFFFFF" }} />
      </div>

      <div>
        <p className="whitespace-nowrap font-serif text-[20px] font-semibold tracking-[0.06em] text-[#173F3D]">
          MARKETPLACE
        </p>

        <p className="mt-0.5 text-[10px] tracking-[0.04em] text-[#77796F]">
          Platform Administration
        </p>
      </div>
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logoutAdmin();
    navigate("/login", { replace: true });
  }

  return (
    <div
      className="min-h-screen bg-[#F7F1E5] text-[#243B39]"
      style={{ "--marketplace-teal": COLORS.teal }}
    >
      {/* Header */}
      <header className="relative z-10 flex min-h-[73px] flex-wrap items-center justify-between gap-4 border-b border-[#E7DDCC] bg-[#FFFCF6] px-5 py-4 md:px-8">
        <MarketplaceBrand />

        <Button
          onClick={handleLogout}
          startIcon={<LogoutOutlined />}
          sx={{
            color: COLORS.teal,
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "6px",
            px: 2,
            py: 1,
            "&:hover": {
              backgroundColor: COLORS.cream,
            },
          }}
        >
          Sign out
        </Button>
      </header>

      {/* Sidebar and page content */}
      <div className="grid min-h-[calc(100vh-73px)] md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-[#E7DDCC] bg-[#FFFCF6] p-5 md:border-b-0 md:border-r md:p-6">
          <p className="mb-5 px-3 text-[10px] font-bold tracking-[0.22em] text-[#8A806D]">
            MAIN MENU
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-200",
                      isActive
                        ? "border-[#173F3D] bg-[#173F3D] font-semibold text-white"
                        : "border-transparent text-[#52615B] hover:border-[#E7DDCC] hover:bg-[#F7F1E5] hover:text-[#173F3D]",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        sx={{
                          fontSize: 21,
                          color: isActive ? "#FFFFFF" : COLORS.teal,
                        }}
                      />

                      <span className="text-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 border-t border-[#E7DDCC] pt-6">
            <p className="px-2 text-[10px] font-bold tracking-[0.2em] text-[#8A806D]">
              ADMIN WORKSPACE
            </p>

            <p className="mt-3 px-2 font-serif text-sm leading-6 text-[#52615B]">
              Manage sellers, customers, orders, and marketplace activity.
            </p>
          </div>
        </aside>

        <main className="min-w-0 bg-[#F7F1E5] px-5 py-7 md:px-8 md:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
