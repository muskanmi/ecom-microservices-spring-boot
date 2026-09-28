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
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getOrders } from "../api/orderApi";
import { getImageUrl } from "../utils/imageUrl";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        setError(
          error.response?.data?.message || "Unable to load your orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

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
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#173f3a",
            mb: 1,
          }}
        >
          My Orders
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 4 }}>
          View and track your recent orders.
        </Typography>

        {orders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              border: "1px solid #e5ddd0",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No orders yet
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Start shopping to see your orders here.
            </Typography>

            <Button variant="contained" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => (
              <Paper
                key={order.id}
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  border: "1px solid #e5ddd0",
                  borderRadius: 3,
                }}
              >
                {/* HEADER */}

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
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {order.orderNumber}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
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
                      color={getOrderStatusColor(order.status)}
                      size="small"
                    />

                    <Chip
                      label={`Payment: ${order.paymentStatus}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* ITEMS */}

                <Stack spacing={2}>
                  {order.items.map((item) => (
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
                          width: 70,
                          height: 70,
                          objectFit: "contain",
                          borderRadius: 2,
                          backgroundColor: "#f5f1eb",
                        }}
                      />

                      <Box
                        sx={{
                          flex: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {item.productName}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Qty: {item.quantity}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        ₹{Number(item.totalPrice).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* FOOTER */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
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

function getOrderStatusColor(status) {
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
