import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Divider,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { useNavigate } from "react-router-dom";

import { currentUser } from "../services/authApi";

function Topbar() {
  const navigate = useNavigate();

  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  const accountMenuOpen = Boolean(accountAnchorEl);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await currentUser(token);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to load seller information:", error);
      }
    };

    loadUser();
  }, []);

  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  const handleAccountNavigation = (path) => {
    handleAccountClose();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleAccountClose();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || "Seller";
  const role = user?.role || "SELLER";

  const avatarLetter = user?.name?.trim()?.charAt(0)?.toUpperCase() || "S";

  const avatarUrl = user?.avatarUrl
    ? `${import.meta.env.VITE_API_URL}${user.avatarUrl}`
    : undefined;

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#E4DDCF] bg-[#FFFCF4] px-6 lg:px-8">
      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="flex w-full max-w-[560px] items-center gap-3 rounded-[6px] bg-[#F3EEE4] px-4 py-2.5">
        <SearchOutlinedIcon fontSize="small" className="text-[#6F766F]" />

        <InputBase
          placeholder="Search products, orders..."
          className="flex-1 text-sm"
          sx={{
            "& input": {
              color: "#263331",
              fontSize: "14px",
            },
            "& input::placeholder": {
              color: "#8A8F89",
              opacity: 1,
            },
          }}
        />
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="ml-6 flex shrink-0 items-center gap-5">
        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            size="small"
            sx={{
              color: "#164E4A",
            }}
          >
            <Badge
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#E9B12C",
                  minWidth: 7,
                  height: 7,
                  padding: 0,
                  top: 3,
                  right: 3,
                },
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <div className="h-8 w-px bg-[#E4DDCF]" />

        {/* =================================================
            SELLER ACCOUNT BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleAccountClick}
          className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-[#F3EEE4]"
          aria-label="Seller account menu"
        >
          <Avatar
            src={avatarUrl}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#E9B12C",
              color: "#164E4A",
              fontFamily: "Georgia, serif",
              fontWeight: 700,
            }}
          >
            {avatarLetter}
          </Avatar>

          <div className="text-left">
            <p className="max-w-[180px] truncate font-serif text-sm font-semibold text-[#263331]">
              {displayName}
            </p>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8A8F89]">
              {role}
            </p>
          </div>
        </button>

        {/* =================================================
            ACCOUNT MENU
        ================================================= */}

        <Menu
          anchorEl={accountAnchorEl}
          open={accountMenuOpen}
          onClose={handleAccountClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 240,
              backgroundColor: "#FFFCF4",
              border: "1px solid #E4DDCF",
              borderRadius: "6px",
              boxShadow: "0 10px 30px rgba(38, 51, 49, 0.10)",
              overflow: "hidden",
            },
          }}
        >
          {/* =================================================
              ACCOUNT HEADER
          ================================================= */}

          <div className="px-4 py-3">
            <p className="font-serif text-sm font-semibold text-[#263331]">
              Seller Account
            </p>

            <p className="mt-1 text-xs text-[#7A817B]">
              {user?.email || "Manage your seller account"}
            </p>
          </div>

          <Divider sx={{ borderColor: "#E4DDCF" }} />

          {/* =================================================
              MY PROFILE
          ================================================= */}

          <MenuItem
            onClick={() => handleAccountNavigation("/admin/account")}
            sx={{
              py: 1.4,
              px: 2,
              color: "#263331",
              "&:hover": {
                backgroundColor: "#F3EEE4",
              },
            }}
          >
            <PersonOutlineOutlinedIcon
              sx={{
                fontSize: 20,
                mr: 1.5,
                color: "#164E4A",
              }}
            />

            <span className="text-sm">My Profile</span>
          </MenuItem>

          {/* =================================================
              SELLER ACCOUNT
          ================================================= */}

          <MenuItem
            onClick={() => handleAccountNavigation("/admin/account")}
            sx={{
              py: 1.4,
              px: 2,
              color: "#263331",
              "&:hover": {
                backgroundColor: "#F3EEE4",
              },
            }}
          >
            <StorefrontOutlinedIcon
              sx={{
                fontSize: 20,
                mr: 1.5,
                color: "#164E4A",
              }}
            />

            <span className="text-sm">Seller Account</span>
          </MenuItem>

          {/* =================================================
              SETTINGS
          ================================================= */}

          <MenuItem
            onClick={() => handleAccountNavigation("/admin/settings")}
            sx={{
              py: 1.4,
              px: 2,
              color: "#263331",
              "&:hover": {
                backgroundColor: "#F3EEE4",
              },
            }}
          >
            <SettingsOutlinedIcon
              sx={{
                fontSize: 20,
                mr: 1.5,
                color: "#164E4A",
              }}
            />

            <span className="text-sm">Settings</span>
          </MenuItem>

          <Divider sx={{ borderColor: "#E4DDCF" }} />

          {/* =================================================
              LOG OUT
          ================================================= */}

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.4,
              px: 2,
              color: "#8B3A3A",
              "&:hover": {
                backgroundColor: "#F7ECE7",
              },
            }}
          >
            <LogoutOutlinedIcon
              sx={{
                fontSize: 20,
                mr: 1.5,
              }}
            />

            <span className="text-sm">Log out</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

export default Topbar;
