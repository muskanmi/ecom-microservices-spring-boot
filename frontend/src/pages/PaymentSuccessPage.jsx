import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  CheckCircleRounded,
  ErrorOutlineRounded,
  ShoppingBagOutlined,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../api/orderApi";

const COLORS = {
  ink: "#173F3D",
  inkDark: "#103331",
  gold: "#E8AA2B",
  goldDark: "#D59418",
  cream: "#F7F1E7",
  paper: "#FFFCF5",
  muted: "#756F64",
  green: "#16824A",
  softGreen: "#E9F6EF",
  purple: "#6C47B8",
  softPurple: "#F2ECFF",
  red: "#C83D3D",
  softRed: "#FFF0F0",
  border: "#E5DDD0",
};

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState("CHECKING");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const orderId = sessionStorage.getItem("checkoutOrderId");

    if (!orderId) {
      setStatus("UNKNOWN");
      return;
    }

    const token = localStorage.getItem("token");

    let attempts = 0;
    const maxAttempts = 15;

    const checkOrderStatus = async () => {
      try {
        attempts++;

        const response = await getOrderById(orderId, token, user.id);

        const currentOrder = response.data;

        setOrder(currentOrder);

        /*
         * --------------------------------------------------
         * REAL SUCCESS
         * --------------------------------------------------
         */

        if (
          currentOrder.status === "CONFIRMED" &&
          currentOrder.paymentStatus === "PAID"
        ) {
          setStatus("SUCCESS");

          sessionStorage.removeItem("checkoutOrderId");

          return;
        }

        /*
         * --------------------------------------------------
         * PAYMENT REFUNDED
         * --------------------------------------------------
         */

        if (
          currentOrder.status === "CANCELLED" &&
          currentOrder.paymentStatus === "REFUNDED"
        ) {
          setStatus("REFUNDED");

          sessionStorage.removeItem("checkoutOrderId");

          return;
        }

        /*
         * --------------------------------------------------
         * PAYMENT CANCELLED
         * --------------------------------------------------
         */

        if (
          currentOrder.status === "CANCELLED" &&
          currentOrder.paymentStatus === "CANCELLED"
        ) {
          setStatus("CANCELLED");

          sessionStorage.removeItem("checkoutOrderId");

          return;
        }

        /*
         * --------------------------------------------------
         * WEBHOOK STILL PROCESSING
         * --------------------------------------------------
         */

        if (attempts < maxAttempts) {
          setTimeout(checkOrderStatus, 1000);
        } else {
          setStatus("PROCESSING");
        }
      } catch (error) {
        console.error("Failed to check order status:", error);

        if (attempts < maxAttempts) {
          setTimeout(checkOrderStatus, 1000);
        } else {
          setStatus("PROCESSING");
        }
      }
    };

    checkOrderStatus();

    return () => {
      // No interval to clean up because
      // we are using recursive setTimeout.
    };
  }, [user?.id]);

  /*
   * ========================================================
   * CHECKING
   * ========================================================
   */

  if (status === "CHECKING") {
    return (
      <PaymentStateLayout>
        <CircularProgress
          size={44}
          thickness={4}
          sx={{
            color: COLORS.gold,
            mb: 3,
          }}
        />

        <Typography
          sx={{
            fontSize: {
              xs: 28,
              md: 34,
            },
            fontWeight: 800,
            color: COLORS.ink,
          }}
        >
          Verifying your payment
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            mt: 1,
            maxWidth: 520,
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          Your payment was received by Stripe. We are now confirming stock and
          finalizing your order.
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: 13,
            mt: 2,
          }}
        >
          Please wait a moment...
        </Typography>
      </PaymentStateLayout>
    );
  }

  /*
   * ========================================================
   * SUCCESS
   * ========================================================
   */

  if (status === "SUCCESS") {
    return (
      <PaymentStateLayout>
        <StateIcon background={COLORS.softGreen} color={COLORS.green}>
          <CheckCircleRounded sx={{ fontSize: 62 }} />
        </StateIcon>

        <Typography
          sx={{
            fontSize: {
              xs: 30,
              md: 38,
            },
            fontWeight: 800,
            color: COLORS.ink,
            mb: 1,
          }}
        >
          Payment Successful
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          Your payment has been successfully completed and your order is
          confirmed.
        </Typography>

        {order && <OrderReference order={order} />}

        <StateActions
          primaryLabel="View My Orders"
          onPrimary={() => navigate("/orders")}
          secondaryLabel="Continue Shopping"
          onSecondary={() => navigate("/")}
        />
      </PaymentStateLayout>
    );
  }

  /*
   * ========================================================
   * REFUNDED
   * ========================================================
   */

  if (status === "REFUNDED") {
    return (
      <PaymentStateLayout>
        <StateIcon background={COLORS.softPurple} color={COLORS.purple}>
          <ErrorOutlineRounded sx={{ fontSize: 62 }} />
        </StateIcon>

        <Typography
          sx={{
            fontSize: {
              xs: 28,
              md: 36,
            },
            fontWeight: 800,
            color: COLORS.ink,
            mb: 1,
          }}
        >
          Payment Refunded
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 560,
            mx: "auto",
          }}
        >
          Your payment was received, but we could not confirm the order because
          the requested item was no longer available.
        </Typography>

        {order && (
          <Box
            sx={{
              mt: 2,
              mb: 1,
              px: 3,
              py: 2,
              borderRadius: 2,
              backgroundColor: COLORS.softPurple,
              border: "1px solid #DDCFF5",
            }}
          >
            <Typography
              sx={{
                color: COLORS.purple,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Order {order.orderNumber}
            </Typography>

            <Typography
              sx={{
                color: COLORS.muted,
                fontSize: 13,
                mt: 0.5,
              }}
            >
              ₹{Number(order.totalAmount).toLocaleString("en-IN")} has been
              refunded to your original payment method.
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: 13,
            mt: 1.5,
            maxWidth: 540,
            mx: "auto",
          }}
        >
          A refund confirmation email has also been sent to your registered
          email address.
        </Typography>

        <StateActions
          primaryLabel="View Order"
          onPrimary={() => {
            if (order?.id) {
              navigate(`/orders/${order.id}`);
            } else {
              navigate("/orders");
            }
          }}
          secondaryLabel="Continue Shopping"
          onSecondary={() => navigate("/")}
        />
      </PaymentStateLayout>
    );
  }

  /*
   * ========================================================
   * CANCELLED
   * ========================================================
   */

  if (status === "CANCELLED") {
    return (
      <PaymentStateLayout>
        <StateIcon background={COLORS.softRed} color={COLORS.red}>
          <ErrorOutlineRounded sx={{ fontSize: 62 }} />
        </StateIcon>

        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.ink,
          }}
        >
          Payment Cancelled
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          Your payment was cancelled and the order was not completed.
        </Typography>

        <StateActions
          primaryLabel="View My Orders"
          onPrimary={() => navigate("/orders")}
          secondaryLabel="Continue Shopping"
          onSecondary={() => navigate("/")}
        />
      </PaymentStateLayout>
    );
  }

  /*
   * ========================================================
   * PROCESSING / TIMEOUT
   * ========================================================
   */

  if (status === "PROCESSING") {
    return (
      <PaymentStateLayout>
        <CircularProgress
          size={44}
          thickness={4}
          sx={{
            color: COLORS.gold,
            mb: 3,
          }}
        />

        <Typography
          sx={{
            fontSize: 30,
            fontWeight: 800,
            color: COLORS.ink,
          }}
        >
          Payment Processing
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            mt: 1,
            maxWidth: 560,
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          Your payment was received, but your order is still being finalized.
        </Typography>

        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: 13,
            mt: 1.5,
          }}
        >
          Please check My Orders in a moment.
        </Typography>

        <StateActions
          primaryLabel="View My Orders"
          onPrimary={() => navigate("/orders")}
          secondaryLabel="Continue Shopping"
          onSecondary={() => navigate("/")}
        />
      </PaymentStateLayout>
    );
  }

  /*
   * ========================================================
   * UNKNOWN
   * ========================================================
   */

  return (
    <PaymentStateLayout>
      <ShoppingBagOutlined
        sx={{
          fontSize: 64,
          color: COLORS.ink,
          mb: 2,
        }}
      />

      <Typography
        sx={{
          fontSize: 30,
          fontWeight: 800,
          color: COLORS.ink,
        }}
      >
        Payment Received
      </Typography>

      <Typography
        sx={{
          color: COLORS.muted,
          mt: 1,
        }}
      >
        Please check your orders for the latest payment status.
      </Typography>

      <StateActions
        primaryLabel="View My Orders"
        onPrimary={() => navigate("/orders")}
        secondaryLabel="Continue Shopping"
        onSecondary={() => navigate("/")}
      />
    </PaymentStateLayout>
  );
}

/*
 * ============================================================
 * LAYOUT
 * ============================================================
 */

function PaymentStateLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: COLORS.cream,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 650,
          p: {
            xs: 3,
            sm: 5,
          },
          textAlign: "center",
          borderRadius: 4,
          backgroundColor: COLORS.paper,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 16px 45px rgba(40,35,28,.08)",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

/*
 * ============================================================
 * STATE ICON
 * ============================================================
 */

function StateIcon({ background, color, children }) {
  return (
    <Box
      sx={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
        color,
        mx: "auto",
        mb: 2.5,
      }}
    >
      {children}
    </Box>
  );
}

/*
 * ============================================================
 * ORDER REFERENCE
 * ============================================================
 */

function OrderReference({ order }) {
  return (
    <Box
      sx={{
        mt: 2.5,
        mb: 1,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#F4EEE3",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: COLORS.muted,
        }}
      >
        Order
      </Typography>

      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontWeight: 800,
          color: COLORS.ink,
          mt: 0.4,
        }}
      >
        {order.orderNumber}
      </Typography>

      <Typography
        sx={{
          color: COLORS.muted,
          fontSize: 13,
          mt: 0.6,
        }}
      >
        Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
      </Typography>
    </Box>
  );
}

/*
 * ============================================================
 * ACTIONS
 * ============================================================
 */

function StateActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        mt: 3,
        maxWidth: 420,
        mx: "auto",
      }}
    >
      <Button
        fullWidth
        variant="contained"
        onClick={onPrimary}
        sx={{
          py: 1.35,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 800,
          backgroundColor: COLORS.gold,
          color: "#2C271F",
          boxShadow: "none",

          "&:hover": {
            backgroundColor: COLORS.goldDark,
            boxShadow: "none",
          },
        }}
      >
        {primaryLabel}
      </Button>

      <Button
        fullWidth
        variant="outlined"
        onClick={onSecondary}
        sx={{
          py: 1.2,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
          color: COLORS.goldDark,
          borderColor: "#E5C36F",

          "&:hover": {
            borderColor: COLORS.goldDark,
            backgroundColor: "#FFF8E8",
          },
        }}
      >
        {secondaryLabel}
      </Button>
    </Stack>
  );
}
