import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder, getOrderById } from "../api/orderApi";
import { getImageUrl } from "../utils/imageUrl";
import {
  createCheckoutSession,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../api/paymentApi.JS";
import loadRazorpay from "../utils/loadRazorpay";

const validateCoupon = (code, subtotal, token, userId) =>
  axios.post(
    `${import.meta.env.VITE_API_URL}/api/orders/coupons/validate`,
    { code, subtotal },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
        "Content-Type": "application/json",
      },
    },
  );

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
  const [paymentMethod, setPaymentMethod] = useState("STRIPE");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

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

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + delivery - discount);

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
       * ---------------------------------------------------------
       * CHECK EXISTING CHECKOUT ORDER
       * ---------------------------------------------------------
       *
       * We intentionally reuse an existing order only when:
       *
       * 1. It exists
       * 2. It belongs to the current user
       * 3. It is still PENDING_PAYMENT
       * 4. Its payment is still PENDING
       *
       * This prevents cancelled/refunded/paid orders from
       * remaining stuck in sessionStorage and being reused.
       * ---------------------------------------------------------
       */
      if (orderId) {
        try {
          console.log("Checking existing checkout order:", orderId);

          const existingOrderResponse = await getOrderById(
            orderId,
            token,
            user.id,
          );

          const existingOrder = existingOrderResponse.data;

          console.log("Existing checkout order:", existingOrder);

          const selectedCouponCode = appliedCoupon?.code || null;

          const canReuseOrder =
            String(existingOrder.userId) === String(user.id) &&
            existingOrder.status === "PENDING_PAYMENT" &&
            existingOrder.paymentStatus === "PENDING" &&
            (existingOrder.couponCode || null) === selectedCouponCode;

          if (!canReuseOrder) {
            console.log("Existing checkout order is no longer reusable.");

            sessionStorage.removeItem("checkoutOrderId");

            setCreatedOrderId(null);

            orderId = null;
          }
        } catch (existingOrderError) {
          /*
           * The stored order no longer exists or cannot be
           * accessed by this user.
           *
           * Clear the stale checkout order and create a
           * completely new one.
           */
          console.log(
            "Stored checkout order is invalid or unavailable. Creating a new order.",
          );

          sessionStorage.removeItem("checkoutOrderId");

          setCreatedOrderId(null);

          orderId = null;
        }
      }

      /*
       * ---------------------------------------------------------
       * CREATE NEW ORDER
       * ---------------------------------------------------------
       */
      if (!orderId) {
        const orderResponse = await createOrder(
          {
            customerEmail: user.email.trim(),
            couponCode: appliedCoupon?.code || null,

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

        console.log("Created new checkout order:", order);
      } else {
        console.log("Reusing valid pending checkout order:", orderId);
      }

      /*
       * ---------------------------------------------------------
       * START PAYMENT WITH THE SELECTED PROVIDER
       * ---------------------------------------------------------
       */
      if (paymentMethod === "STRIPE") {
        const paymentResponse = await createCheckoutSession(
          orderId,
          token,
          user.id,
        );

        const checkoutUrl = paymentResponse.data.checkoutUrl;

        if (!checkoutUrl) {
          throw new Error(
            "Stripe checkout URL was not returned by the server.",
          );
        }

        window.location.href = checkoutUrl;
        return;
      }

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please try again.",
        );
      }

      const razorpayResponse = await createRazorpayOrder(
        orderId,
        token,
        user.id,
      );

      const razorpayOrder = razorpayResponse.data;

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Marketplace",
        description: `Order #${orderId}`,
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: user.name || form.fullName.trim(),
          email: user.email || "",
          contact: form.phone.trim(),
        },
        theme: {
          color: "#dca528",
        },
        handler: async (result) => {
          try {
            setError("");
            setLoading(true);

            await verifyRazorpayPayment(
              {
                razorpayOrderId: result.razorpay_order_id,
                razorpayPaymentId: result.razorpay_payment_id,
                razorpaySignature: result.razorpay_signature,
              },
              token,
              user.id,
            );

            // PaymentSuccessPage checks the order status from the backend.
            window.location.href = `/payment/success?provider=razorpay&orderId=${encodeURIComponent(orderId)}`;
          } catch (verificationError) {
            console.error(
              "Razorpay payment verification failed:",
              verificationError,
            );

            const message =
              verificationError.response?.data?.message ||
              "We could not confirm your payment yet. Please check My Orders before trying to pay again.";

            setError(
              typeof message === "string"
                ? message
                : "We could not confirm your payment yet. Please check My Orders before trying to pay again.",
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            // Keep the pending order so the customer can retry payment.
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (failure) => {
        console.error("Razorpay payment failed:", failure);
        setError(
          failure.error?.description || "Payment failed. Please try again.",
        );
      });

      checkout.open();
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const token = localStorage.getItem("token");

      const response = await validateCoupon(
        couponCode.trim(),
        subtotal,
        token,
        user.id,
      );

      setAppliedCoupon(response.data);
      sessionStorage.removeItem("checkoutOrderId");
      setCreatedOrderId(null);
    } catch (error) {
      setAppliedCoupon(null);

      setCouponError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to apply this coupon.",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    sessionStorage.removeItem("checkoutOrderId");
    setCreatedOrderId(null);
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

            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Apply Coupon
            </Typography>

            {appliedCoupon ? (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </Button>
                }
              >
                <strong>{appliedCoupon.code}</strong> applied. You save ₹
                {Number(appliedCoupon.discount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                .
              </Alert>
            ) : (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mb: 1 }}
              >
                <TextField
                  label="Coupon code"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value);
                    if (couponError) setCouponError("");
                  }}
                  size="small"
                  fullWidth
                  disabled={couponLoading || loading}
                  inputProps={{ "aria-label": "Coupon code" }}
                />
                <Button
                  variant="outlined"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || loading || !couponCode.trim()}
                  sx={{ whiteSpace: "nowrap", minWidth: 110 }}
                >
                  {couponLoading ? "Applying…" : "Apply"}
                </Button>
              </Stack>
            )}

            {couponError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {couponError}
              </Alert>
            )}

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

              {appliedCoupon && Number(discount) > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Coupon discount</Typography>
                  <Typography sx={{ color: "#18864b", fontWeight: 600 }}>
                    −₹
                    {Number(discount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              )}

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

            <Divider sx={{ my: 3 }} />

            <FormControl>
              <FormLabel
                id="payment-method-label"
                sx={{ fontWeight: 700, color: "#173f3a" }}
              >
                Payment Method
              </FormLabel>

              <RadioGroup
                aria-labelledby="payment-method-label"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <FormControlLabel
                  value="STRIPE"
                  control={<Radio />}
                  label="Card / Stripe Checkout"
                />

                <FormControlLabel
                  value="RAZORPAY"
                  control={<Radio />}
                  label="Razorpay (UPI, cards and other available methods)"
                />
              </RadioGroup>
            </FormControl>

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
              {loading ? "Preparing Payment..." : "Place Order"}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
