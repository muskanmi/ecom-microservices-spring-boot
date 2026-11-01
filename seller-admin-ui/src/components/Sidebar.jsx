import {
  DashboardOutlined,
  Inventory2Outlined,
  ShoppingBagOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: DashboardOutlined,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Inventory2Outlined,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBagOutlined,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex min-h-screen w-full shrink-0 flex-col border-r border-[#E7DDCC] bg-[#FFFCF6] md:sticky md:top-0 md:h-screen md:w-[260px]">
      {/* Marketplace brand */}
      <div className="px-6 pt-7">
        <NavLink
          to="/admin"
          aria-label="Marketplace seller console home"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md bg-[#173F3D]">
            <ShoppingBagOutlined sx={{ fontSize: 22, color: "#FFFFFF" }} />
          </div>

          <div className="min-w-0">
            <h1 className="whitespace-nowrap font-serif text-[20px] font-semibold tracking-[0.06em] text-[#173F3D]">
              MARKETPLACE
            </h1>

            <p className="mt-0.5 text-[10px] tracking-[0.04em] text-[#77796F]">
              Seller Console
            </p>
          </div>
        </NavLink>

        <div className="mt-8 h-px bg-[#E7DDCC]" />
      </div>

      {/* Main menu */}
      <nav className="mt-10 px-5">
        <p className="mb-5 px-3 text-[10px] font-bold tracking-[0.22em] text-[#8A806D]">
          MAIN MENU
        </p>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-md border px-4 py-3.5 transition-colors duration-200",
                    isActive
                      ? "border-[#173F3D] bg-[#173F3D] text-white"
                      : "border-transparent text-[#52615B] hover:border-[#E7DDCC] hover:bg-[#F7F1E5] hover:text-[#173F3D]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      sx={{
                        fontSize: 21,
                        color: isActive ? "#FFFFFF" : "#173F3D",
                      }}
                    />

                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Workspace message and logout */}
      <div className="mt-auto px-6 pt-8">
        <div className="border-t border-[#E7DDCC] pt-6">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#8A806D]">
            SELLER WORKSPACE
          </p>

          <p className="mt-3 max-w-[190px] font-serif text-sm leading-6 text-[#52615B]">
            Manage your products and orders from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mb-7 mt-7 flex w-full items-center gap-3 border-t border-[#E7DDCC] pt-6 text-left text-[#52615B] transition-colors hover:text-[#173F3D]"
        >
          <LogoutOutlined sx={{ fontSize: 21 }} />

          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
