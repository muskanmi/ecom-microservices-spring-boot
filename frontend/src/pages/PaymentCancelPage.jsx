import { Alert, Box, Button, Paper, Typography } from "@mui/material";

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { createCheckoutSession } from "../api/paymentApi.JS";
import { useAuth } from "../context/AuthContext";

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderId = searchParams.get("orderId");

  const handleRetryPayment = async () => {
    if (!orderId) {
      setError("Order information is missing.");
      return;
    }

    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      /*
       * Reuse the same order.
       * We are NOT creating another order.
       */
      sessionStorage.setItem("checkoutOrderId", String(orderId));

      const response = await createCheckoutSession(orderId, token, user.id);

      const checkoutUrl = response.data.checkoutUrl;

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Retry payment failed:", error);

      const message =
        error.response?.data?.message || "Unable to retry payment.";

      setError(
        typeof message === "string" ? message : "Unable to retry payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7f1e7",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          p: 5,
          textAlign: "center",
          borderRadius: 3,
          border: "1px solid #e5ddd0",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Payment Not Completed
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
          Your payment was cancelled or could not be completed. Your order is
          still available for another payment attempt.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleRetryPayment}
          disabled={loading || !orderId}
          sx={{
            mb: 2,
            py: 1.4,
            fontWeight: 700,
            backgroundColor: "#dca528",
            "&:hover": {
              backgroundColor: "#c8941f",
            },
          }}
        >
          {loading ? "Redirecting to Payment..." : "Retry Payment"}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate("/orders")}
          sx={{ mb: 2 }}
        >
          View My Orders
        </Button>

        <Button variant="text" fullWidth onClick={() => navigate("/cart")}>
          Return to Cart
        </Button>
      </Paper>
    </Box>
  );
}
