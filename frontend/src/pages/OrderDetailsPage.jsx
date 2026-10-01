import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  CheckRounded,
  HomeRounded,
  Inventory2Outlined,
  LocalShippingOutlined,
  LocationOnOutlined,
  PaymentRounded,
  ReplayRounded,
  ShoppingBagOutlined,
  SupportAgentRounded,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../api/orderApi";
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
  green: "#16824A",
  softGreen: "#E9F6EF",
  blue: "#3569C8",
  softBlue: "#EDF4FF",
  red: "#C83D3D",
  softRed: "#FFF0F0",
  purple: "#6C47B8",
  softPurple: "#F2ECFF",
  goldText: "#9B6700",
  softGold: "#FFF4D8",
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.id || !orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await getOrderById(orderId, token, user.id);

        setOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);

        const message =
          error.response?.data?.message || "Unable to load order details.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user?.id]);

  const itemCount = useMemo(() => {
    return (order?.items || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    );
  }, [order]);

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
            Loading order details...
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
          py: 4,
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              mb: 2,
              backgroundColor: COLORS.white,
            }}
          >
            {error}
          </Alert>

          <Button
            variant="contained"
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/orders")}
            sx={{
              backgroundColor: COLORS.ink,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: COLORS.inkDark,
                boxShadow: "none",
              },
            }}
          >
            Back to Orders
          </Button>
        </Box>
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  const statusStyle = getOrderStatusStyle(order.status);

  const paymentStyle = getPaymentStatusStyle(order.paymentStatus);

  const isCancelled = order.status === "CANCELLED";

  const isRefunded = order.paymentStatus === "REFUNDED";

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
            BACK
        ===================================================== */}

        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/orders")}
          sx={{
            color: COLORS.ink,
            textTransform: "none",
            fontWeight: 700,
            px: 0,
            mb: 2,
            minWidth: 0,

            "&:hover": {
              backgroundColor: "transparent",
              color: COLORS.goldDark,
            },
          }}
        >
          Back to Orders
        </Button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2.2,
              md: 3,
            },
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.paper,
            mb: 2.5,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: COLORS.ink,
                  color: COLORS.white,
                }}
              >
                <ShoppingBagOutlined />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    color: COLORS.ink,
                    fontWeight: 800,
                    fontSize: {
                      xs: 15,
                      sm: 18,
                    },
                  }}
                >
                  {order.orderNumber}
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: 13,
                    mt: 0.4,
                  }}
                >
                  Placed on {formatDateLong(order.createdAt)}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              <Chip
                icon={statusStyle.icon}
                label={formatStatus(order.status)}
                sx={{
                  height: 30,
                  borderRadius: 99,
                  fontWeight: 700,
                  color: statusStyle.color,
                  backgroundColor: statusStyle.background,
                  border: `1px solid ${statusStyle.border}`,

                  "& .MuiChip-icon": {
                    color: statusStyle.color,
                  },
                }}
              />

              <Chip
                label={`Payment: ${formatStatus(order.paymentStatus)}`}
                sx={{
                  height: 30,
                  borderRadius: 99,
                  fontWeight: 700,
                  color: paymentStyle.color,
                  backgroundColor: paymentStyle.background,
                  border: `1px solid ${paymentStyle.border}`,
                }}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* =====================================================
            REFUND / CANCEL NOTICE
        ===================================================== */}

        {isRefunded && (
          <NoticeCard
            icon={<ReplayRounded />}
            title="Payment refunded"
            text="Your payment has been successfully refunded because this order could not be fulfilled."
            color={COLORS.purple}
            background={COLORS.softPurple}
            border="#DDCFF5"
          />
        )}

        {!isRefunded && isCancelled && (
          <NoticeCard
            icon={<CheckRounded />}
            title="Order cancelled"
            text="This order has been cancelled. No further action is required."
            color={COLORS.red}
            background={COLORS.softRed}
            border="#F2CBCB"
          />
        )}

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.65fr) minmax(320px, 0.9fr)",
            },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          {/* ===================================================
              LEFT
          =================================================== */}

          <Stack spacing={2.5}>
            {/* ORDER PROGRESS */}
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 2.8,
                },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.paper,
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: COLORS.ink,
                  mb: 2.5,
                }}
              >
                Order status
              </Typography>

              {isCancelled ? (
                <CancelledTimeline refunded={isRefunded} />
              ) : (
                <OrderTimeline
                  status={order.status}
                  paymentStatus={order.paymentStatus}
                />
              )}
            </Paper>

            {/* ORDER ITEMS */}
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 2.8,
                },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.paper,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2.2}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: COLORS.ink,
                  }}
                >
                  Order items
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: 12,
                  }}
                >
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Typography>
              </Stack>

              <Stack spacing={2}>
                {(order.items || []).map((item, index) => (
                  <Box key={item.id}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: {
                            xs: 82,
                            sm: 94,
                          },
                          height: {
                            xs: 82,
                            sm: 94,
                          },
                          flexShrink: 0,
                          borderRadius: 2,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#F3EEE5",
                          border: `1px solid ${COLORS.border}`,
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
                            p: 0.7,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#27231E",
                            fontSize: 15,
                          }}
                        >
                          {item.productName}
                        </Typography>

                        <Typography
                          sx={{
                            color: COLORS.muted,
                            fontSize: 12,
                            mt: 0.7,
                          }}
                        >
                          ₹{Number(item.price).toLocaleString("en-IN")} each
                        </Typography>

                        <Typography
                          sx={{
                            color: COLORS.muted,
                            fontSize: 12,
                            mt: 0.3,
                          }}
                        >
                          Quantity: {item.quantity}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: COLORS.ink,
                          fontSize: {
                            xs: 14,
                            sm: 16,
                          },
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹{Number(item.totalPrice).toLocaleString("en-IN")}
                      </Typography>
                    </Box>

                    {index < (order.items?.length || 0) - 1 && (
                      <Divider
                        sx={{
                          mt: 2,
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* DELIVERY ADDRESS */}
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 2.8,
                },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.paper,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.ink,
                    backgroundColor: "#EAF1EF",
                  }}
                >
                  <LocationOnOutlined fontSize="small" />
                </Box>

                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: COLORS.ink,
                  }}
                >
                  Delivery address
                </Typography>
              </Stack>

              {order.shippingAddress ? (
                <Box
                  sx={{
                    pl: {
                      xs: 0,
                      sm: 5.7,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#27231E",
                      mb: 0.7,
                    }}
                  >
                    {order.shippingAddress.fullName}
                  </Typography>

                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: 13,
                      lineHeight: 1.8,
                    }}
                  >
                    {order.shippingAddress.phone}
                    <br />
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && (
                      <>
                        <br />
                        {order.shippingAddress.addressLine2}
                      </>
                    )}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.pincode}
                    <br />
                    {order.shippingAddress.country}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No delivery address available.
                </Typography>
              )}
            </Paper>

            {/* NEED HELP */}
            <Paper
              elevation={0}
              sx={{
                p: 2.3,
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: "#F4EEE2",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SupportAgentRounded
                  sx={{
                    color: COLORS.ink,
                    fontSize: 28,
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: COLORS.ink,
                      fontSize: 14,
                    }}
                  >
                    Need help with this order?
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: COLORS.muted,
                      mt: 0.3,
                    }}
                  >
                    Our support team can help with order and payment questions.
                  </Typography>
                </Box>

                <Button
                  size="small"
                  sx={{
                    color: COLORS.ink,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Contact
                </Button>
              </Stack>
            </Paper>
          </Stack>

          {/* ===================================================
              RIGHT
          =================================================== */}

          <Stack
            spacing={2.5}
            sx={{
              position: {
                lg: "sticky",
              },
              top: {
                lg: 92,
              },
            }}
          >
            {/* SUMMARY */}
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 2.8,
                },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.paper,
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: COLORS.ink,
                  mb: 2.5,
                }}
              >
                Order summary
              </Typography>

              <Stack spacing={1.5}>
                <SummaryRow label="Subtotal" value={order.subtotal} />

                <SummaryRow
                  label="Discount"
                  value={order.discount}
                  prefix="-₹"
                  valueColor={COLORS.green}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: 14,
                    }}
                  >
                    Delivery
                  </Typography>

                  <Typography
                    sx={{
                      color: COLORS.green,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {Number(order.shippingFee) === 0
                      ? "FREE"
                      : `₹${Number(order.shippingFee).toLocaleString("en-IN")}`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: COLORS.ink,
                    }}
                  >
                    Total
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 21,
                      fontWeight: 900,
                      color: COLORS.ink,
                    }}
                  >
                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* PAYMENT */}
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 2.8,
                },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.paper,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: paymentStyle.color,
                    backgroundColor: paymentStyle.background,
                  }}
                >
                  <PaymentRounded fontSize="small" />
                </Box>

                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: COLORS.ink,
                  }}
                >
                  Payment
                </Typography>
              </Stack>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: paymentStyle.background,
                  border: `1px solid ${paymentStyle.border}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    color: COLORS.muted,
                  }}
                >
                  Payment status
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: paymentStyle.color,
                    mt: 0.3,
                  }}
                >
                  {formatStatus(order.paymentStatus)}
                </Typography>
              </Box>

              {isRefunded && (
                <Typography
                  sx={{
                    mt: 1.3,
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: COLORS.muted,
                  }}
                >
                  Your payment was successfully refunded because the order could
                  not be fulfilled.
                </Typography>
              )}
            </Paper>

            {/* ACTION */}
            <Button
              fullWidth
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate("/orders")}
              sx={{
                py: 1.35,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                backgroundColor: COLORS.ink,
                boxShadow: "none",

                "&:hover": {
                  backgroundColor: COLORS.inkDark,
                  boxShadow: "none",
                },
              }}
            >
              Back to My Orders
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<HomeRounded />}
              onClick={() => navigate("/")}
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                color: COLORS.ink,
                borderColor: "#CFC4B2",

                "&:hover": {
                  borderColor: COLORS.ink,
                  backgroundColor: "#F3EDE2",
                },
              }}
            >
              Continue Shopping
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

/* ============================================================
   ORDER TIMELINE
============================================================ */

function OrderTimeline({ status, paymentStatus }) {
  const steps = [
    {
      label: "Order placed",
      icon: <Inventory2Outlined />,
      done: true,
    },
    {
      label: "Payment",
      icon: <PaymentRounded />,
      done: paymentStatus === "PAID" || paymentStatus === "REFUNDED",
      active: paymentStatus === "PENDING",
    },
    {
      label: "Confirmed",
      icon: <CheckCircleRounded />,
      done: ["CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
        status,
      ),
    },
    {
      label: "Delivery",
      icon: <LocalShippingOutlined />,
      done: status === "DELIVERED",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(4, 1fr)",
        },
        gap: {
          xs: 1.5,
          sm: 1,
        },
      }}
    >
      {steps.map((step, index) => {
        const isCurrent =
          step.active ||
          (!step.done &&
            !step.active &&
            index ===
              steps.findIndex(
                (currentStep) => !currentStep.done && currentStep.active,
              ));

        return (
          <Box
            key={step.label}
            sx={{
              textAlign: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                mx: "auto",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: step.done
                  ? COLORS.softGreen
                  : isCurrent
                    ? COLORS.softGold
                    : "#F0EDE7",
                color: step.done
                  ? COLORS.green
                  : isCurrent
                    ? COLORS.goldText
                    : "#9C9488",
                border: `1px solid ${
                  step.done ? "#C7E6D4" : isCurrent ? "#EFD79F" : COLORS.border
                }`,
              }}
            >
              {step.icon}
            </Box>

            <Typography
              sx={{
                mt: 1,
                fontSize: 12,
                fontWeight: step.done || isCurrent ? 700 : 500,
                color: step.done || isCurrent ? COLORS.ink : COLORS.muted,
              }}
            >
              {step.label}
            </Typography>

            {index < steps.length - 1 && (
              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  position: "absolute",
                  top: 21,
                  left: "calc(50% + 28px)",
                  right: "calc(-50% + 28px)",
                  height: 2,
                  backgroundColor: steps[index + 1].done
                    ? "#BFE0CD"
                    : COLORS.border,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/* ============================================================
   CANCELLED TIMELINE
============================================================ */

function CancelledTimeline({ refunded }) {
  const steps = [
    {
      label: "Order placed",
      icon: <Inventory2Outlined />,
      done: true,
    },
    {
      label: "Payment received",
      icon: <PaymentRounded />,
      done: true,
    },
    {
      label: refunded ? "Payment refunded" : "Order cancelled",
      icon: refunded ? <ReplayRounded /> : <CheckRounded />,
      done: true,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(3, 1fr)",
        },
        gap: 2,
      }}
    >
      {steps.map((step) => (
        <Box
          key={step.label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            p: 1.4,
            borderRadius: 2,
            backgroundColor: refunded ? COLORS.softPurple : COLORS.softRed,
            border: `1px solid ${refunded ? "#DDCFF5" : "#F1CBCB"}`,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: refunded ? COLORS.purple : COLORS.red,
              backgroundColor: COLORS.white,
            }}
          >
            {step.icon}
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12,
              color: refunded ? COLORS.purple : COLORS.red,
            }}
          >
            {step.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ============================================================
   NOTICE
============================================================ */

function NoticeCard({ icon, title, text, color, background, border }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: 3,
        backgroundColor: background,
        border: `1px solid ${border}`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              color,
              fontSize: 14,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: COLORS.muted,
              mt: 0.3,
              lineHeight: 1.5,
            }}
          >
            {text}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({ label, value, prefix = "₹", valueColor = "#27231E" }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography
        sx={{
          color: COLORS.muted,
          fontSize: 14,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {prefix}
        {Number(value || 0).toLocaleString("en-IN")}
      </Typography>
    </Box>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatDateLong(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
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
        icon: <CheckCircleRounded />,
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
        color: COLORS.goldText,
        background: COLORS.softGold,
        border: "#F0D89E",
        icon: <LocalShippingOutlined />,
      };

    case "DELIVERED":
      return {
        color: COLORS.green,
        background: COLORS.softGreen,
        border: "#C9E8D6",
        icon: <CheckCircleRounded />,
      };

    case "CANCELLED":
      return {
        color: COLORS.red,
        background: COLORS.softRed,
        border: "#F1CACA",
        icon: <CheckRounded />,
      };

    case "PENDING_PAYMENT":
    default:
      return {
        color: COLORS.goldText,
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
        background: "#F1EFEB",
        border: "#DDD8CF",
      };
  }
}
