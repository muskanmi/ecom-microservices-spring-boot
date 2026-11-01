import { useEffect, useRef, useState } from "react";
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
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

import { useNavigate } from "react-router-dom";
import { currentUser } from "../services/authApi";
import { getProducts } from "../services/productApi";
import { getOrders } from "../services/orderApi";
import { getProductImageUrl } from "../services/imageUtils";

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

const MAX_RESULTS_PER_GROUP = 5;

function getProductId(product) {
  return product?.id ?? product?.productId;
}

function getProductName(product) {
  return product?.name || product?.productName || "Unnamed Product";
}

function getProductPrice(product) {
  return product?.price ?? product?.sellingPrice ?? product?.mrp ?? 0;
}

function getProductCategory(product) {
  return (
    product?.categoryName ||
    product?.category ||
    product?.categoryId ||
    "Uncategorized"
  );
}

function getProductImage(product) {
  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;

  const imageValue =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.imageUrl ||
        firstImage?.url ||
        firstImage?.image ||
        firstImage?.filePath ||
        null;

  return imageValue ? getProductImageUrl(imageValue) : "";
}

function getOrderId(order) {
  return order?.id ?? order?.orderId;
}

function getOrderNumber(order) {
  return order?.orderNumber || `ORD-${getOrderId(order)}`;
}

function getOrderTotal(order) {
  return order?.totalAmount ?? order?.total ?? order?.grandTotal ?? 0;
}

function getOrderStatus(order) {
  return order?.status || "PENDING";
}

function getPaymentStatus(order) {
  return order?.paymentStatus || order?.payment?.status || "PENDING";
}

function getCustomerName(order) {
  return order?.customerName || order?.userName || order?.customer?.name || "";
}

function getCustomerEmail(order) {
  return order?.customerEmail || order?.email || order?.userEmail || "";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function Topbar() {
  const navigate = useNavigate();

  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const searchContainerRef = useRef(null);
  const searchCacheLoadedRef = useRef(false);
  const searchRequestRef = useRef(false);

  const accountMenuOpen = Boolean(accountAnchorEl);
  const normalizedQuery = normalize(searchQuery);
  const shouldShowSearch = searchFocused && normalizedQuery.length > 0;

  // Load the current seller.
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await currentUser(token);

        if (!cancelled) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to load seller information:", error);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close search when clicking outside its container.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Fetch products and orders only once, when the user starts searching.
  // Subsequent keystrokes filter the cached results locally.
  useEffect(() => {
    if (normalizedQuery.length < 2 || searchCacheLoadedRef.current) {
      return;
    }

    let cancelled = false;

    async function loadSearchData() {
      // Prevent duplicate requests if the query changes while loading.
      if (searchRequestRef.current) return;

      searchRequestRef.current = true;
      setSearchLoading(true);
      setSearchError("");

      try {
        const [productsResult, ordersResult] = await Promise.allSettled([
          getProducts(),
          getOrders(),
        ]);

        if (cancelled) return;

        const productRequestSucceeded = productsResult.status === "fulfilled";
        const orderRequestSucceeded = ordersResult.status === "fulfilled";

        if (productRequestSucceeded) {
          setProducts(
            Array.isArray(productsResult.value.data)
              ? productsResult.value.data
              : [],
          );
        } else {
          console.error(
            "Failed to load products for search:",
            productsResult.reason,
          );
        }

        if (orderRequestSucceeded) {
          setOrders(
            Array.isArray(ordersResult.value.data)
              ? ordersResult.value.data
              : [],
          );
        } else {
          console.error(
            "Failed to load orders for search:",
            ordersResult.reason,
          );
        }

        if (!productRequestSucceeded && !orderRequestSucceeded) {
          setSearchError("Unable to load search results. Please try again.");
        } else {
          // Cache successful results. If either request failed, allow a
          // later search to retry so results from that resource can load.
          searchCacheLoadedRef.current =
            productRequestSucceeded && orderRequestSucceeded;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Search request failed:", error);
          setSearchError("Unable to load search results. Please try again.");
        }
      } finally {
        searchRequestRef.current = false;

        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }

    loadSearchData();

    return () => {
      cancelled = true;
    };
  }, [normalizedQuery]);

  // Filter products and orders as the user types.
  const matchingProducts =
    normalizedQuery.length < 2
      ? []
      : products
          .filter((product) => {
            const searchableText = [
              getProductName(product),
              product?.description,
              getProductCategory(product),
              getProductId(product),
            ]
              .map(normalize)
              .join(" ");

            return searchableText.includes(normalizedQuery);
          })
          .slice(0, MAX_RESULTS_PER_GROUP);

  const matchingOrders =
    normalizedQuery.length < 2
      ? []
      : orders
          .filter((order) => {
            const searchableText = [
              getOrderId(order),
              getOrderNumber(order),
              getCustomerName(order),
              getCustomerEmail(order),
              getOrderStatus(order),
              getPaymentStatus(order),
            ]
              .map(normalize)
              .join(" ");

            return searchableText.includes(normalizedQuery);
          })
          .slice(0, MAX_RESULTS_PER_GROUP);

  const hasResults = matchingProducts.length > 0 || matchingOrders.length > 0;

  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
    setSearchFocused(true);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setSearchFocused(false);
      event.currentTarget.blur();
    }

    if (event.key === "Enter") {
      if (matchingProducts.length > 0) {
        handleSearchNavigation(
          `/admin/products/${getProductId(matchingProducts[0])}`,
        );
      } else if (matchingOrders.length > 0) {
        handleSearchNavigation(
          `/admin/orders/${getOrderId(matchingOrders[0])}`,
        );
      }
    }
  }

  function handleSearchNavigation(path) {
    setSearchFocused(false);
    setSearchQuery("");
    navigate(path);
  }

  function handleSearchRetry() {
    searchCacheLoadedRef.current = false;
    setSearchError("");

    // Trigger the loading effect again, including when the query is unchanged.
    setSearchQuery("");
    setSearchFocused(true);

    window.setTimeout(() => {
      setSearchQuery((current) => current || "  ");
    }, 0);
  }

  function handleAccountClick(event) {
    setAccountAnchorEl(event.currentTarget);
  }

  function handleAccountClose() {
    setAccountAnchorEl(null);
  }

  function handleAccountNavigation(path) {
    handleAccountClose();
    navigate(path);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    handleAccountClose();
    navigate("/login", { replace: true });
  }

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
      {/* Search bar and autocomplete dropdown */}
      <div
        ref={searchContainerRef}
        className="relative z-30 flex w-full max-w-[560px] items-center"
      >
        <div
          className={`flex w-full items-center gap-3 rounded-t-[6px] px-4 py-2.5 transition-colors ${
            shouldShowSearch ? "bg-white ring-1 ring-[#E4DDCF]" : "bg-[#F3EEE4]"
          }`}
        >
          <SearchOutlinedIcon
            fontSize="small"
            sx={{ color: COLORS.muted, flexShrink: 0 }}
          />

          <InputBase
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search products, orders..."
            inputProps={{
              "aria-label": "Search products and orders",
              "aria-expanded": shouldShowSearch,
              "aria-controls": "seller-search-results",
              autoComplete: "off",
            }}
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

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchFocused(true);
              }}
              aria-label="Clear search"
              className="text-xs font-medium text-[#858A82] hover:text-[#164E4A]"
            >
              Clear
            </button>
          )}
        </div>

        {shouldShowSearch && (
          <div
            id="seller-search-results"
            className="absolute left-0 right-0 top-full max-h-[min(70vh,520px)] overflow-y-auto rounded-b-lg border border-t-0 border-[#E4DDCF] bg-white shadow-[0_14px_35px_rgba(38,51,49,0.15)]"
          >
            {/* Short queries */}
            {normalizedQuery.length < 2 ? (
              <div className="px-5 py-5 text-sm text-[#858A82]">
                Type at least 2 characters to search products and orders.
              </div>
            ) : (
              <>
                {/* Loading */}
                {searchLoading && (
                  <div className="flex items-center gap-3 px-5 py-4 text-sm text-[#68706A]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E4DDCF] border-t-[#164E4A]" />
                    Searching products and orders...
                  </div>
                )}

                {/* Search errors */}
                {!searchLoading && searchError && (
                  <div className="px-5 py-4">
                    <p className="text-sm text-[#A7443C]">{searchError}</p>

                    <button
                      type="button"
                      onClick={handleSearchRetry}
                      className="mt-2 text-sm font-semibold text-[#164E4A] hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Product results */}
                {!searchLoading &&
                  !searchError &&
                  matchingProducts.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between border-b border-[#EEE8DC] bg-[#FFFCF4] px-5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#858A82]">
                          Products
                        </p>

                        <span className="text-xs text-[#858A82]">
                          {matchingProducts.length} found
                        </span>
                      </div>

                      {matchingProducts.map((product) => {
                        const productId = getProductId(product);
                        const imageUrl = getProductImage(product);

                        return (
                          <button
                            key={productId}
                            type="button"
                            onClick={() =>
                              handleSearchNavigation(
                                `/admin/products/${productId}`,
                              )
                            }
                            className="group flex w-full items-center gap-3 border-b border-[#F1ECE3] px-4 py-3 text-left transition-colors hover:bg-[#F8F4EA]"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E4DDCF] bg-[#F7F1E5]">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={getProductName(product)}
                                  className="h-full w-full object-contain p-1"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Inventory2OutlinedIcon
                                  sx={{
                                    fontSize: 22,
                                    color: COLORS.teal,
                                  }}
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#263331] group-hover:text-[#164E4A]">
                                {getProductName(product)}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#858A82]">
                                {getProductCategory(product)}
                                {productId != null ? ` · ID ${productId}` : ""}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-[#164E4A]">
                                {formatCurrency(getProductPrice(product))}
                              </p>
                            </div>

                            <ArrowForwardOutlinedIcon
                              sx={{
                                fontSize: 17,
                                color: "#A6A69C",
                                transition: "transform 160ms ease",
                                ".group:hover &": {
                                  color: COLORS.teal,
                                  transform: "translateX(3px)",
                                },
                              }}
                            />
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() =>
                          handleSearchNavigation("/admin/products")
                        }
                        className="flex w-full items-center justify-center gap-2 border-b border-[#E4DDCF] bg-[#FFFCF4] px-4 py-3 text-xs font-semibold text-[#164E4A] transition hover:bg-[#F3EEE4]"
                      >
                        View product catalogue
                        <ArrowForwardOutlinedIcon sx={{ fontSize: 15 }} />
                      </button>
                    </section>
                  )}

                {/* Order results */}
                {!searchLoading &&
                  !searchError &&
                  matchingOrders.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between border-b border-[#EEE8DC] bg-[#FFFCF4] px-5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#858A82]">
                          Orders
                        </p>

                        <span className="text-xs text-[#858A82]">
                          {matchingOrders.length} found
                        </span>
                      </div>

                      {matchingOrders.map((order) => {
                        const orderId = getOrderId(order);

                        return (
                          <button
                            key={orderId}
                            type="button"
                            onClick={() =>
                              handleSearchNavigation(`/admin/orders/${orderId}`)
                            }
                            className="group flex w-full items-center gap-3 border-b border-[#F1ECE3] px-5 py-3 text-left transition-colors hover:bg-[#F8F4EA]"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E4DDCF] bg-[#F3EEE4]">
                              <ShoppingBagOutlinedIcon
                                sx={{ fontSize: 21, color: COLORS.teal }}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#263331] group-hover:text-[#164E4A]">
                                {getOrderNumber(order)}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#858A82]">
                                {getCustomerName(order) || "Customer"}
                                {getCustomerEmail(order)
                                  ? ` · ${getCustomerEmail(order)}`
                                  : ""}
                              </p>

                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-[#164E4A]">
                                  {formatCurrency(getOrderTotal(order))}
                                </span>

                                <span className="rounded-sm border border-[#E4DDCF] bg-[#FFFCF4] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#68706A]">
                                  {String(getOrderStatus(order)).replace(
                                    /_/g,
                                    " ",
                                  )}
                                </span>
                              </div>
                            </div>

                            <ArrowForwardOutlinedIcon
                              sx={{
                                fontSize: 17,
                                color: "#A6A69C",
                                flexShrink: 0,
                              }}
                            />
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleSearchNavigation("/admin/orders")}
                        className="flex w-full items-center justify-center gap-2 bg-[#FFFCF4] px-4 py-3 text-xs font-semibold text-[#164E4A] transition hover:bg-[#F3EEE4]"
                      >
                        View all orders
                        <ArrowForwardOutlinedIcon sx={{ fontSize: 15 }} />
                      </button>
                    </section>
                  )}

                {/* Empty state */}
                {!searchLoading &&
                  !searchError &&
                  !hasResults &&
                  normalizedQuery.length >= 2 && (
                    <div className="flex flex-col items-center px-6 py-8 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EEE4]">
                        <SearchOffOutlinedIcon
                          sx={{ fontSize: 24, color: COLORS.muted }}
                        />
                      </div>

                      <p className="text-sm font-semibold text-[#263331]">
                        No results found
                      </p>

                      <p className="mt-1 max-w-[280px] text-xs leading-5 text-[#858A82]">
                        We couldn't find products or orders matching "
                        {searchQuery.trim()}".
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleSearchNavigation("/admin/products")
                        }
                        className="mt-4 text-xs font-semibold text-[#164E4A] hover:underline"
                      >
                        Browse product catalogue
                      </button>
                    </div>
                  )}

                {/* Search hint */}
                {!searchLoading && !searchError && hasResults && (
                  <div className="bg-[#FFFCF4] px-5 py-2.5">
                    <p className="text-[10px] text-[#858A82]">
                      Select a result to open its details. Press Esc to close.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
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

        {/* Seller account dropdown */}
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

          <Divider sx={{ mx: 0.5, borderColor: COLORS.border }} />

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

          <Divider sx={{ mx: 0.5, borderColor: COLORS.border }} />

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
