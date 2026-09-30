import { Box, Button, Paper, Typography } from "@mui/material";

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // The order has already been confirmed by
    // the Stripe webhook, so we only clear the
    // temporary checkout order here.
    sessionStorage.removeItem("checkoutOrderId");
  }, []);

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
            color: "#173f3a",
            mb: 2,
          }}
        >
          Payment Successful
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 1,
          }}
        >
          Your payment has been successfully completed.
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
          Your order has been confirmed.
        </Typography>

        {sessionId && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 3,
              wordBreak: "break-all",
            }}
          >
            Payment Session: {sessionId}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/orders")}
          sx={{
            mb: 2,
            py: 1.4,
            backgroundColor: "#dca528",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#c8941f",
            },
          }}
        >
          View My Orders
        </Button>

        <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
          Continue Shopping
        </Button>
      </Paper>
    </Box>
  );
}
