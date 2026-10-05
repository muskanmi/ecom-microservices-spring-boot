import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  CheckCircleOutlineRounded,
  ChevronRightRounded,
  Inventory2Outlined,
  LocalShippingOutlined,
  PaymentRounded,
  SearchRounded,
  ShoppingBagOutlined,
  TaskAltRounded,
  CancelOutlined,
  ReplayRounded,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getOrders, cancelOrder } from "../api/orderApi";
import { getImageUrl } from "../utils/imageUrl";

const COLORS = {
  ink: "#173F3D",
  inkDark: "#103331",
  gold: "#E8AA2B",
  goldDark: "#D59418",
  cream: "#F7F1E7",
  paper: "#FFFCF5",
  white: "#FFFFFF",
  muted: "#756F64",
  border: "#E5DDD0",
  softGreen: "#E9F6EF",
  green: "#16824A",
  softGold: "#FFF4D8",
  softBlue: "#EDF4FF",
  blue: "#3569C8",
  softRed: "#FFF0F0",
  red: "#C83D3D",
  softPurple: "#F2ECFF",
  purple: "#6C47B8",
  softGray: "#F1EFEB",
};

const FILTERS = [
  { key: "ALL", label: "All Orders" },
  { key: "PENDING_PAYMENT", label: "Pending Payment" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await getOrders(token, user.id);

        setOrders(response.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your orders. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter((order) => order.status === "PENDING_PAYMENT")
        .length,

      active: orders.filter((order) =>
        ["CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status),
      ).length,

      completed: orders.filter((order) => order.status === "DELIVERED").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "ALL" || order.status === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const orderNumber = (order.orderNumber || "").toLowerCase();

      const productNames = (order.items || [])
        .map((item) => item.productName || "")
        .join(" ")
        .toLowerCase();

      return orderNumber.includes(query) || productNames.includes(query);
    });
  }, [orders, activeFilter, search]);

  const handleOpenCancelDialog = (order) => {
    setCancelError("");
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    if (cancellingOrder) {
      return;
    }

    setCancelDialogOpen(false);
    setOrderToCancel(null);
    setCancelError("");
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !user?.id) {
      return;
    }

    try {
      setCancellingOrder(true);
      setCancelError("");

      const token = localStorage.getItem("token");

      const response = await cancelOrder(orderToCancel.id, token, user.id);

      const updatedOrder = response.data;

      /*
       * Update the order directly in the list.
       * No full page refresh required.
       */
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );

      /*
       * If this order was also the active checkout order,
       * remove it from sessionStorage.
       */
      const checkoutOrderId = sessionStorage.getItem("checkoutOrderId");

      if (checkoutOrderId === String(updatedOrder.id)) {
        sessionStorage.removeItem("checkoutOrderId");
      }

      setCancelDialogOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error("Failed to cancel order:", error);

      setCancelError(
        error.response?.data?.message || "Unable to cancel this order.",
      );
    } finally {
      setCancellingOrder(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.cream,
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress
            size={34}
            thickness={4}
            sx={{ color: COLORS.ink }}
          />

          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: 14,
            }}
          >
            Loading your orders...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "75vh",
          backgroundColor: COLORS.cream,
          px: { xs: 2, md: 5 },
          py: 5,
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              border: "1px solid #F1CCCC",
              backgroundColor: COLORS.white,
            }}
          >
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: COLORS.cream,
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "flex-end",
            },
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: COLORS.muted,
                mb: 0.8,
              }}
            >
              Marketplace · Your Account
            </Typography>

            <Typography
              sx={{
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: {
                  xs: 34,
                  md: 42,
                },
                lineHeight: 1.08,
                fontWeight: 700,
                color: COLORS.ink,
              }}
            >
              My Orders
            </Typography>

            <Typography
              sx={{
                color: COLORS.muted,
                mt: 1,
                fontSize: 14,
              }}
            >
              Keep track of purchases, payments and deliveries.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<ShoppingBagOutlined />}
            onClick={() => navigate("/")}
            sx={{
              px: 2.2,
              py: 1.1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: COLORS.ink,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: COLORS.inkDark,
                boxShadow: "none",
              },
            }}
          >
            Continue Shopping
          </Button>
        </Box>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(4, 1fr)",
            },
            gap: 1.5,
            mb: 3,
          }}
        >
          <SummaryCard
            icon={<Inventory2Outlined />}
            label="Total Orders"
            value={stats.total}
            accent={COLORS.ink}
          />

          <SummaryCard
            icon={<PaymentRounded />}
            label="Pending Payment"
            value={stats.pending}
            accent={COLORS.goldDark}
          />

          <SummaryCard
            icon={<LocalShippingOutlined />}
            label="Active Orders"
            value={stats.active}
            accent={COLORS.blue}
          />

          <SummaryCard
            icon={<CheckCircleOutlineRounded />}
            label="Completed"
            value={stats.completed}
            accent={COLORS.green}
          />
        </Box>

        {/* =====================================================
            FILTER / SEARCH BAR
        ===================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.paper,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
          >
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order number or product..."
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: COLORS.muted,
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: {
                  md: 360,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: COLORS.white,

                  "& fieldset": {
                    borderColor: COLORS.border,
                  },

                  "&:hover fieldset": {
                    borderColor: "#C9BDAA",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: COLORS.ink,
                  },
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.key;

                return (
                  <Button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    size="small"
                    sx={{
                      borderRadius: 99,
                      px: 1.6,
                      py: 0.7,
                      minWidth: "auto",
                      textTransform: "none",
                      fontWeight: active ? 700 : 600,
                      color: active ? COLORS.white : COLORS.muted,
                      backgroundColor: active ? COLORS.ink : COLORS.white,
                      border: `1px solid ${
                        active ? COLORS.ink : COLORS.border
                      }`,

                      "&:hover": {
                        backgroundColor: active ? COLORS.inkDark : "#F4EEE3",
                        borderColor: active ? COLORS.inkDark : "#D4C8B6",
                      },
                    }}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </Box>
          </Stack>
        </Paper>

        {/* =====================================================
            NO ORDERS
        ===================================================== */}

        {orders.length === 0 ? (
          <EmptyOrders onShop={() => navigate("/")} />
        ) : filteredOrders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              py: 7,
              px: 3,
              textAlign: "center",
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.paper,
            }}
          >
            <SearchRounded
              sx={{
                fontSize: 46,
                color: "#B4AA9C",
                mb: 1.5,
              }}
            />

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: COLORS.ink,
              }}
            >
              No matching orders
            </Typography>

            <Typography
              sx={{
                color: COLORS.muted,
                mt: 0.7,
                mb: 2.5,
              }}
            >
              Try another search or choose a different filter.
            </Typography>

            <Button
              variant="outlined"
              onClick={() => {
                setSearch("");
                setActiveFilter("ALL");
              }}
              sx={{
                borderColor: COLORS.ink,
                color: COLORS.ink,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,

                "&:hover": {
                  borderColor: COLORS.inkDark,
                  backgroundColor: "#F0EADF",
                },
              }}
            >
              Clear Filters
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2.2}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDetails={() => navigate(`/orders/${order.id}`)}
                onCancel={handleOpenCancelDialog}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* =====================================================
          CANCEL ORDER CONFIRMATION DIALOG
      ===================================================== */}

      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: COLORS.paper,
            border: `1px solid ${COLORS.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: COLORS.ink,
            fontWeight: 800,
            fontSize: 20,
            pb: 1,
          }}
        >
          Cancel this order?
        </DialogTitle>

        <DialogContent>
          {cancelError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {cancelError}
            </Alert>
          )}

          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {orderToCancel?.status === "CONFIRMED" &&
            orderToCancel?.paymentStatus === "PAID"
              ? "This order has already been paid. Your payment will be refunded to the original payment method after cancellation."
              : "Are you sure you want to cancel this order?"}
          </Typography>

          {orderToCancel && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F3E8",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.ink,
                }}
              >
                {orderToCancel.orderNumber}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: COLORS.muted,
                }}
              >
                Total: ₹
                {Number(orderToCancel.totalAmount || 0).toLocaleString("en-IN")}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseCancelDialog}
            disabled={cancellingOrder}
            sx={{
              color: COLORS.ink,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,

              "&:hover": {
                backgroundColor: "#F3EDE2",
              },
            }}
          >
            Keep Order
          </Button>

          <Button
            variant="contained"
            startIcon={!cancellingOrder ? <CancelOutlined /> : undefined}
            onClick={handleCancelOrder}
            disabled={cancellingOrder || !orderToCancel}
            sx={{
              minWidth: 140,
              py: 1,
              px: 2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              backgroundColor: COLORS.red,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#A92F2F",
                boxShadow: "none",
              },

              "&:disabled": {
                backgroundColor: "#D7A0A0",
                color: COLORS.white,
              },
            }}
          >
            {cancellingOrder ? (
              <CircularProgress
                size={20}
                thickness={4}
                sx={{
                  color: COLORS.white,
                }}
              />
            ) : (
              "Cancel Order"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({ icon, label, value, accent }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 1.5,
          sm: 2,
        },
        borderRadius: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.paper,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 1.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          backgroundColor: `${accent}14`,
          mb: 1.2,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 11,
          color: COLORS.muted,
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: {
            xs: 22,
            sm: 25,
          },
          fontWeight: 800,
          color: COLORS.ink,
          mt: 0.2,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

/* ============================================================
   ORDER CARD
============================================================ */

function OrderCard({ order, onDetails, onCancel }) {
  const itemCount = (order.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const visibleItems = (order.items || []).slice(0, 2);
  const remainingItems = Math.max((order.items || []).length - 2, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.paper,
        transition:
          "transform .18s ease, box-shadow .18s ease, border-color .18s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#D5C8B5",
          boxShadow: "0 12px 32px rgba(52, 45, 35, 0.08)",
        },
      }}
    >
      {/* TOP */}
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 2.5,
          },
          py: 2,
          backgroundColor: "#FBF7EE",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.3} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.ink,
                color: COLORS.white,
              }}
            >
              <ShoppingBagOutlined fontSize="small" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontWeight: 700,
                  fontSize: 12,
                  color: COLORS.ink,
                }}
              >
                {order.orderNumber}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: COLORS.muted,
                  mt: 0.2,
                }}
              >
                {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={0.8}>
            <StatusChip status={order.status} />

            <PaymentChip paymentStatus={order.paymentStatus} />
          </Stack>
        </Stack>
      </Box>

      {/* ITEMS */}
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 2.5,
          },
          py: 2.3,
        }}
      >
        <Stack spacing={1.8}>
          {visibleItems.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.8,
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: 60,
                    sm: 68,
                  },
                  height: {
                    xs: 60,
                    sm: 68,
                  },
                  flexShrink: 0,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F3EEE5",
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(item.productImage)}
                  alt={item.productName}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    p: 0.5,
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#27231E",
                  }}
                  noWrap
                >
                  {item.productName}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: COLORS.muted,
                    mt: 0.4,
                  }}
                >
                  Qty: {item.quantity}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 800,
                  color: COLORS.ink,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                ₹{Number(item.totalPrice).toLocaleString("en-IN")}
              </Typography>
            </Box>
          ))}

          {remainingItems > 0 && (
            <Typography
              sx={{
                color: COLORS.muted,
                fontSize: 12,
                pl: 0.5,
              }}
            >
              + {remainingItems} more {remainingItems === 1 ? "item" : "items"}
            </Typography>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* FOOTER */}
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 2.5,
          },
          py: 1.7,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={2.5}>
            <Box>
              <Typography
                sx={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: COLORS.muted,
                }}
              >
                Items
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  mt: 0.2,
                }}
              >
                {itemCount}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: COLORS.muted,
                }}
              >
                Total
              </Typography>

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: COLORS.ink,
                  mt: 0.2,
                }}
              >
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            {isCancellableOrder(order) && (
              <Button
                variant="outlined"
                startIcon={<CancelOutlined />}
                onClick={() => onCancel(order)}
                sx={{
                  minWidth: {
                    sm: 145,
                  },
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  color: COLORS.red,
                  borderColor: "#E3A8A8",
                  backgroundColor: COLORS.white,

                  "&:hover": {
                    borderColor: COLORS.red,
                    backgroundColor: COLORS.softRed,
                  },
                }}
              >
                Cancel Order
              </Button>
            )}

            <Button
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              onClick={onDetails}
              sx={{
                minWidth: {
                  sm: 155,
                },
                py: 1,
                px: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: COLORS.gold,
                color: "#2C271F",
                boxShadow: "none",

                "&:hover": {
                  backgroundColor: COLORS.goldDark,
                  boxShadow: "none",
                },
              }}
            >
              View Details
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

/* ============================================================
   STATUS CHIP
============================================================ */

function StatusChip({ status }) {
  const styles = getOrderStatusStyle(status);

  return (
    <Chip
      icon={styles.icon}
      label={formatStatus(status)}
      size="small"
      sx={{
        height: 27,
        borderRadius: 99,
        fontWeight: 700,
        fontSize: 11,
        color: styles.color,
        backgroundColor: styles.background,
        border: `1px solid ${styles.border}`,

        "& .MuiChip-icon": {
          color: styles.color,
          fontSize: 16,
        },

        "& .MuiChip-label": {
          px: 1,
        },
      }}
    />
  );
}

/* ============================================================
   PAYMENT CHIP
============================================================ */

function PaymentChip({ paymentStatus }) {
  const styles = getPaymentStatusStyle(paymentStatus);

  return (
    <Chip
      label={`Payment: ${formatStatus(paymentStatus)}`}
      size="small"
      sx={{
        height: 27,
        borderRadius: 99,
        fontWeight: 700,
        fontSize: 11,
        color: styles.color,
        backgroundColor: styles.background,
        border: `1px solid ${styles.border}`,
      }}
    />
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyOrders({ onShop }) {
  return (
    <Paper
      elevation={0}
      sx={{
        textAlign: "center",
        py: 8,
        px: 3,
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.paper,
      }}
    >
      <Box
        sx={{
          width: 74,
          height: 74,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F1E9DB",
          color: COLORS.ink,
          mx: "auto",
          mb: 2,
        }}
      >
        <ShoppingBagOutlined sx={{ fontSize: 34 }} />
      </Box>

      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 800,
          color: COLORS.ink,
        }}
      >
        Your order list is empty
      </Typography>

      <Typography
        sx={{
          color: COLORS.muted,
          mt: 0.8,
          mb: 3,
        }}
      >
        Once you place an order, you'll find it here.
      </Typography>

      <Button
        variant="contained"
        onClick={onShop}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 3,
          py: 1.1,
          fontWeight: 700,
          backgroundColor: COLORS.ink,
          boxShadow: "none",

          "&:hover": {
            backgroundColor: COLORS.inkDark,
            boxShadow: "none",
          },
        }}
      >
        Start Shopping
      </Button>
    </Paper>
  );
}

function isCancellableOrder(order) {
  if (!order) {
    return false;
  }

  if (order.status === "CANCELLED") {
    return false;
  }

  return (
    (order.status === "PENDING_PAYMENT" && order.paymentStatus === "PENDING") ||
    (order.status === "CONFIRMED" && order.paymentStatus === "PAID")
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status) {
  if (!status) {
    return "";
  }

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getOrderStatusStyle(status) {
  switch (status) {
    case "CONFIRMED":
      return {
        color: COLORS.green,
        background: COLORS.softGreen,
        border: "#C9E8D6",
        icon: <TaskAltRounded />,
      };

    case "SHIPPED":
      return {
        color: COLORS.blue,
        background: COLORS.softBlue,
        border: "#CEDDF6",
        icon: <LocalShippingOutlined />,
      };

    case "OUT_FOR_DELIVERY":
      return {
        color: "#A16A00",
        background: COLORS.softGold,
        border: "#F0D89E",
        icon: <LocalShippingOutlined />,
      };

    case "DELIVERED":
      return {
        color: COLORS.green,
        background: COLORS.softGreen,
        border: "#C9E8D6",
        icon: <CheckCircleOutlineRounded />,
      };

    case "CANCELLED":
      return {
        color: COLORS.red,
        background: COLORS.softRed,
        border: "#F1CACA",
        icon: <CancelOutlined />,
      };

    case "PENDING_PAYMENT":
    default:
      return {
        color: "#9B6700",
        background: COLORS.softGold,
        border: "#F0D89E",
        icon: <PaymentRounded />,
      };
  }
}

function getPaymentStatusStyle(status) {
  switch (status) {
    case "PAID":
      return {
        color: COLORS.green,
        background: COLORS.softGreen,
        border: "#C9E8D6",
      };

    case "REFUNDED":
      return {
        color: COLORS.purple,
        background: COLORS.softPurple,
        border: "#DCCBF7",
      };

    case "FAILED":
    case "CANCELLED":
      return {
        color: COLORS.red,
        background: COLORS.softRed,
        border: "#F1CACA",
      };

    case "PENDING":
    default:
      return {
        color: COLORS.muted,
        background: COLORS.softGray,
        border: "#DDD8CF",
      };
  }
}
