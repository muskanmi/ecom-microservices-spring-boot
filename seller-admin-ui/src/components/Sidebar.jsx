import { NavLink } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: DashboardOutlinedIcon,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Inventory2OutlinedIcon,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBagOutlinedIcon,
  },
];

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-[#DED7C9] bg-[#F7F1E5] px-6 py-7">
      {/* Brand */}
      <div className="mb-12 border-b border-[#DED7C9] pb-7">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 items-center justify-center border border-[#2D3A3A] text-[#2D3A3A]">
            <StorefrontOutlinedIcon fontSize="small" />
          </div>

          <div>
            <p className="font-serif text-xl font-semibold tracking-tight text-[#233636]">
              MARKETPLACE
            </p>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#8A8378]">
              Seller Console
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div>
        <p className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
          Main Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 border px-3 py-3 text-sm transition-all duration-200",
                    isActive
                      ? "border-[#2D3A3A] bg-[#2D3A3A] text-[#FFFCF4]"
                      : "border-transparent text-[#6F766F] hover:border-[#DED7C9] hover:bg-[#FFFCF4] hover:text-[#233636]",
                  ].join(" ")
                }
              >
                <Icon fontSize="small" className="shrink-0" />

                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto border-t border-[#DED7C9] pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
          Seller Workspace
        </p>

        <p className="mt-3 font-serif text-sm leading-6 text-[#2D3A3A]">
          Manage your products and orders from one place.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
