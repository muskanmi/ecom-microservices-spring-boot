import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderApi";
import { getImageUrl } from "../utils/imageUrl";
import { createCheckoutSession } from "../api/paymentApi.JS";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { cart } = useCart();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createdOrderId, setCreatedOrderId] = useState(() =>
    sessionStorage.getItem("checkoutOrderId"),
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cartItems = cart?.items || [];

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
    0,
  );

  const delivery = 0;

  const total = subtotal + delivery;

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (!user?.email) {
      setError(
        "Your account email is missing. Please update your profile before placing an order.",
      );
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const token = localStorage.getItem("token");

      let orderId = createdOrderId;

      /*
       * Create the order only once.
       */
      if (!orderId) {
        const orderResponse = await createOrder(
          {
            customerEmail: user.email.trim(),

            shippingAddress: {
              fullName: form.fullName.trim(),
              phone: form.phone.trim(),
              addressLine1: form.addressLine1.trim(),
              addressLine2: form.addressLine2.trim(),
              city: form.city.trim(),
              state: form.state.trim(),
              pincode: form.pincode.trim(),
              country: form.country.trim(),
            },
          },
          token,
          user.id,
        );

        const order = orderResponse.data;

        orderId = order.id;

        setCreatedOrderId(orderId);

        sessionStorage.setItem("checkoutOrderId", String(orderId));

        console.log("Created order:", order);
      } else {
        console.log("Reusing existing order:", orderId);
      }

      /*
       * Create Stripe Checkout Session.
       *
       * This can happen multiple times for
       * the SAME order.
       */
      const paymentResponse = await createCheckoutSession(
        orderId,
        token,
        user.id,
      );

      const checkoutUrl = paymentResponse.data.checkoutUrl;

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout failed:", error);

      const message =
        error.response?.data?.message || "Unable to proceed with payment.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to proceed with payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#173f3a",
            mb: 1,
          }}
        >
          Checkout
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
          Complete your delivery details and place your order.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

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
          {/* LEFT SIDE */}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              border: "1px solid #e5ddd0",
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Delivery Address
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Address Line 1"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Address Line 2"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                fullWidth
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Stack>
          </Paper>

          {/* RIGHT SIDE */}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              border: "1px solid #e5ddd0",
              borderRadius: 3,
              height: "fit-content",
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
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={getImageUrl(item.product?.images?.[0]?.imageUrl)}
                    alt={item.product?.name || "Product"}
                    sx={{
                      width: 70,
                      height: 70,
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
                      {item.product?.name}
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
                    ₹
                    {(
                      Number(item.product?.price || 0) *
                      Number(item.quantity || 0)
                    ).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Subtotal</Typography>

                <Typography>₹{subtotal.toLocaleString("en-IN")}</Typography>
              </Box>

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
                  FREE
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
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  Total
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  ₹{total.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={loading || cartItems.length === 0}
              sx={{
                mt: 3,
                py: 1.5,
                backgroundColor: "#dca528",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: "#c8941f",
                },
              }}
            >
              {loading ? "Creating Order..." : "Place Order"}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
