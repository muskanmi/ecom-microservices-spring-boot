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
  Box,
  Typography,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

import { useNavigate } from "react-router-dom";
import { currentUser } from "../services/authApi";

const COLORS = {
  ink: "#263331",
  teal: "#164E4A",
  paper: "#FFFCF4",
  cream: "#F3EEE4",
  border: "#E4DDCF",
  muted: "#858A82",
  gold: "#E9B12C",
  danger: "#A7443C",
  dangerHover: "#F7ECE7",
};

function Topbar() {
  const navigate = useNavigate();

  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  const accountMenuOpen = Boolean(accountAnchorEl);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

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

  const menuItemSx = {
    minHeight: 43,
    mx: 0.75,
    px: 1.5,
    gap: 1.5,
    borderRadius: "7px",
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: 500,
    transition: "background-color 160ms ease",

    "&:hover": {
      backgroundColor: COLORS.cream,
    },

    "& .menu-leading-icon": {
      fontSize: 19,
      color: COLORS.teal,
      flexShrink: 0,
    },

    "& .menu-trailing-icon": {
      ml: "auto",
      fontSize: 17,
      color: "#B0A796",
    },
  };

  const accountLinks = [
    {
      label: "My Profile",
      icon: PersonOutlineOutlinedIcon,
      path: "/admin/account",
    },
    {
      label: "Seller Account",
      icon: StorefrontOutlinedIcon,
      path: "/admin/account",
    },
    {
      label: "Settings",
      icon: SettingsOutlinedIcon,
      path: "/admin/settings",
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#E4DDCF] bg-[#FFFCF4] px-6 lg:px-8">
      {/* Search */}
      <div className="flex w-full max-w-[560px] items-center gap-3 rounded-[6px] bg-[#F3EEE4] px-4 py-2.5">
        <SearchOutlinedIcon fontSize="small" sx={{ color: COLORS.muted }} />

        <InputBase
          placeholder="Search products, orders..."
          className="flex-1 text-sm"
          sx={{
            "& input": {
              color: COLORS.ink,
              fontSize: "14px",
            },
            "& input::placeholder": {
              color: COLORS.muted,
              opacity: 1,
            },
          }}
        />
      </div>

      {/* Right side */}
      <div className="ml-6 flex shrink-0 items-center gap-5">
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            size="small"
            sx={{ color: COLORS.teal }}
          >
            <Badge
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: COLORS.gold,
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

        {/* Seller account button */}
        <button
          type="button"
          onClick={handleAccountClick}
          aria-label="Seller account menu"
          aria-haspopup="true"
          aria-expanded={accountMenuOpen}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#F3EEE4]"
        >
          <Avatar
            src={avatarUrl}
            sx={{
              width: 38,
              height: 38,
              bgcolor: COLORS.gold,
              color: COLORS.teal,
              fontFamily: "Georgia, serif",
              fontWeight: 700,
            }}
          >
            {avatarLetter}
          </Avatar>

          <div className="max-w-[180px] text-left">
            <p className="truncate font-serif text-sm font-semibold text-[#263331]">
              {displayName}
            </p>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8A8F89]">
              {role}
            </p>
          </div>

          <span
            className="text-[#164E4A] transition-transform duration-200"
            style={{
              display: "inline-flex",
              transform: accountMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronRightOutlinedIcon
              sx={{ fontSize: 18, transform: "rotate(90deg)" }}
            />
          </span>
        </button>

        {/* Refined seller account dropdown */}
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
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                width: 276,
                maxWidth: "calc(100vw - 24px)",
                overflow: "hidden",
                backgroundColor: COLORS.paper,
                color: COLORS.ink,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "12px",
                boxShadow: "0 12px 32px rgba(38, 51, 49, 0.13)",
                "& .MuiList-root": {
                  padding: "7px",
                },
              },
            },
          }}
        >
          {/* Account identity */}
          <Box
            sx={{
              px: 1.5,
              py: 1.8,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              src={avatarUrl}
              sx={{
                width: 44,
                height: 44,
                bgcolor: COLORS.gold,
                color: COLORS.teal,
                border: `1px solid ${COLORS.border}`,
                fontFamily: "Georgia, serif",
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 16,
                  lineHeight: 1.4,
                  fontWeight: 700,
                  color: COLORS.ink,
                  overflowWrap: "anywhere",
                }}
              >
                {displayName}
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: 11,
                  color: "#777E76",
                  overflowWrap: "anywhere",
                }}
              >
                {user?.email || "Manage your seller account"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  display: "inline-block",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.3,
                  color: COLORS.teal,
                  textTransform: "uppercase",
                }}
              >
                {role}
              </Typography>
            </Box>
          </Box>

          <Divider
            sx={{
              mx: 0.5,
              borderColor: COLORS.border,
            }}
          />

          {/* Account navigation */}
          <Box sx={{ py: 0.8 }}>
            <Typography
              sx={{
                px: 1.5,
                pt: 0.4,
                pb: 0.8,
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: 1.5,
                color: COLORS.muted,
                textTransform: "uppercase",
              }}
            >
              Seller workspace
            </Typography>

            {accountLinks.map(({ label, icon: Icon, path }) => (
              <MenuItem
                key={label}
                onClick={() => handleAccountNavigation(path)}
                sx={menuItemSx}
              >
                <Icon className="menu-leading-icon" />
                <span>{label}</span>
                <ChevronRightOutlinedIcon className="menu-trailing-icon" />
              </MenuItem>
            ))}
          </Box>

          <Divider
            sx={{
              mx: 0.5,
              borderColor: COLORS.border,
            }}
          />

          {/* Logout */}
          <Box sx={{ pt: 0.8, pb: 0.2 }}>
            <MenuItem
              onClick={handleLogout}
              sx={{
                ...menuItemSx,
                minHeight: 43,
                color: COLORS.danger,
                fontWeight: 600,

                "&:hover": {
                  backgroundColor: COLORS.dangerHover,
                },

                "& .menu-leading-icon": {
                  fontSize: 19,
                  color: COLORS.danger,
                },
              }}
            >
              <LogoutOutlinedIcon className="menu-leading-icon" />
              <span>Log out</span>
            </MenuItem>
          </Box>
        </Menu>
      </div>
    </header>
  );
}

export default Topbar;
