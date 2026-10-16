import {
  DashboardOutlined,
  Inventory2Outlined,
  ShoppingBagOutlined,
  LogoutOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

function Sidebar() {
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

  return (
    <aside className="sticky top-0 flex h-screen w-[258px] shrink-0 flex-col border-r border-[#E4DDCF] bg-[#FFFCF4]">
      {/* =====================================================
          BRAND
      ====================================================== */}
      <div className="px-6 pt-7">
        <div className="flex items-center gap-3">
          {/* Marketplace logo mark */}
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center border border-[#164E4A] text-[#164E4A]">
            <StorefrontOutlined sx={{ fontSize: 21 }} />
          </div>

          {/* Brand */}
          <div>
            <h1 className="font-serif text-[21px] font-bold tracking-[-0.02em] text-[#263331]">
              MARKETPLACE
            </h1>

            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.24em] text-[#8A8F89]">
              SELLER CONSOLE
            </p>
          </div>
        </div>

        <div className="mt-8 h-px bg-[#E4DDCF]" />
      </div>

      {/* =====================================================
          MAIN MENU
      ====================================================== */}
      <nav className="mt-12 px-6">
        <p className="mb-4 px-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A8F89]">
          Main Menu
        </p>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-4 rounded-[5px] px-4 py-3.5 transition-all duration-200",
                    isActive
                      ? "bg-[#164E4A] text-white"
                      : "text-[#455451] hover:bg-[#F3EEE4] hover:text-[#164E4A]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      sx={{
                        fontSize: 20,
                        color: isActive ? "#FFFFFF" : "#164E4A",
                      }}
                    />

                    <span className="text-[15px] font-medium">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* =====================================================
          WORKSPACE MESSAGE
      ====================================================== */}
      <div className="mt-auto px-6">
        <div className="border-t border-[#E4DDCF] pt-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A8F89]">
            Seller Workspace
          </p>

          <p className="mt-4 max-w-[190px] font-serif text-[14px] leading-6 text-[#455451]">
            Manage your products and orders from one place.
          </p>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="mb-7 mt-8 flex w-full items-center gap-4 border-t border-[#E4DDCF] pt-7 text-left text-[#455451] transition hover:text-[#164E4A]"
        >
          <LogoutOutlined sx={{ fontSize: 20 }} />

          <span className="text-[15px] font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
