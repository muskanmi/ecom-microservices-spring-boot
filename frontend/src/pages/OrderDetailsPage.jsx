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

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../api/orderApi";
import { getImageUrl } from "../utils/imageUrl";

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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          p: 4,
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>

        <Button variant="outlined" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f7f1e7",
        px: { xs: 2, md: 5 },
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* Back */}

        <Button
          onClick={() => navigate("/orders")}
          sx={{
            mb: 3,
            color: "#173f3a",
            fontWeight: 600,
          }}
        >
          ← Back to Orders
        </Button>

        {/* Header */}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e5ddd0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              flexDirection: {
                xs: "column",
                md: "row",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#173f3a",
                }}
              >
                {order.orderNumber}
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Ordered on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={formatStatus(order.status)}
                color={getStatusColor(order.status)}
              />

              <Chip
                label={`Payment: ${order.paymentStatus}`}
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.6fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* LEFT */}

          <Stack spacing={3}>
            {/* Products */}

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                border: "1px solid #e5ddd0",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Order Items
              </Typography>

              <Stack spacing={2}>
                {order.items?.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={getImageUrl(item.productImage)}
                      alt={item.productName}
                      sx={{
                        width: 90,
                        height: 90,
                        objectFit: "contain",
                        borderRadius: 2,
                        backgroundColor: "#f5f1eb",
                      }}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {item.productName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Qty: {item.quantity}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        ₹{Number(item.price).toLocaleString("en-IN")} each
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      ₹{Number(item.totalPrice).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Shipping Address */}

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                border: "1px solid #e5ddd0",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Delivery Address
              </Typography>

              {order.shippingAddress && (
                <Stack spacing={0.5}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {order.shippingAddress.fullName}
                  </Typography>

                  <Typography>{order.shippingAddress.phone}</Typography>

                  <Typography>{order.shippingAddress.addressLine1}</Typography>

                  {order.shippingAddress.addressLine2 && (
                    <Typography>
                      {order.shippingAddress.addressLine2}
                    </Typography>
                  )}

                  <Typography>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.pincode}
                  </Typography>

                  <Typography>{order.shippingAddress.country}</Typography>
                </Stack>
              )}
            </Paper>
          </Stack>

          {/* RIGHT */}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              height: "fit-content",
              borderRadius: 3,
              border: "1px solid #e5ddd0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Order Summary
            </Typography>

            <Stack spacing={2}>
              <SummaryRow label="Subtotal" value={order.subtotal} />

              <SummaryRow label="Discount" value={order.discount} prefix="-₹" />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Delivery</Typography>

                <Typography
                  sx={{
                    color: "#18864b",
                    fontWeight: 600,
                  }}
                >
                  {Number(order.shippingFee) === 0
                    ? "FREE"
                    : `₹${Number(order.shippingFee).toLocaleString("en-IN")}`}
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Total
                </Typography>

                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryRow({ label, value, prefix = "₹" }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Typography>{label}</Typography>

      <Typography>
        {prefix}
        {Number(value || 0).toLocaleString("en-IN")}
      </Typography>
    </Box>
  );
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

function getStatusColor(status) {
  switch (status) {
    case "CONFIRMED":
      return "success";

    case "SHIPPED":
      return "info";

    case "OUT_FOR_DELIVERY":
      return "warning";

    case "DELIVERED":
      return "success";

    case "CANCELLED":
      return "error";

    case "PENDING_PAYMENT":
    default:
      return "warning";
  }
}
