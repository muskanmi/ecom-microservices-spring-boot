import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  ChevronRight,
  Close,
  ConfirmationNumberOutlined,
  CreditCardOutlined,
  FavoriteBorder,
  HelpOutlined,
  Inventory2Outlined,
  KeyboardArrowDown,
  LocalFireDepartment,
  LocationOnOutlined,
  LogoutOutlined,
  Menu as MenuIcon,
  NotificationsNoneOutlined,
  PersonOutlined,
  PlaceOutlined,
  Search,
  SettingsOutlined,
  ShoppingBagOutlined,
  ShoppingCartOutlined,
  StarOutlined,
} from "@mui/icons-material";
/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */
const ROUTES = {
  home: "/dashboard",
  cart: "/cart",
  wishlist: "/wishlist",
  addresses: "/addresses",
  deals: "/deals",
  search: "/search",
  category: (name) => `/products?category=${encodeURIComponent(name)}`,
};
const NAV_CATEGORIES = [
  "Fashion",
  "Electronics",
  "Home & Kitchen",
  "Beauty",
  "Footwear",
  "Accessories",
  "Groceries",
  "Books",
  "Toys & Games",
  "Sports",
];
const MORE_CATEGORIES = [
  "Jewellery",
  "Health & Wellness",
  "Automotive",
  "Pet Supplies",
];
const ACCOUNT_LINKS = [
  { label: "My Profile", icon: PersonOutlined, path: "/profile" },
  { label: "Orders", icon: Inventory2Outlined, path: "/orders" },
  { label: "Wishlist", icon: FavoriteBorder, path: "/wishlist" },
  { label: "Addresses", icon: PlaceOutlined, path: "/addresses" },
  {
    label: "Payment Methods",
    icon: CreditCardOutlined,
    path: "/payment-methods",
  },
  { label: "My Reviews", icon: StarOutlined, path: "/reviews" },
  { label: "Coupons", icon: ConfirmationNumberOutlined, path: "/coupons" },
  {
    label: "Notifications",
    icon: NotificationsNoneOutlined,
    path: "/notifications",
  },
];
const HELP_LINKS = [
  { label: "Account Settings", icon: SettingsOutlined, path: "/settings" },
  { label: "Help & Support", icon: HelpOutlined, path: "/support" },
];
/* -------------------------------------------------------------------------- */
/*  Theme                                                                     */
/* -------------------------------------------------------------------------- */
const c = {
  ink: "#173F3D",
  inkDeep: "#0F2E2D",
  gold: "#E8AA2B",
  cream: "#F8F3E8",
  paper: "#FFFCF4",
  tint: "#F4EFE4",
  muted: "#6B665B",
  border: "#E5DED0",
  danger: "#A7443C",
  flame: "#FF9A3C",
};
const serif = '"Georgia", "Times New Roman", serif';
const API_URL = import.meta.env.VITE_API_URL;
const getProductName = (product) =>
  String(product.name || product.title || "Unnamed product");
const getProductCategory = (product) => {
  if (typeof product.category === "string") {
    return product.category;
  }
  if (product.category && typeof product.category === "object") {
    return (
      product.category.name ||
      product.category.categoryName ||
      product.categoryName ||
      "Other"
    );
  }
  return product.categoryName || "Other";
};
const getProductId = (product) => product.id ?? product.productId;
const getProductPrice = (product) => {
  const rawPrice = product.sellingPrice ?? product.price;
  const price = Number(rawPrice);
  if (!Number.isFinite(price)) {
    return null;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
};
const getProductImage = (product) => {
  const firstImage = Array.isArray(product.images)
    ? product.images[0]
    : undefined;
  if (typeof firstImage === "string") {
    return firstImage;
  }
  if (firstImage && typeof firstImage === "object") {
    return (
      firstImage.imageUrl ||
      firstImage.url ||
      firstImage.image ||
      product.imageUrl ||
      product.image ||
      ""
    );
  }
  return product.imageUrl || product.image || "";
};
const resolveImageUrl = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }
  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};
/* -------------------------------------------------------------------------- */
/*  Navigation button                                                         */
/* -------------------------------------------------------------------------- */
const NavButton = ({ active, icon, endIcon, onClick, children }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      position: "relative",
      flexShrink: 0,
      gap: 0.75,
      px: 1.5,
      height: 44,
      fontSize: 13.5,
      fontWeight: active ? 700 : 500,
      whiteSpace: "nowrap",
      color: active ? "#fff" : "rgba(255,255,255,.88)",
      "& .MuiSvgIcon-root": { fontSize: 20 },
      "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,.08)" },
      "&::after": {
        content: '""',
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 0,
        height: 3,
        borderRadius: "3px 3px 0 0",
        bgcolor: active ? c.gold : "transparent",
      },
    }}
  >
    {icon}
    {children}
    {endIcon}
  </ButtonBase>
);
/* -------------------------------------------------------------------------- */
/*  Header action                                                             */
/* -------------------------------------------------------------------------- */
const HeaderAction = ({ icon, label, count, ariaLabel, onClick }) => (
  <ButtonBase
    onClick={onClick}
    aria-label={ariaLabel}
    sx={{
      gap: 0.9,
      px: 1.25,
      py: 0.75,
      borderRadius: 2,
      color: c.ink,
      "&:hover": { bgcolor: c.tint },
    }}
  >
    <Badge
      badgeContent={count}
      max={99}
      invisible={!count}
      sx={{
        "& .MuiBadge-badge": {
          bgcolor: c.gold,
          color: c.ink,
          fontWeight: 800,
          fontSize: 10,
          minWidth: 18,
          height: 18,
        },
      }}
    >
      {icon}
    </Badge>

    <Typography
      sx={{
        fontSize: 13.5,
        fontWeight: 600,
        display: { xs: "none", md: "block" },
      }}
    >
      {label}
    </Typography>
  </ButtonBase>
);
/* -------------------------------------------------------------------------- */
/*  Drawer components                                                         */
/* -------------------------------------------------------------------------- */
const DrawerSection = ({ title, children }) => (
  <Box sx={{ py: 1 }}>
    <Typography
      sx={{
        px: 2.5,
        pb: 0.75,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: c.muted,
      }}
    >
      {title}
    </Typography>

    {children}
  </Box>
);
const DrawerLink = ({ icon, active, onClick, children }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 1.5,
      px: 2.5,
      py: 1.25,
      textAlign: "left",
      color: c.ink,
      bgcolor: active ? c.tint : "transparent",
      "&:hover": { bgcolor: c.tint },
    }}
  >
    {icon && (
      <Box
        sx={{
          display: "grid",
          color: c.muted,
          "& .MuiSvgIcon-root": { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
    )}

    <Typography
      sx={{
        flex: 1,
        fontSize: 14,
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </Typography>

    <ChevronRight sx={{ fontSize: 20, color: c.muted }} />
  </ButtonBase>
);
/* -------------------------------------------------------------------------- */
/*  Main layout                                                               */
/* -------------------------------------------------------------------------- */
const MainLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount } = useCart();
  const { wishlistItemCount } = useWishlist();
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchFocused, setSearchFocused] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsLoadFailed, setProductsLoadFailed] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const activeCategory = useMemo(
    () => new URLSearchParams(location.search).get("category"),
    [location.search],
  );
  const accountOpen = Boolean(accountAnchor);
  const searchDropdownOpen = searchFocused && searchText.trim().length > 0;
  /* ---------------------------- Load catalogue ---------------------------- */
  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsLoadFailed(false);
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) {
          throw new Error(`Product request failed: ${response.status}`);
        }
        const data = await response.json();
        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.products)
              ? data.products
              : Array.isArray(data?.data)
                ? data.data
                : [];
        if (!cancelled) {
          setProducts(productList);
        }
      } catch (error) {
        console.error("Failed to load products for search suggestions:", error);
        if (!cancelled) {
          setProducts([]);
          setProductsLoadFailed(true);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);
  /* ----------------------- Close suggestions outside ---------------------- */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchFocused(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  /* -------------------------- Search suggestions -------------------------- */
  const availableCategories = useMemo(() => {
    const productCategories = products
      .map((product) => getProductCategory(product))
      .filter((category) => category && category !== "Other");
    return Array.from(
      new Set([...NAV_CATEGORIES, ...MORE_CATEGORIES, ...productCategories]),
    );
  }, [products]);
  const normalizedSearch = searchText.trim().toLowerCase();
  const matchingProducts = useMemo(() => {
    if (!normalizedSearch) return [];
    return products
      .filter((product) => {
        const category = getProductCategory(product);
        if (
          searchCategory !== "All Categories" &&
          category.toLowerCase() !== searchCategory.toLowerCase()
        ) {
          return false;
        }
        const searchableText = [
          getProductName(product),
          product.brand || "",
          product.description || "",
          category,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(normalizedSearch);
      })
      .slice(0, 5);
  }, [products, normalizedSearch, searchCategory]);
  const matchingCategories = useMemo(() => {
    if (!normalizedSearch || searchCategory !== "All Categories") {
      return [];
    }
    return availableCategories
      .filter((category) => category.toLowerCase().includes(normalizedSearch))
      .slice(0, 4);
  }, [availableCategories, normalizedSearch, searchCategory]);
  const go = (path) => {
    setAccountAnchor(null);
    setMoreAnchor(null);
    setDrawerOpen(false);
    setSearchFocused(false);
    navigate(path);
  };
  const handleLogout = () => {
    setAccountAnchor(null);
    setDrawerOpen(false);
    logout();
    navigate("/login", { replace: true });
  };
  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (searchCategory !== "All Categories") {
      params.set("category", searchCategory);
    }
    if ([...params.keys()].length === 0) {
      setSearchFocused(true);
      searchInputRef.current?.focus();
      return;
    }
    setSearchFocused(false);
    navigate(`${ROUTES.search}?${params.toString()}`);
  };

  const handleProductSuggestion = (product) => {
    const productId = getProductId(product);
    console.log(product, productId, "lllllll");

    if (productId == null) {
      console.error("Cannot open product: product ID is missing.", product);
      return;
    }

    setSearchFocused(false);
    navigate(`/products/${encodeURIComponent(productId)}`);
  };

  const handleCategorySuggestion = (category) => {
    setSearchCategory(category);
    setSearchFocused(false);
    navigate(ROUTES.category(category));
  };
  const handleClearSearch = () => {
    setSearchText("");
    setSearchFocused(true);
    searchInputRef.current?.focus();
  };
  /* ------------------------------ Guard states ---------------------------- */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: c.cream,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={28} sx={{ color: c.ink }} />

        <Typography sx={{ fontSize: 13, color: c.muted }}>
          Loading marketplace…
        </Typography>
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const avatarSrc = user.avatarUrl ? `${API_URL}${user.avatarUrl}` : undefined;
  const initial = (user.name || "U").slice(0, 1).toUpperCase();
  const firstName = (user.name || "there").split(" ")[0];
  const deliverTo = user.pincode
    ? [user.city, user.pincode].filter(Boolean).join(" ")
    : "Select address";
  const renderMenuLink = ({ label, icon: Icon, path }) => (
    <MenuItem
      key={label}
      selected={location.pathname === path}
      onClick={() => go(path)}
      sx={{
        minHeight: 40,
        mx: 0.5,
        px: 1.5,
        gap: 1.5,
        borderRadius: "8px",
        color: c.ink,
        fontSize: 13.5,
        fontWeight: 500,
        "&:hover, &.Mui-selected": { bgcolor: "#F1EADD" },
        "&.Mui-selected:hover": { bgcolor: "#EBE2D0" },
      }}
    >
      <Icon sx={{ fontSize: 19, color: c.muted }} />
      {label}
    </MenuItem>
  );
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: c.cream,
        color: c.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
        {/* ---------------------------- Top bar ---------------------------- */}

        <Box
          sx={{
            bgcolor: c.paper,
            borderBottom: `1px solid ${c.border}`,
            px: { xs: 2, sm: 3, xl: 5 },
          }}
        >
          <Box
            sx={{
              maxWidth: 1500,
              mx: "auto",
              display: "flex",
              flexWrap: { xs: "wrap", md: "nowrap" },
              alignItems: "center",
              columnGap: { xs: 1, md: 2.5 },
              rowGap: 1,
              py: { xs: 1.25, md: 1.5 },
            }}
          >
            {/* Logo */}

            <ButtonBase
              onClick={() => go(ROUTES.home)}
              aria-label="Marketplace home"
              sx={{
                order: 1,
                flexShrink: 0,
                gap: 1.25,
                borderRadius: 2,
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  bgcolor: c.ink,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <ShoppingBagOutlined sx={{ color: "#fff", fontSize: 22 }} />
              </Box>

              <Typography
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontFamily: serif,
                  fontSize: { sm: 19, md: 22 },
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  color: c.ink,
                }}
              >
                MARKETPLACE
              </Typography>
            </ButtonBase>

            {/* Deliver to */}

            <ButtonBase
              onClick={() => go(ROUTES.addresses)}
              sx={{
                order: 2,
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
                textAlign: "left",
                borderRadius: 2,
                px: 1,
                py: 0.5,
                "&:hover": { bgcolor: c.tint },
              }}
            >
              <LocationOnOutlined sx={{ color: c.ink }} />

              <Box sx={{ maxWidth: 150 }}>
                <Typography
                  sx={{ fontSize: 11, color: c.muted, lineHeight: 1.2 }}
                >
                  Deliver to
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: c.ink,
                    lineHeight: 1.3,
                  }}
                  noWrap
                >
                  {deliverTo}
                </Typography>
              </Box>

              <KeyboardArrowDown sx={{ fontSize: 18, color: c.ink }} />
            </ButtonBase>

            {/* Search bar and live suggestions */}

            <Box
              ref={searchContainerRef}
              sx={{
                order: { xs: 4, md: 3 },
                position: "relative",
                flex: { xs: "1 1 100%", md: "1 1 auto" },
                maxWidth: { md: 760 },
                minWidth: 0,
                zIndex: searchDropdownOpen ? 1300 : "auto",
              }}
            >
              <Box
                component="form"
                role="search"
                onSubmit={handleSearch}
                sx={{
                  height: 46,
                  display: "flex",
                  alignItems: "stretch",
                  bgcolor: "#fff",
                  border: `1px solid ${searchFocused ? c.ink : c.border}`,
                  borderRadius: searchDropdownOpen ? "8px 8px 0 0" : 2,
                  overflow: "hidden",
                  transition: "border-color .2s, box-shadow .2s",
                  boxShadow: searchFocused
                    ? "0 0 0 3px rgba(23,63,61,.08)"
                    : "none",
                }}
              >
                <Select
                  value={searchCategory}
                  onChange={(event) => setSearchCategory(event.target.value)}
                  variant="standard"
                  inputProps={{ "aria-label": "Search category" }}
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    width: 172,
                    flexShrink: 0,
                    px: 1.5,
                    bgcolor: c.tint,
                    borderRight: `1px solid ${c.border}`,
                    fontSize: 13,
                    color: c.muted,
                    "&:before, &:after": { display: "none" },
                    "& .MuiSelect-select": {
                      py: 0,
                      background: "transparent",
                      "&:focus": { background: "transparent" },
                    },
                  }}
                >
                  {["All Categories", ...availableCategories].map((name) => (
                    <MenuItem key={name} value={name} sx={{ fontSize: 13 }}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>

                <InputBase
                  inputRef={searchInputRef}
                  value={searchText}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setSearchFocused(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setSearchFocused(false);
                    }
                  }}
                  placeholder="Search for products, brands and more..."
                  inputProps={{
                    "aria-label": "Search products",
                    autoComplete: "off",
                  }}
                  startAdornment={
                    <Search sx={{ fontSize: 20, color: c.muted, mr: 1 }} />
                  }
                  sx={{
                    flex: 1,
                    px: 1.75,
                    fontSize: 14,
                    minWidth: 0,
                    color: c.ink,
                  }}
                />

                {searchText && (
                  <ButtonBase
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    sx={{
                      px: 1,
                      flexShrink: 0,
                      color: c.muted,
                      fontSize: 12,
                      "&:hover": { color: c.ink },
                    }}
                  >
                    Clear
                  </ButtonBase>
                )}

                <ButtonBase
                  type="submit"
                  aria-label="Search"
                  sx={{
                    width: 56,
                    flexShrink: 0,
                    bgcolor: c.ink,
                    color: "#fff",
                    "&:hover": { bgcolor: c.inkDeep },
                  }}
                >
                  <Search />
                </ButtonBase>
              </Box>

              {/* Suggestions dropdown */}

              {searchDropdownOpen && (
                <Box
                  role="listbox"
                  aria-label="Search suggestions"
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    bgcolor: c.paper,
                    color: c.ink,
                    border: `1px solid ${c.border}`,
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    boxShadow: "0 14px 35px rgba(23,63,61,.16)",
                    overflow: "hidden",
                    maxHeight: 470,
                    overflowY: "auto",
                    zIndex: 1400,
                  }}
                >
                  {/* Product results heading */}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.25,
                      bgcolor: "#FBF8F0",
                      borderBottom: `1px solid ${c.border}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: ".18em",
                        color: "#8A8F89",
                        textTransform: "uppercase",
                      }}
                    >
                      Products
                    </Typography>

                    <Typography sx={{ fontSize: 11, color: c.muted }}>
                      {productsLoading
                        ? "Loading…"
                        : `${matchingProducts.length} found`}
                    </Typography>
                  </Box>

                  {matchingProducts.map((product, index) => {
                    const image = resolveImageUrl(getProductImage(product));
                    const name = getProductName(product);
                    const category = getProductCategory(product);
                    const price = getProductPrice(product);
                    return (
                      <ButtonBase
                        key={getProductId(product) ?? `${name}-${index}`}
                        role="option"
                        aria-selected={false}
                        onClick={() => handleProductSuggestion(product)}
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 1.5,
                          py: 1.25,
                          textAlign: "left",
                          borderBottom: `1px solid ${c.border}`,
                          bgcolor: "#fff",
                          "&:hover": { bgcolor: "#F8F4EA" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: c.tint,
                            border: `1px solid ${c.border}`,
                            borderRadius: "7px",
                            overflow: "hidden",
                          }}
                        >
                          {image ? (
                            <Box
                              component="img"
                              src={image}
                              alt={name}
                              loading="lazy"
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                p: 0.5,
                              }}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <ShoppingBagOutlined
                              sx={{ fontSize: 24, color: c.ink }}
                            />
                          )}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: "#263331",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {name}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: 12,
                              color: "#858A82",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {category}
                            {getProductId(product) != null
                              ? ` · ID ${getProductId(product)}`
                              : ""}
                          </Typography>

                          {price && (
                            <Typography
                              sx={{
                                mt: 0.25,
                                fontSize: 12,
                                fontWeight: 800,
                                color: c.ink,
                              }}
                            >
                              {price}
                            </Typography>
                          )}
                        </Box>

                        <ArrowForward
                          sx={{
                            fontSize: 18,
                            color: "#A7A79B",
                            flexShrink: 0,
                          }}
                        />
                      </ButtonBase>
                    );
                  })}

                  {/* Category suggestions */}

                  {matchingCategories.length > 0 && (
                    <Box sx={{ borderBottom: `1px solid ${c.border}` }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.1,
                          bgcolor: "#FBF8F0",
                          borderBottom: `1px solid ${c.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: ".18em",
                            color: "#8A8F89",
                            textTransform: "uppercase",
                          }}
                        >
                          Categories
                        </Typography>
                      </Box>

                      {matchingCategories.map((category) => (
                        <ButtonBase
                          key={category}
                          onClick={() => handleCategorySuggestion(category)}
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            px: 2,
                            py: 1.25,
                            textAlign: "left",
                            "&:hover": { bgcolor: "#F8F4EA" },
                          }}
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "#E7F0EC",
                              borderRadius: "7px",
                              color: c.ink,
                            }}
                          >
                            <ShoppingBagOutlined sx={{ fontSize: 19 }} />
                          </Box>

                          <Typography
                            sx={{
                              flex: 1,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {category}
                          </Typography>

                          <ArrowForward
                            sx={{ fontSize: 17, color: "#A7A79B" }}
                          />
                        </ButtonBase>
                      ))}
                    </Box>
                  )}

                  {/* No results */}

                  {!productsLoading &&
                    matchingProducts.length === 0 &&
                    matchingCategories.length === 0 && (
                      <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                        <Search
                          sx={{ fontSize: 26, color: "#A7A79B", mb: 0.5 }}
                        />

                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          No matching products found
                        </Typography>

                        <Typography
                          sx={{ mt: 0.5, fontSize: 12, color: c.muted }}
                        >
                          Try another name or choose a different category.
                        </Typography>

                        {productsLoadFailed && (
                          <Typography
                            sx={{
                              mt: 1,
                              fontSize: 11,
                              color: c.danger,
                            }}
                          >
                            Could not load the catalogue. You can still press
                            Enter to search.
                          </Typography>
                        )}
                      </Box>
                    )}

                  {/* View all search results */}

                  <ButtonBase
                    onClick={handleSearch}
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                      py: 1.4,
                      bgcolor: "#FBF8F0",
                      color: c.ink,
                      fontSize: 12,
                      fontWeight: 800,
                      "&:hover": { bgcolor: c.tint },
                    }}
                  >
                    View all search results
                    <ArrowForward sx={{ fontSize: 17 }} />
                  </ButtonBase>

                  <Box
                    sx={{
                      px: 2,
                      py: 0.9,
                      borderTop: `1px solid ${c.border}`,
                    }}
                  >
                    <Typography sx={{ fontSize: 10, color: "#8A8F89" }}>
                      Select a result or press Enter to view all results.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Header actions */}

            <Box
              sx={{
                order: { xs: 3, md: 4 },
                ml: "auto",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <HeaderAction
                icon={<FavoriteBorder />}
                label="Wishlist"
                ariaLabel="Wishlist"
                count={wishlistItemCount}
                onClick={() => go(ROUTES.wishlist)}
              />

              <HeaderAction
                icon={<ShoppingCartOutlined />}
                label="Cart"
                ariaLabel="Cart"
                count={cartItemCount}
                onClick={() => go(ROUTES.cart)}
              />

              <ButtonBase
                onClick={(event) => setAccountAnchor(event.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Account menu"
                sx={{
                  ml: 0.5,
                  gap: 1.25,
                  pl: 1,
                  pr: 0.75,
                  py: 0.5,
                  borderRadius: 2,
                  textAlign: "left",
                  "&:hover": { bgcolor: c.tint },
                }}
              >
                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: c.ink,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initial}
                </Avatar>

                <Box
                  sx={{ display: { xs: "none", md: "block" }, maxWidth: 130 }}
                >
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: c.ink,
                      lineHeight: 1.25,
                    }}
                    noWrap
                  >
                    {user.name}
                  </Typography>

                  <Typography
                    sx={{ fontSize: 11, color: c.muted, lineHeight: 1.25 }}
                  >
                    Account &amp; Lists
                  </Typography>
                </Box>

                <KeyboardArrowDown
                  sx={{
                    display: { xs: "none", md: "block" },
                    fontSize: 20,
                    color: c.ink,
                    transform: accountOpen ? "rotate(180deg)" : "none",
                    transition: "transform .2s",
                  }}
                />
              </ButtonBase>
            </Box>
          </Box>
        </Box>

        {/* ------------------------- Category nav bar ---------------------- */}

        <Box
          component="nav"
          aria-label="Categories"
          sx={{ bgcolor: c.ink, color: "#fff" }}
        >
          <Box
            sx={{
              maxWidth: 1500,
              mx: "auto",
              px: { xs: 1, sm: 2, xl: 4 },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <NavButton onClick={() => setDrawerOpen(true)} icon={<MenuIcon />}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                All Categories
              </Box>
            </NavButton>

            <Box
              aria-hidden
              sx={{
                width: "1px",
                height: 22,
                mx: 1,
                flexShrink: 0,
                bgcolor: "rgba(255,255,255,.22)",
              }}
            />

            <NavButton
              active={location.pathname === ROUTES.deals}
              onClick={() => go(ROUTES.deals)}
              icon={<LocalFireDepartment sx={{ color: c.flame }} />}
            >
              Today&apos;s Deals
            </NavButton>

            {NAV_CATEGORIES.map((name) => (
              <NavButton
                key={name}
                active={activeCategory === name}
                onClick={() => go(ROUTES.category(name))}
              >
                {name}
              </NavButton>
            ))}

            <NavButton
              onClick={(event) => setMoreAnchor(event.currentTarget)}
              endIcon={<KeyboardArrowDown />}
            >
              More
            </NavButton>
          </Box>
        </Box>
      </Box>

      {/* ------------------------- More categories ------------------------- */}

      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 0.5,
              minWidth: 200,
              bgcolor: c.paper,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              boxShadow: "0 16px 40px rgba(23,63,61,.16)",
            },
          },
        }}
      >
        {MORE_CATEGORIES.map((name) => (
          <MenuItem
            key={name}
            onClick={() => go(ROUTES.category(name))}
            sx={{ fontSize: 13.5, color: c.ink }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>

      {/* --------------------------- Account menu -------------------------- */}

      <Menu
        anchorEl={accountAnchor}
        open={accountOpen}
        onClose={() => setAccountAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              width: 290,
              bgcolor: c.paper,
              color: c.ink,
              border: `1px solid ${c.border}`,
              borderRadius: "14px",
              boxShadow: "0 16px 40px rgba(23,63,61,.16)",
              "& .MuiList-root": { p: 1 },
            },
          },
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            src={avatarSrc}
            sx={{
              width: 44,
              height: 44,
              bgcolor: c.ink,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: c.ink }}
              noWrap
            >
              {user.name}
            </Typography>

            <Typography sx={{ fontSize: 12, color: c.muted }}>
              Customer account
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: c.border, my: 0.5 }} />

        <Typography
          sx={{
            px: 1.5,
            pt: 0.75,
            pb: 0.5,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: c.muted,
          }}
        >
          Your account
        </Typography>

        {ACCOUNT_LINKS.map(renderMenuLink)}

        <Divider sx={{ borderColor: c.border, my: 0.5 }} />

        {HELP_LINKS.map(renderMenuLink)}

        <Divider sx={{ borderColor: c.border, my: 0.5 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            minHeight: 40,
            mx: 0.5,
            px: 1.5,
            gap: 1.5,
            borderRadius: "8px",
            color: c.danger,
            fontSize: 13.5,
            fontWeight: 600,
            "&:hover": { bgcolor: "#F8EAE5" },
          }}
        >
          <LogoutOutlined sx={{ fontSize: 19 }} />
          Log out
        </MenuItem>
      </Menu>

      {/* ------------------------ Categories drawer ------------------------ */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "86vw", sm: 340 },
            maxWidth: 360,
            bgcolor: c.paper,
          },
        }}
      >
        <Box
          sx={{
            bgcolor: c.ink,
            color: "#fff",
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            src={avatarSrc}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "rgba(255,255,255,.16)",
              fontWeight: 700,
            }}
          >
            {initial}
          </Avatar>

          <Typography sx={{ fontSize: 17, fontWeight: 700 }} noWrap>
            Hello, {firstName}
          </Typography>

          <IconButton
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            sx={{ ml: "auto", color: "#fff" }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <DrawerSection title="Shop by category">
            <DrawerLink
              icon={<LocalFireDepartment sx={{ color: c.flame }} />}
              active={location.pathname === ROUTES.deals}
              onClick={() => go(ROUTES.deals)}
            >
              Today&apos;s Deals
            </DrawerLink>

            {[...NAV_CATEGORIES, ...MORE_CATEGORIES].map((name) => (
              <DrawerLink
                key={name}
                active={activeCategory === name}
                onClick={() => go(ROUTES.category(name))}
              >
                {name}
              </DrawerLink>
            ))}
          </DrawerSection>

          <Divider sx={{ borderColor: c.border }} />

          <DrawerSection title="Your account">
            {ACCOUNT_LINKS.map(({ label, icon: Icon, path }) => (
              <DrawerLink
                key={label}
                icon={<Icon />}
                active={location.pathname === path}
                onClick={() => go(path)}
              >
                {label}
              </DrawerLink>
            ))}
          </DrawerSection>

          <Divider sx={{ borderColor: c.border }} />

          <DrawerSection title="Settings & help">
            {HELP_LINKS.map(({ label, icon: Icon, path }) => (
              <DrawerLink
                key={label}
                icon={<Icon />}
                active={location.pathname === path}
                onClick={() => go(path)}
              >
                {label}
              </DrawerLink>
            ))}
          </DrawerSection>
        </Box>

        <Box sx={{ p: 1.5, borderTop: `1px solid ${c.border}` }}>
          <Button
            fullWidth
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            sx={{
              justifyContent: "flex-start",
              color: c.danger,
              textTransform: "none",
              fontWeight: 700,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#F8EAE5" },
            }}
          >
            Log out
          </Button>
        </Box>
      </Drawer>

      {/* ---------------------------- Page content ------------------------- */}

      <Box component="main" sx={{ flex: 1, width: "100%", minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
export default MainLayout;
