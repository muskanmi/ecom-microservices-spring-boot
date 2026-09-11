import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Box,
  Stack,
  Avatar,
  Button,
  IconButton,
  Badge,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

import {
  Home,
  Inventory2Outlined,
  FavoriteBorder,
  PlaceOutlined,
  CreditCardOutlined,
  StarOutlined,
  ConfirmationNumberOutlined,
  NotificationsNoneOutlined,
  SettingsOutlined,
  LogoutOutlined,
  Search,
  ShoppingCartOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";

// --------------------------------------------------
// Theme constants
// --------------------------------------------------

const gold = "#E8AA2B";
const ink = "#173F3D";
const cream = "#F8F3E8";
const paper = "#FFFCF4";
const muted = "#756F64";
const border = "#E5DED0";

const monoFont = '"Courier New", Courier, monospace';

// --------------------------------------------------
// Sidebar navigation
// --------------------------------------------------

const navItems = [
  {
    label: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Orders",
    icon: Inventory2Outlined,
    path: "/orders",
  },
  {
    label: "Wishlist",
    icon: FavoriteBorder,
    path: "/wishlist",
  },
  {
    label: "Addresses",
    icon: PlaceOutlined,
    path: "/addresses",
  },
  {
    label: "Payment Methods",
    icon: CreditCardOutlined,
    path: "/payment-methods",
  },
  {
    label: "My Reviews",
    icon: StarOutlined,
    path: "/reviews",
  },
  {
    label: "Coupons",
    icon: ConfirmationNumberOutlined,
    path: "/coupons",
  },
  {
    label: "Notifications",
    icon: NotificationsNoneOutlined,
    path: "/notifications",
  },
  {
    label: "Account Settings",
    icon: SettingsOutlined,
    path: "/settings",
  },
];

// --------------------------------------------------
// Main Layout
// --------------------------------------------------

const MainLayout = () => {
  const { user, logout, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  // --------------------------------------------------
  // Avatar menu
  // --------------------------------------------------

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: monoFont,
            fontSize: 10,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          Loading marketplace
        </Typography>
      </Box>
    );
  }

  // --------------------------------------------------
  // Not authenticated
  // --------------------------------------------------

  if (!user) {
    navigate("/login");
    return null;
  }

  // --------------------------------------------------
  // Layout
  // --------------------------------------------------

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: cream,
        display: "flex",
        color: ink,
      }}
    >
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "flex" },
          width: 245,
          flexShrink: 0,
          flexDirection: "column",
          bgcolor: paper,
          borderRight: `1px solid ${border}`,
          px: 2.5,
          py: 3,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Marketplace Logo */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            px: 0.5,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              bgcolor: ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBagOutlined
              sx={{
                color: "#fff",
                fontSize: 18,
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: monoFont,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.7,
                color: ink,
                cursor: "pointer",
              }}
              onClick={navigate("/dashboard")}
            >
              MARKETPLACE
            </Typography>

            <Typography
              sx={{
                fontFamily: monoFont,
                fontSize: 8.5,
                letterSpacing: 1.2,
                color: muted,
                mt: 0.4,
              }}
            >
              EVERYDAY SHOPPING
            </Typography>
          </Box>
        </Stack>

        {/* My Account */}

        <Typography
          sx={{
            fontFamily: monoFont,
            fontSize: 10,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: muted,
            px: 1,
            mb: 1.2,
          }}
        >
          My account
        </Typography>

        {/* Navigation */}

        <List sx={{ p: 0 }}>
          {navItems.map(({ label, icon: Icon, path }) => {
            const active =
              location.pathname === path ||
              (path === "/dashboard" &&
                location.pathname.startsWith("/products"));

            return (
              <ListItemButton
                key={label}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 1.2,
                  py: 1,
                  mb: 0.35,
                  color: active ? "#fff" : ink,
                  bgcolor: active ? ink : "transparent",

                  "&:hover": {
                    bgcolor: active ? ink : "#F1ECE1",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: "inherit",
                  }}
                >
                  <Icon sx={{ fontSize: 19 }} />
                </ListItemIcon>

                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Logout */}

        <Box sx={{ mt: "auto" }}>
          <Divider
            sx={{
              borderColor: border,
              mb: 2.5,
            }}
          />

          <Button
            fullWidth
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            sx={{
              justifyContent: "flex-start",
              color: ink,
              textTransform: "none",
              fontWeight: 600,
              px: 1.5,
              py: 1,
              borderRadius: 1.2,

              "&:hover": {
                bgcolor: "#F1ECE1",
              },
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <Box
          component="header"
          sx={{
            bgcolor: paper,
            borderBottom: `1px solid ${border}`,
            px: {
              xs: 2,
              sm: 3,
              xl: 5,
            },
            py: 1.8,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Search */}

            <TextField
              fullWidth
              placeholder="Search for products, brands and more..."
              size="small"
              sx={{
                maxWidth: 650,

                "& .MuiOutlinedInput-root": {
                  bgcolor: "#F4EFE4",
                  borderRadius: 1,
                  fontSize: 13,
                  height: 42,

                  "& fieldset": {
                    border: "none",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        fontSize: 19,
                        color: muted,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Spacer */}

            <Box sx={{ flex: 1 }} />

            {/* Wishlist */}

            <IconButton
              onClick={() => navigate("/wishlist")}
              className="!flex !items-center !gap-2 !rounded-md !text-ink"
            >
              <Badge
                badgeContent={0}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: gold,
                    color: ink,
                    fontSize: 9,
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <FavoriteBorder />
              </Badge>

              <span className="text-sm font-medium">Wishlist</span>
            </IconButton>

            {/* Cart */}

            <IconButton
              onClick={() => navigate("/cart")}
              className="!flex !items-center !gap-2 !rounded-md !text-ink !mr-4"
            >
              <Badge
                badgeContent={0}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: gold,
                    color: ink,
                    fontSize: 9,
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <ShoppingCartOutlined />
              </Badge>

              <span className="text-sm font-medium">Cart</span>
            </IconButton>

            {/* User */}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                ml: 0.5,
                alignItems: "center",
              }}
            >
              <Box
                onClick={handleAvatarClick}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gray-100"
              >
                <Avatar
                  src={
                    user.avatarUrl
                      ? `http://localhost:8081${user.avatarUrl}`
                      : undefined
                  }
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: ink,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {(user.name || "U").slice(0, 1).toUpperCase()}
                </Avatar>

                <Box className="hidden sm:block">
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: ink,
                    }}
                  >
                    {user.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 8,
                      color: muted,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    Customer
                  </Typography>
                </Box>

                <KeyboardArrowDown
                  sx={{
                    color: ink,
                    fontSize: 20,
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </Box>

              {/* User Dropdown */}

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/profile");
                  }}
                >
                  My Profile
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/orders");
                  }}
                >
                  My Orders
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/wishlist");
                  }}
                >
                  Wishlist
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/settings");
                  }}
                >
                  Account Settings
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/support");
                  }}
                >
                  Help & Support
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <Box
          component="main"
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
