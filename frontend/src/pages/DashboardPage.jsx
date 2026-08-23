import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Box,
  Stack,
  Paper,
  Avatar,
  Button,
  IconButton,
  Badge,
  Typography,
  TextField,
  InputAdornment,
  Rating,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
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
  ExpandMore,
  ShoppingBagOutlined,
  HeadphonesOutlined,
  DirectionsRunOutlined,
  AutoAwesomeOutlined,
  ChairOutlined,
  WatchOutlined,
  GridViewOutlined,
  ChevronRight,
  LocalOfferOutlined,
} from "@mui/icons-material";

// Generated assets from the ecommerce-assets ZIP.
// Put them in: src/assets/ecommerce/
import heroBanner from "../assets/ecommerce/banner_hero_img.png";
import fashionDress from "../assets/ecommerce/fashion-dress.png";
import blueHeadphones from "../assets/ecommerce/electronics-headphones-blue.png";
import greenShoes from "../assets/ecommerce/footwear-green-shoe.png";
import lipstick from "../assets/ecommerce/beauty-lipstick.png";
import chair from "../assets/ecommerce/home-kitchen-chair.png";
import handbag from "../assets/ecommerce/accessories-handbag.png";
import smartwatch from "../assets/ecommerce/smartwatch.png";
import runningShoes from "../assets/ecommerce/running-shoes.png";
import blackHandbag from "../assets/ecommerce/black-handbag.png";
import perfume from "../assets/ecommerce/perfume.png";
import blackHeadphones from "../assets/ecommerce/headphones-black.png";
import plant from "../assets/ecommerce/plant.png";

const gold = "#E8AA2B";
const goldDark = "#D99414";
const ink = "#173F3D";
const cream = "#F8F3E8";
const paper = "#FFFCF4";
const muted = "#756F64";
const border = "#E5DED0";

const displayFont = '"Georgia", "Times New Roman", serif';
const monoFont = '"Courier New", Courier, monospace';

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Orders", icon: Inventory2Outlined },
  { label: "Wishlist", icon: FavoriteBorder },
  { label: "Addresses", icon: PlaceOutlined },
  { label: "Payment Methods", icon: CreditCardOutlined },
  { label: "My Reviews", icon: StarOutlined },
  { label: "Coupons", icon: ConfirmationNumberOutlined },
  { label: "Notifications", icon: NotificationsNoneOutlined },
  { label: "Account Settings", icon: SettingsOutlined },
];

const categories = [
  { label: "Fashion", image: fashionDress },
  { label: "Electronics", image: blueHeadphones },
  { label: "Footwear", image: greenShoes },
  { label: "Beauty", image: lipstick },
  { label: "Home & Kitchen", image: chair },
  { label: "Accessories", image: handbag },
  { label: "More", image: plant },
];

const recommended = [
  {
    name: "Noise ColorFit Pro 4",
    sub: "Smart Watch",
    price: 2499,
    mrp: 4999,
    off: "50% off",
    rating: 4.3,
    reviews: "2.1k",
    image: smartwatch,
  },
  {
    name: "Sparx Running Shoes",
    sub: "For Men",
    price: 1799,
    mrp: 3599,
    off: "50% off",
    rating: 4.5,
    reviews: "1.3k",
    image: runningShoes,
  },
  {
    name: "Lavie Women Handbag",
    sub: "Black",
    price: 1299,
    mrp: 2599,
    off: "50% off",
    rating: 4.4,
    reviews: "980",
    image: blackHandbag,
  },
  {
    name: "Bella Vita Luxury Perfume",
    sub: "Eau de Parfum",
    price: 699,
    mrp: 1499,
    off: "53% off",
    rating: 4.2,
    reviews: "889",
    image: perfume,
  },
  {
    name: "boAt Rockerz 450",
    sub: "Headphones",
    price: 1399,
    mrp: 2999,
    off: "53% off",
    rating: 4.3,
    reviews: "1.1k",
    image: blackHeadphones,
  },
];

const recentOrders = [
  {
    id: "ORD-10123",
    date: "May 19, 2025",
    status: "Delivered",
    price: 1299,
    image: blackHandbag,
  },
  {
    id: "ORD-10122",
    date: "May 17, 2025",
    status: "Delivered",
    price: 2499,
    image: smartwatch,
  },
  {
    id: "ORD-10121",
    date: "May 16, 2025",
    status: "Shipped",
    price: 1799,
    image: runningShoes,
  },
];

const topPicks = [
  {
    name: "Minimalist 10% Niacinamide Serum",
    sub: "Beauty",
    price: 299,
    mrp: 599,
    image: lipstick,
  },
  {
    name: "Men Black Cotton T-Shirt",
    sub: "Fashion",
    price: 499,
    mrp: 999,
    image: fashionDress,
  },
];

const overview = [
  { label: "Total Orders", value: 12, icon: Inventory2Outlined },
  { label: "Wishlist Items", value: 8, icon: FavoriteBorder },
  { label: "Saved Addresses", value: 3, icon: PlaceOutlined },
  { label: "Coupons Available", value: 5, icon: ConfirmationNumberOutlined },
];

function rupee(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

const statusColor = {
  Delivered: { bg: "#EAF7EE", fg: "#17834B" },
  Shipped: { bg: "#EEF4FF", fg: "#3267C8" },
};

const DashboardPage = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleWishlist = (name) => {
    console.log(name);

    setWishlist((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    console.log("handle close");

    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={24} sx={{ color: gold }} />
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
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 390,
            p: 4,
            textAlign: "center",
            bgcolor: paper,
            border: `1px solid ${border}`,
            borderRadius: 2.5,
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
            Marketplace · Access Required
          </Typography>
          <Typography
            sx={{
              mt: 1,
              mb: 1,
              fontFamily: displayFont,
              fontSize: 30,
              fontWeight: 700,
              color: ink,
            }}
          >
            You&apos;re not signed in
          </Typography>
          <Typography
            sx={{ color: muted, fontSize: 14, lineHeight: 1.7, mb: 3 }}
          >
            Log in to view your marketplace dashboard.
          </Typography>
          <Button
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              bgcolor: gold,
              color: "#171717",
              fontWeight: 700,
              textTransform: "none",
              py: 1.35,
              borderRadius: 1,
              "&:hover": { bgcolor: goldDark },
            }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: cream, display: "flex", color: ink }}
    >
      {/* Sidebar */}
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
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ px: 0.5, mb: 4 }}
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
            <ShoppingBagOutlined sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: monoFont,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.7,
                color: ink,
              }}
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

        <List sx={{ p: 0 }}>
          {navItems.map(({ label, icon: Icon, active }) => (
            <ListItemButton
              key={label}
              sx={{
                borderRadius: 1.2,
                py: 1,
                mb: 0.35,
                color: active ? "#fff" : ink,
                bgcolor: active ? ink : "transparent",
                "&:hover": { bgcolor: active ? ink : "#F1ECE1" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
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
          ))}
        </List>

        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ borderColor: border, mb: 2.5 }} />
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
              "&:hover": { bgcolor: "#F1ECE1" },
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: paper,
            borderBottom: `1px solid ${border}`,
            px: { xs: 2, sm: 3, xl: 5 },
            py: 1.8,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
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
                  "& fieldset": { border: "none" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 19, color: muted }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ flex: 1 }} />

            <IconButton className="!flex !items-center !gap-2 !rounded-md !text-ink">
              <Badge
                badgeContent={3}
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

            <IconButton className="!flex !items-center !gap-2 !rounded-md !text-ink !mr-4">
              <Badge
                badgeContent={2}
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
                      ? `http://localhost:8080${user.avatarUrl}`
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
                <MenuItem onClick={() => navigate("/profile")}>
                  My Profile
                </MenuItem>

                <MenuItem onClick={() => navigate("/orders")}>
                  My Orders
                </MenuItem>

                <MenuItem onClick={() => navigate("/wishlist")}>
                  Wishlist
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => navigate("/settings")}>
                  Account Settings
                </MenuItem>

                <MenuItem onClick={() => navigate("/support")}>
                  Help & Support
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    handleClose();
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>

        <Box
          component="main"
          sx={{
            maxWidth: 1500,
            mx: "auto",
            px: { xs: 2, sm: 3, xl: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
          {/* Welcome */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontFamily: monoFont,
                fontSize: 10,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                color: muted,
              }}
            >
              Marketplace · Member Dashboard
            </Typography>
            <Typography
              sx={{
                fontFamily: displayFont,
                fontWeight: 700,
                fontSize: { xs: 32, md: 40 },
                lineHeight: 1.1,
                color: "#26231E",
                mt: 0.6,
              }}
            >
              Welcome back, {user.name}
            </Typography>
            <Typography sx={{ color: muted, fontSize: 14, mt: 0.8 }}>
              Discover something you&apos;ll love today.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 330px" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left */}
            <Box sx={{ minWidth: 0 }}>
              {/* Banner */}
              {/* Banner */}
              {/* Hero Banner */}
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  mb: 4,
                  height: { xs: 260, sm: 320, md: 360 },
                  border: `1px solid ${border}`,
                  borderRadius: 2.5,
                  boxShadow: "0 8px 30px rgba(35,31,24,.06)",
                }}
              >
                {/* Full Banner Image */}
                <Box
                  component="img"
                  src={heroBanner}
                  alt="Summer sale"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />

                {/* Left Side Content */}
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    pl: { xs: 3, sm: 5, md: 8 },
                    width: { xs: "65%", sm: "52%", md: "45%" },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 18, sm: 24, md: 28 },
                      fontWeight: 600,
                      color: ink,
                      mb: 1,
                    }}
                  >
                    Summer Sale is Live! ☀️
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: 32, sm: 44, md: 45 },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      color: ink,
                      mb: 1.5,
                    }}
                  >
                    Up to 50% Off
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: 14, sm: 16, md: 18 },
                      color: muted,
                      mb: 3,
                    }}
                  >
                    On fashion, electronics and more
                  </Typography>

                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: gold,
                      color: ink,
                      px: 4,
                      py: 1.4,
                      fontWeight: 700,
                      fontSize: 15,
                      textTransform: "none",
                      borderRadius: 1.5,
                      boxShadow: "none",

                      "&:hover": {
                        bgcolor: gold,
                        opacity: 0.9,
                        boxShadow: "none",
                      },
                    }}
                  >
                    Shop Now
                  </Button>
                </Box>
              </Paper>

              {/* Categories */}
              <Stack
                direction="row"
                sx={{
                  mb: 1.8,
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: monoFont,
                      fontSize: 10,
                      letterSpacing: 1.8,
                      textTransform: "uppercase",
                      color: muted,
                    }}
                  >
                    Explore
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: displayFont,
                      fontSize: 22,
                      fontWeight: 700,
                      color: ink,
                    }}
                  >
                    Shop by Category
                  </Typography>
                </Box>
                <Button
                  endIcon={<ChevronRight sx={{ fontSize: 15 }} />}
                  sx={{
                    color: ink,
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  View all
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(3,1fr)",
                    sm: "repeat(4,1fr)",
                    md: "repeat(7,1fr)",
                  },
                  gap: 1.5,
                  mb: 4,
                }}
              >
                {categories.map(({ label, image }) => (
                  <Box
                    key={label}
                    sx={{ textAlign: "center", cursor: "pointer", minWidth: 0 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        border: `1px solid ${border}`,
                        bgcolor: paper,
                        borderRadius: 2,
                        overflow: "hidden",
                        mb: 1,
                        transition: "transform .2s, box-shadow .2s",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 8px 20px rgba(35,31,24,.08)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={image}
                        alt={label}
                        sx={{
                          width: "100%",
                          height: 82,
                          objectFit: "contain",
                          display: "block",
                          p: 0.8,
                        }}
                      />
                    </Paper>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: ink,
                        lineHeight: 1.25,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Recommended */}
              <Stack
                direction="row"
                sx={{
                  mb: 1.8,
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: monoFont,
                      fontSize: 10,
                      letterSpacing: 1.8,
                      textTransform: "uppercase",
                      color: muted,
                    }}
                  >
                    For you
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: displayFont,
                      fontSize: 22,
                      fontWeight: 700,
                      color: ink,
                    }}
                  >
                    Recommended for You
                  </Typography>
                </Box>
                <Button
                  endIcon={<ChevronRight sx={{ fontSize: 15 }} />}
                  sx={{
                    color: ink,
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  View all
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2,minmax(0,1fr))",
                    sm: "repeat(3,minmax(0,1fr))",
                    md: "repeat(5,minmax(0,1fr))",
                  },
                  gap: 1.8,
                }}
              >
                {recommended.map((product) => (
                  <Paper
                    key={product.name}
                    elevation={0}
                    sx={{
                      p: 1.2,
                      overflow: "hidden",
                      border: `1px solid ${border}`,
                      borderRadius: 2.5,
                      bgcolor: paper,
                      transition: "transform .2s, box-shadow .2s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 12px 28px rgba(35,31,24,.10)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        bgcolor: "#F3EFE7",
                        borderRadius: 1.5,
                        overflow: "hidden",
                        mb: 1.3,
                      }}
                    >
                      <Box
                        component="img"
                        src={product.image}
                        alt={product.name}
                        sx={{
                          display: "block",
                          width: "100%",
                          height: 165,
                          objectFit: "contain",
                          p: 1,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => toggleWishlist(product.name)}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 30,
                          height: 30,
                          bgcolor: "rgba(255,252,244,.94)",
                          color: wishlist.includes(product.name)
                            ? "#C84B55"
                            : ink,
                          "&:hover": { bgcolor: "#FFFCF4" },
                        }}
                      >
                        <FavoriteBorder sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: ink,
                        lineHeight: 1.35,
                        minHeight: 35,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: muted, mt: 0.35 }}>
                      {product.sub}
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="baseline"
                      spacing={0.7}
                      sx={{ mt: 0.8 }}
                    >
                      <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                        {rupee(product.price)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 10,
                          color: muted,
                          textDecoration: "line-through",
                        }}
                      >
                        {rupee(product.mrp)}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#17834B",
                        fontWeight: 700,
                        mt: 0.2,
                      }}
                    >
                      {product.off}
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ mt: 0.4 }}
                    >
                      <Rating
                        value={product.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{
                          fontSize: 14,
                          "& .MuiRating-iconFilled": { color: gold },
                        }}
                      />
                      <Typography sx={{ fontSize: 9.5, color: muted }}>
                        {product.rating} ({product.reviews})
                      </Typography>
                    </Stack>

                    <Button
                      fullWidth
                      startIcon={<ShoppingCartOutlined sx={{ fontSize: 14 }} />}
                      sx={{
                        mt: 1.2,
                        bgcolor: gold,
                        color: "#171717",
                        fontWeight: 800,
                        fontSize: 11,
                        textTransform: "none",
                        borderRadius: 1,
                        py: 0.85,
                        "&:hover": { bgcolor: goldDark },
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* Right */}
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${border}`,
                  borderRadius: 2.5,
                  bgcolor: paper,
                  boxShadow: "0 8px 30px rgba(35,31,24,.06)",
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
                  Your account
                </Typography>
                <Typography
                  sx={{
                    fontFamily: displayFont,
                    fontWeight: 700,
                    fontSize: 22,
                    mt: 0.4,
                    mb: 2,
                  }}
                >
                  Account Overview
                </Typography>

                <Stack spacing={1.5} width="100%">
                  {overview.map(({ label, value, icon: Icon }) => (
                    <Stack
                      key={label}
                      direction="row"
                      sx={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Icon sx={{ fontSize: 18, color: muted }} />
                        <Typography sx={{ fontSize: 13, color: "#4D4941" }}>
                          {label}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          fontFamily: monoFont,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    bgcolor: "#EDF7EE",
                    color: "#176B40",
                    borderRadius: 1.5,
                    px: 1.4,
                    py: 1.2,
                    mt: 2.2,
                  }}
                >
                  <LocalOfferOutlined sx={{ fontSize: 17 }} />
                  <Typography sx={{ fontSize: 12.5, lineHeight: 1.4 }}>
                    You&apos;re saving with us.
                    <br />
                    <Box component="span" sx={{ fontWeight: 800 }}>
                      ₹1,250 saved in total
                    </Box>
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${border}`,
                  borderRadius: 2.5,
                  bgcolor: paper,
                  boxShadow: "0 8px 30px rgba(35,31,24,.06)",
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    mb: 2,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: monoFont,
                        fontSize: 10,
                        letterSpacing: 1.8,
                        textTransform: "uppercase",
                        color: muted,
                      }}
                    >
                      Activity
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: displayFont,
                        fontWeight: 700,
                        fontSize: 21,
                        mt: 0.3,
                      }}
                    >
                      Recent Orders
                    </Typography>
                  </Box>
                  <Button
                    sx={{
                      p: 0,
                      color: ink,
                      textTransform: "none",
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 0,
                    }}
                  >
                    View all
                  </Button>
                </Stack>

                <Stack spacing={1.8}>
                  {recentOrders.map((order) => (
                    <Stack
                      key={order.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.2}
                    >
                      <Box
                        component="img"
                        src={order.image}
                        alt=""
                        sx={{
                          width: 46,
                          height: 46,
                          objectFit: "contain",
                          bgcolor: "#F3EFE7",
                          borderRadius: 1.2,
                          p: 0.4,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: monoFont,
                            fontSize: 10,
                            fontWeight: 700,
                            color: ink,
                          }}
                          noWrap
                        >
                          {order.id}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 10.5, color: muted, mt: 0.3 }}
                        >
                          {order.date}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 9,
                            fontWeight: 700,
                            bgcolor: statusColor[order.status].bg,
                            color: statusColor[order.status].fg,
                            "& .MuiChip-label": { px: 0.8 },
                          }}
                        />
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 800, mt: 0.35 }}
                        >
                          {rupee(order.price)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${border}`,
                  borderRadius: 2.5,
                  bgcolor: paper,
                  boxShadow: "0 8px 30px rgba(35,31,24,.06)",
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
                  A little extra
                </Typography>
                <Typography
                  sx={{
                    fontFamily: displayFont,
                    fontWeight: 700,
                    fontSize: 21,
                    mt: 0.3,
                    mb: 2,
                  }}
                >
                  Top Picks for You
                </Typography>

                <Stack spacing={1.8}>
                  {topPicks.map((product) => (
                    <Stack
                      key={product.name}
                      direction="row"
                      alignItems="center"
                      spacing={1.2}
                    >
                      <Box
                        component="img"
                        src={product.image}
                        alt={product.name}
                        sx={{
                          width: 70,
                          height: 70,
                          objectFit: "contain",
                          bgcolor: "#F3EFE7",
                          borderRadius: 1.2,
                          p: 0.6,
                          flexShrink: 0,
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: ink,
                            lineHeight: 1.35,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 10,
                            color: muted,
                            mt: 0.2,
                          }}
                        >
                          {product.sub}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.6}
                          alignItems="baseline"
                          sx={{ mt: 0.3 }}
                        >
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {rupee(product.price)}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 9.5,
                              color: muted,
                              textDecoration: "line-through",
                            }}
                          >
                            {rupee(product.mrp)}
                          </Typography>
                        </Stack>
                      </Box>

                      <Button
                        variant="outlined"
                        className="!min-w-[72px] !h-[42px] !px-4 !border-[1.5px] !border-gold !text-ink !text-xs !font-bold !normal-case !rounded-md !shrink-0 hover:!border-gold hover:!bg-gold/10"
                      >
                        Add
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
