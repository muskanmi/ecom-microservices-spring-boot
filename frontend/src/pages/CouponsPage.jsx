import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ConfirmationNumberOutlined,
  ArrowBackOutlined,
  ContentCopyOutlined,
  LocalOfferOutlined,
  ShoppingBagOutlined,
  VerifiedOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAvailableCouponCount, validateCoupon } from "../api/couponApi";

const colors = {
  background: "#F7F2E8",
  surface: "#FFFCF5",
  white: "#FFFFFF",
  ink: "#203A37",
  muted: "#7C776C",
  border: "#E6DDCD",
  gold: "#E7AB28",
  green: "#18804B",
  paleGreen: "#EAF5EC",
  paleGold: "#FFF4D8",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

export default function CouponsPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const user = auth?.user;
  const token = auth?.token || user?.token;
  const userId = user?.id ?? user?.userId ?? user?.user_id;

  const [availableCount, setAvailableCount] = useState(null);
  const [countLoading, setCountLoading] = useState(true);
  const [countError, setCountError] = useState("");

  const [code, setCode] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState("");

  const loadCouponCount = useCallback(async () => {
    if (!token || !userId) {
      setCountLoading(false);
      setCountError("Please sign in again to view your coupons.");
      return;
    }

    setCountLoading(true);
    setCountError("");

    try {
      const response = await getAvailableCouponCount(token, userId);
      const data = response?.data;

      // Supports a plain numeric response or common object response shapes.
      const count =
        typeof data === "number"
          ? data
          : (data?.count ??
            data?.availableCount ??
            data?.availableCouponCount ??
            data?.total ??
            data?.data?.count);

      if (
        count !== undefined &&
        count !== null &&
        Number.isFinite(Number(count))
      ) {
        setAvailableCount(Number(count));
      } else {
        setAvailableCount(null);
        setCountError(
          "The coupon count response was not in the expected format.",
        );
      }
    } catch (error) {
      setCountError(getErrorMessage(error));
    } finally {
      setCountLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    loadCouponCount();
  }, [loadCouponCount]);

  const handleValidate = async (event) => {
    event.preventDefault();

    setValidationResult(null);
    setValidationError("");

    const normalizedCode = code.trim().toUpperCase();
    const amount = Number(subtotal);

    if (!normalizedCode) {
      setValidationError("Enter a coupon code.");
      return;
    }

    if (subtotal === "" || !Number.isFinite(amount) || amount <= 0) {
      setValidationError("Enter a valid order subtotal greater than ₹0.");
      return;
    }

    if (!token || !userId) {
      setValidationError("Please sign in again before validating a coupon.");
      return;
    }

    setValidating(true);

    try {
      const response = await validateCoupon(
        normalizedCode,
        amount,
        token,
        userId,
      );

      setValidationResult(response?.data ?? {});
    } catch (error) {
      setValidationError(getErrorMessage(error));
    } finally {
      setValidating(false);
    }
  };

  const handleCopyCode = async () => {
    const result = validationResult;

    const couponCode =
      result?.code || result?.couponCode || code.trim().toUpperCase();

    try {
      await navigator.clipboard.writeText(String(couponCode));
    } catch {
      setValidationError(
        "Unable to copy automatically. Please select and copy the coupon code.",
      );
    }
  };

  const resultIsValid =
    validationResult?.valid ??
    validationResult?.isValid ??
    validationResult?.eligible ??
    validationResult?.success;

  const discountValue =
    validationResult?.discountAmount ??
    validationResult?.discount ??
    validationResult?.discountValue;

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: colors.background,
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        color: colors.ink,
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate("/dashboard")}
          sx={{
            mb: 3,
            color: colors.ink,
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { bgcolor: "#EEE7D9" },
          }}
        >
          Back to shopping
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: colors.muted,
                mb: 1,
              }}
            >
              Marketplace rewards
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 700,
                fontSize: { xs: 32, md: 42 },
                lineHeight: 1.15,
                color: colors.ink,
              }}
            >
              Coupons & offers
            </Typography>

            <Typography sx={{ mt: 1, color: colors.muted }}>
              Save on your next order with an eligible coupon.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              minWidth: { xs: "100%", sm: 230 },
              bgcolor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                display: "grid",
                placeItems: "center",
                bgcolor: colors.paleGold,
                color: "#9A6A0C",
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <ConfirmationNumberOutlined />
            </Box>

            <Box>
              <Typography sx={{ color: colors.muted, fontSize: 13 }}>
                Available coupons
              </Typography>

              {countLoading ? (
                <CircularProgress size={20} sx={{ mt: 0.5 }} />
              ) : (
                <Typography sx={{ fontSize: 26, fontWeight: 800 }}>
                  {availableCount === null ? "—" : availableCount}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {countError && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadCouponCount}>
                Retry
              </Button>
            }
          >
            {countError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.3fr) minmax(300px, 0.7fr)",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper
            component="form"
            onSubmit={handleValidate}
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              bgcolor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                display: "grid",
                placeItems: "center",
                bgcolor: colors.ink,
                color: "#FFFFFF",
                borderRadius: 2,
                mb: 2.5,
              }}
            >
              <LocalOfferOutlined />
            </Box>

            <Typography
              component="h2"
              sx={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 27,
                fontWeight: 700,
                mb: 1,
              }}
            >
              Have a coupon code?
            </Typography>

            <Typography sx={{ color: colors.muted, mb: 3 }}>
              Enter your code and order subtotal to check whether the coupon can
              be applied.
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Coupon code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  setValidationResult(null);
                  setValidationError("");
                }}
                placeholder="Enter your coupon code"
                fullWidth
                inputProps={{ maxLength: 60 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ConfirmationNumberOutlined
                        sx={{ color: colors.muted }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: colors.white,
                  },
                }}
              />

              <TextField
                label="Order subtotal"
                type="number"
                value={subtotal}
                onChange={(event) => {
                  setSubtotal(event.target.value);
                  setValidationResult(null);
                  setValidationError("");
                }}
                placeholder="Enter amount in ₹"
                fullWidth
                inputProps={{ min: 0.01, step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                helperText="Enter the subtotal before applying the coupon, not the final payable amount."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: colors.white,
                  },
                }}
              />

              {validationError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {validationError}
                </Alert>
              )}

              {validationResult && (
                <Alert
                  severity={resultIsValid === false ? "warning" : "success"}
                  sx={{ borderRadius: 2 }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                    {resultIsValid === false
                      ? "Coupon is not eligible"
                      : "Coupon validation response received"}
                  </Typography>

                  {validationResult.message ||
                    validationResult.description ||
                    (resultIsValid === false
                      ? "Try another code or check the order requirements."
                      : "Check the details returned by your coupon service.")}

                  {discountValue !== undefined && discountValue !== null && (
                    <Typography sx={{ mt: 1, fontWeight: 700 }}>
                      Discount: {formatCurrency(discountValue)}
                    </Typography>
                  )}

                  {resultIsValid !== false && (
                    <Button
                      size="small"
                      startIcon={<ContentCopyOutlined />}
                      onClick={handleCopyCode}
                      sx={{
                        mt: 1,
                        color: colors.ink,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Copy code
                    </Button>
                  )}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={validating}
                startIcon={
                  validating ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <VerifiedOutlined />
                  )
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: colors.gold,
                  color: "#172D29",
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#D99B19",
                    boxShadow: "none",
                  },
                }}
              >
                {validating ? "Checking coupon..." : "Validate coupon"}
              </Button>
            </Stack>
          </Paper>

          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: colors.ink,
                color: "#FFFFFF",
                borderRadius: 3,
              }}
            >
              <ShoppingBagOutlined sx={{ fontSize: 30, mb: 2 }} />

              <Typography
                component="h2"
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 25,
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                A little saving goes a long way.
              </Typography>

              <Typography
                sx={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.7 }}
              >
                Check your coupon before checkout to see whether your order
                qualifies for a discount.
              </Typography>

              <Divider
                sx={{
                  borderColor: "rgba(255,255,255,0.18)",
                  my: 2.5,
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/cart")}
                sx={{
                  py: 1.3,
                  bgcolor: colors.gold,
                  color: "#172D29",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#D99B19" },
                }}
              >
                Go to cart
              </Button>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
              }}
            >
              <Typography
                component="h3"
                sx={{ fontWeight: 800, fontSize: 17, mb: 2 }}
              >
                Before you apply
              </Typography>

              <Stack spacing={2}>
                {[
                  "Enter the exact coupon code.",
                  "Use the current order subtotal.",
                  "Check the validation result before proceeding to checkout.",
                ].map((item, index) => (
                  <Box key={item} sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 25,
                        height: 25,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#E9EEE6",
                        color: colors.ink,
                        borderRadius: "50%",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: colors.muted,
                        lineHeight: 1.7,
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
