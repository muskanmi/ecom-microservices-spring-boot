import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getProducts } from "../api/productApi";
import { getOrders } from "../api/orderApi";
import { getAvailableCouponCount } from "../api/couponApi";
import { addToCart } from "../api/cartApi";
import { addToWishlist, removeFromWishlist } from "../api/wishlistApi";

import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Rating,
  Skeleton,
  Snackbar,
  Stack as MuiStack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import {
  AccessTime,
  ArrowForward,
  Bolt,
  Check,
  ChevronLeft,
  ChevronRight,
  ConfirmationNumberOutlined,
  ErrorOutlined,
  Favorite,
  FavoriteBorder,
  Inventory2Outlined,
  LocalShippingOutlined,
  Refresh,
  SavingsOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";

import heroBanner from "../assets/ecommerce/banner_hero_img.png";
import fashionDress from "../assets/ecommerce/fashion-dress.png";
import blueHeadphones from "../assets/ecommerce/electronics-headphones-blue.png";
import greenShoes from "../assets/ecommerce/footwear-green-shoe.png";
import lipstick from "../assets/ecommerce/beauty-lipstick.png";
import chair from "../assets/ecommerce/home-kitchen-chair.png";
import handbag from "../assets/ecommerce/accessories-handbag.png";
import smartwatch from "../assets/ecommerce/smartwatch.png";
import runningShoes from "../assets/ecommerce/running-shoes.png";
import blackHandbag from "../assets/ecommerce/black-handbag.png";
import plant from "../assets/ecommerce/plant.png";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Adjust these to match your router.
const ROUTES = {
  orders: "/orders",
  wishlist: "/wishlist",
  coupons: "/coupons",
  cart: "/cart",
  // Kept from the original file – point this at your product-listing route.
  products: "/products/1",
  product: (id) => `/products/${id}`,
};

// 10 fills two complete rows on the 5-column desktop grid.
const PAGE_SIZE = 10;

const c = {
  ink: "#173F3D",
  inkDeep: "#0F2E2D",
  gold: "#E8AA2B",
  goldDark: "#D99414",
  goldSoft: "#FFF3D6",
  surface: "#FFFFFF",
  tint: "#FAF7F0",
  text: "#1F2A29",
  muted: "#6B665B",
  border: "#E8E1D3",
  green: "#17834B",
  greenSoft: "#E6F5EC",
  red: "#C13A45",
  redSoft: "#FCEBEC",
};

const shadow = {
  card: "0 1px 2px rgba(23,63,61,.05), 0 6px 20px rgba(23,63,61,.05)",
  hover: "0 14px 34px rgba(23,63,61,.16)",
};

const cardSx = {
  boxSizing: "border-box",
  bgcolor: c.surface,
  border: `1px solid ${c.border}`,
  borderRadius: 3,
  boxShadow: shadow.card,
};

const linkButtonSx = {
  color: c.ink,
  textTransform: "none",
  fontSize: 13,
  fontWeight: 700,
  minWidth: 0,
  px: 1,
  "&:hover": { bgcolor: "rgba(23,63,61,.06)" },
};

const categories = [
  { label: "Fashion", image: fashionDress },
  { label: "Electronics", image: blueHeadphones },
  { label: "Footwear", image: greenShoes },
  { label: "Beauty", image: lipstick },
  { label: "Home & Kitchen", image: chair },
  { label: "Accessories", image: handbag },
  { label: "More", image: plant },
];

const HERO_SLIDES = [
  {
    id: "summer",
    eyebrow: "Summer Sale is live ☀️",
    title: "Up to 50% Off",
    subtitle: "On fashion, electronics and more",
    cta: "Shop now",
    bgImage: heroBanner,
    bg: "#F3E3C6",
    fg: c.ink,
    subFg: c.muted,
    chipBg: "rgba(23,63,61,.08)",
    chipFg: c.ink,
    dot: c.ink,
  },
  {
    id: "electronics",
    eyebrow: "Electronics",
    title: "Sound & smart, for less",
    subtitle: "Headphones, smartwatches and everyday tech",
    cta: "Explore electronics",
    bg: `linear-gradient(135deg, ${c.inkDeep} 0%, ${c.ink} 55%, #1F5A56 100%)`,
    fg: "#FFFFFF",
    subFg: "rgba(255,255,255,.78)",
    chipBg: "rgba(255,255,255,.12)",
    chipFg: c.gold,
    dot: c.gold,
    images: [blueHeadphones, smartwatch],
  },
  {
    id: "style",
    eyebrow: "New season",
    title: "Step up your style",
    subtitle: "Footwear, handbags and accessories",
    cta: "Shop the edit",
    bg: "linear-gradient(135deg, #FBEACB 0%, #F4CF86 100%)",
    fg: c.ink,
    subFg: "#5E563F",
    chipBg: "rgba(23,63,61,.10)",
    chipFg: c.ink,
    dot: c.ink,
    images: [runningShoes, blackHandbag],
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatRupees = (value) => {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;

  return `₹${safe.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(safe) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

const discountPercentage = (price, mrp) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

const getPricing = (product) => {
  const price = Number(product?.price) || 0;
  const mrp = Number(product?.mrp ?? product?.originalPrice) || price;

  return {
    price,
    mrp,
    off: discountPercentage(price, mrp),
    save: Math.max(0, mrp - price),
  };
};

const getCategory = (product) =>
  product?.subcategory ||
  product?.categoryName ||
  product?.category?.name ||
  "";

const resolveImageUrl = (value) => {
  if (!value) return "/placeholder.png";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const baseUrl = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  return `${baseUrl}/${String(value).replace(/^\//, "")}`;
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getOrderDate = (order) =>
  order.createdAt || order.orderDate || order.createdDate;

const normalizeStatus = (status) =>
  String(status || "PENDING")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const prettyStatus = (status) => {
  const text = String(status).replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const STATUS_STYLE = {
  DELIVERED: { bg: "#EAF7EE", fg: "#17834B" },
  SHIPPED: { bg: "#EEF4FF", fg: "#3267C8" },
  CONFIRMED: { bg: "#EAF7EE", fg: "#17834B" },
  PROCESSING: { bg: "#F3EFE7", fg: "#75613D" },
  PENDING: { bg: "#FFF4D6", fg: "#946B16" },
  PENDING_PAYMENT: { bg: "#FFF4D6", fg: "#946B16" },
  CANCELLED: { bg: "#FCEBE8", fg: "#B5473A" },
  FAILED: { bg: "#FCEBE8", fg: "#B5473A" },
  REFUNDED: { bg: "#EEF4FF", fg: "#3267C8" },
};

const getStatusStyle = (status) =>
  STATUS_STYLE[status] || { bg: "#F3EFE7", fg: c.muted };

const INACTIVE_STATUSES = ["CANCELLED", "FAILED", "REFUNDED"];

const TRACK_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];

const STATUS_STEP = {
  PENDING: 0,
  PENDING_PAYMENT: 0,
  CONFIRMED: 1,
  PROCESSING: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
};

const STATUS_COPY = {
  PENDING_PAYMENT: {
    title: "Payment pending",
    body: "Complete your payment to confirm this order.",
  },
  PENDING: { title: "Order placed", body: "We've received your order." },
  CONFIRMED: {
    title: "Order confirmed",
    body: "Your items are being got ready.",
  },
  PROCESSING: {
    title: "Preparing your order",
    body: "Your items are being packed.",
  },
  SHIPPED: { title: "On the way", body: "Your package has shipped." },
  OUT_FOR_DELIVERY: {
    title: "Out for delivery",
    body: "Your package will reach you today.",
  },
  DELIVERED: { title: "Delivered", body: "Your order has been delivered." },
};

const getOrderImage = (order, productMap) => {
  const first = order.items?.[0];
  const productId = first?.productId ?? first?.product?.id;
  const match = productMap.get(String(productId));

  const raw =
    match?.images?.[0]?.imageUrl ||
    first?.imageUrl ||
    first?.product?.images?.[0]?.imageUrl ||
    first?.product?.imageUrl;

  return raw ? resolveImageUrl(raw) : null;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const secondsToMidnight = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((end - now) / 1000));
};

const onImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = "/placeholder.png";
};

// MUI v7 removed system props (alignItems, justifyContent, flexWrap) from
// Stack. This wrapper maps them into `sx` so every <Stack alignItems=...>
// in this file keeps working.
const Stack = ({ alignItems, justifyContent, flexWrap, sx, ...rest }) => (
  <MuiStack sx={{ alignItems, justifyContent, flexWrap, ...sx }} {...rest} />
);

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({
  title,
  subtitle,
  icon,
  right,
  onViewAll,
  viewAllLabel = "View all",
}) => (
  <Stack
    direction="row"
    alignItems="flex-end"
    justifyContent="space-between"
    spacing={2}
    sx={{ mb: 2 }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 18, md: 20 },
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: c.text,
          }}
        >
          {title}
        </Typography>
      </Stack>
      {subtitle && (
        <Typography sx={{ fontSize: 13, color: c.muted, mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>

    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ flexShrink: 0 }}
    >
      {right}
      {onViewAll && (
        <Button
          size="small"
          onClick={onViewAll}
          endIcon={<ChevronRight />}
          sx={linkButtonSx}
        >
          {viewAllLabel}
        </Button>
      )}
    </Stack>
  </Stack>
);

const Countdown = () => {
  const [left, setLeft] = useState(secondsToMidnight);

  useEffect(() => {
    const timer = setInterval(() => setLeft(secondsToMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  return (
    <Stack
      direction="row"
      spacing={0.6}
      alignItems="center"
      sx={{
        bgcolor: c.goldSoft,
        color: "#8A5E0A",
        borderRadius: 5,
        px: 1.25,
        py: 0.5,
        fontSize: 12,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <AccessTime sx={{ fontSize: 15 }} />
      <span>
        Ends in {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </Stack>
  );
};

/* -------------------------------------------------------------------------- */
/*  Hero carousel                                                             */
/* -------------------------------------------------------------------------- */

const HeroCarousel = ({ onShop }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (paused || reduceMotion) return undefined;

    const timer = setInterval(
      () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
      6500,
    );

    return () => clearInterval(timer);
  }, [paused, reduceMotion]);

  const go = (direction) =>
    setIndex((i) => (i + direction + HERO_SLIDES.length) % HERO_SLIDES.length);

  const arrowSx = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: 14,
    transform: "translateY(-50%)",
    zIndex: 4,
    width: 40,
    height: 40,
    bgcolor: "rgba(255,255,255,.92)",
    color: c.ink,
    boxShadow: "0 4px 14px rgba(0,0,0,.12)",
    opacity: 0,
    transition: "opacity .2s",
    display: { xs: "none", sm: "inline-flex" },
    "&:hover": { bgcolor: "#fff" },
  });

  return (
    <Paper
      elevation={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        minHeight: { xs: 280, sm: 320, md: 380 },
        borderRadius: 4,
        border: `1px solid ${c.border}`,
        boxShadow: shadow.card,
        "&:hover .hero-arrow, & .hero-arrow:focus-visible": { opacity: 1 },
      }}
    >
      {HERO_SLIDES.map((slide, i) => {
        const active = i === index;

        return (
          <Box
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${HERO_SLIDES.length}`}
            aria-hidden={!active}
            sx={{
              position: "absolute",
              inset: 0,
              background: slide.bg,
              opacity: active ? 1 : 0,
              visibility: active ? "visible" : "hidden",
              transition: "opacity .7s ease, visibility .7s",
            }}
          >
            {slide.bgImage && (
              <Box
                component="img"
                src={slide.bgImage}
                alt=""
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            )}

            {slide.images && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: { xs: 0, md: 32 },
                  bottom: 0,
                  width: { xs: "42%", sm: "46%", md: "48%" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Box
                  component="img"
                  src={slide.images[0]}
                  alt=""
                  sx={{
                    height: { xs: 150, sm: 210, md: 280 },
                    maxWidth: "70%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 18px 24px rgba(0,0,0,.28))",
                    zIndex: 1,
                  }}
                />
                <Box
                  component="img"
                  src={slide.images[1]}
                  alt=""
                  sx={{
                    display: { xs: "none", sm: "block" },
                    height: { sm: 150, md: 210 },
                    maxWidth: "50%",
                    objectFit: "contain",
                    ml: { sm: -4, md: -6 },
                    mt: { sm: 10, md: 12 },
                    filter: "drop-shadow(0 14px 20px rgba(0,0,0,.24))",
                  }}
                />
              </Box>
            )}

            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                pl: { xs: 3, sm: 5, md: 8 },
                pr: 2,
                width: { xs: "66%", sm: "54%", md: "48%" },
                transform: active ? "none" : "translateY(10px)",
                transition: "transform .7s ease",
              }}
            >
              <Box
                sx={{
                  bgcolor: slide.chipBg,
                  color: slide.chipFg,
                  px: 1.4,
                  py: 0.5,
                  borderRadius: 5,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  mb: 1.75,
                }}
              >
                {slide.eyebrow}
              </Box>

              <Typography
                component="p"
                sx={{
                  fontSize: { xs: 30, sm: 42, md: 52 },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: slide.fg,
                  mb: 1.5,
                }}
              >
                {slide.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 16, md: 18 },
                  color: slide.subFg,
                  mb: 3,
                  maxWidth: 420,
                }}
              >
                {slide.subtitle}
              </Typography>

              <Button
                variant="contained"
                disableElevation
                onClick={onShop}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: c.gold,
                  color: c.inkDeep,
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: 15,
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": { bgcolor: c.goldDark },
                }}
              >
                {slide.cta}
              </Button>
            </Box>
          </Box>
        );
      })}

      <IconButton
        className="hero-arrow"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        sx={arrowSx("left")}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        className="hero-arrow"
        aria-label="Next slide"
        onClick={() => go(1)}
        sx={arrowSx("right")}
      >
        <ChevronRight />
      </IconButton>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          position: "absolute",
          left: { xs: 24, sm: 40, md: 64 },
          bottom: 20,
          zIndex: 3,
        }}
      >
        {HERO_SLIDES.map((slide, i) => (
          <ButtonBase
            key={slide.id}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            sx={{
              height: 8,
              width: i === index ? 26 : 8,
              borderRadius: 4,
              bgcolor: HERO_SLIDES[index].dot,
              opacity: i === index ? 1 : 0.35,
              transition: "all .3s ease",
            }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

/* -------------------------------------------------------------------------- */
/*  Stats                                                                     */
/* -------------------------------------------------------------------------- */

const StatCard = ({
  icon: Icon,
  label,
  value,
  caption,
  tone,
  loading,
  onClick,
}) => {
  const Wrapper = onClick ? ButtonBase : Box;

  return (
    <Wrapper
      onClick={onClick}
      sx={{
        ...cardSx,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 1.75,
        p: 2,
        width: "100%",
        textAlign: "left",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        ...(onClick && {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: shadow.hover,
            borderColor: "rgba(232,170,43,.7)",
          },
        }),
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2.5,
          bgcolor: tone.bg,
          color: tone.fg,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: c.muted, fontWeight: 500 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={56} height={32} />
        ) : (
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: c.text,
              lineHeight: 1.25,
            }}
            noWrap
          >
            {value}
          </Typography>
        )}
        <Typography sx={{ fontSize: 11.5, color: c.muted }} noWrap>
          {caption}
        </Typography>
      </Box>
    </Wrapper>
  );
};

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */

const CategoryTile = ({ label, image, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      minWidth: 0,
      borderRadius: 3,
      "&:hover .tile-img": {
        transform: "translateY(-3px)",
        borderColor: c.gold,
        boxShadow: shadow.hover,
      },
    }}
  >
    <Box
      className="tile-img"
      sx={{
        width: "100%",
        aspectRatio: "1 / 1",
        bgcolor: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 3,
        p: 1.5,
        boxSizing: "border-box",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        component="img"
        src={image}
        alt=""
        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </Box>
    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: c.text }} noWrap>
      {label}
    </Typography>
  </ButtonBase>
);

/* -------------------------------------------------------------------------- */
/*  Product card                                                              */
/* -------------------------------------------------------------------------- */

const ProductSkeleton = () => (
  <Paper elevation={0} sx={{ ...cardSx, p: 1.5 }}>
    <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
    <Skeleton width="85%" sx={{ mt: 1.5 }} />
    <Skeleton width="45%" />
    <Skeleton width="60%" height={30} />
    <Skeleton variant="rounded" height={38} sx={{ mt: 1.5 }} />
  </Paper>
);

const DealsCtaTile = ({ count, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      ...cardSx,
      flexDirection: "column",
      justifyContent: "center",
      gap: 1,
      p: 2,
      textAlign: "center",
      background: `linear-gradient(160deg, ${c.ink} 0%, ${c.inkDeep} 100%)`,
      color: "#fff",
      borderColor: c.ink,
      transition: "transform .2s, box-shadow .2s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: shadow.hover },
    }}
  >
    <Bolt sx={{ fontSize: 34, color: c.gold }} />
    <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>
      See all deals
    </Typography>
    <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,.75)" }}>
      {count > 0 ? `${count} offers live today` : "New offers every day"}
    </Typography>
    <Box
      sx={{
        mt: 0.5,
        display: "grid",
        placeItems: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        bgcolor: c.gold,
        color: c.inkDeep,
      }}
    >
      <ArrowForward sx={{ fontSize: 20 }} />
    </Box>
  </ButtonBase>
);

const ProductCard = ({
  product,
  wished,
  wishPending,
  adding,
  added,
  onOpen,
  onToggleWish,
  onAddToCart,
  sx,
}) => {
  const { price, mrp, off, save } = getPricing(product);
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.reviews) || 0;

  return (
    <Paper
      elevation={0}
      role="link"
      tabIndex={0}
      aria-label={product.name}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      sx={{
        ...cardSx,
        p: 1.5,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        "&:hover, &:focus-visible": {
          transform: "translateY(-4px)",
          boxShadow: shadow.hover,
          borderColor: "rgba(232,170,43,.7)",
          outline: "none",
        },
        "&:hover .product-img": { transform: "scale(1.05)" },
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 176,
          flexShrink: 0,
          bgcolor: c.tint,
          borderRadius: 2,
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box
          className="product-img"
          component="img"
          src={resolveImageUrl(product.images?.[0]?.imageUrl)}
          alt={product.name}
          loading="lazy"
          onError={onImageError}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 1.25,
            boxSizing: "border-box",
            transition: "transform .35s ease",
          }}
        />

        {off > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              bgcolor: c.red,
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 800,
              px: 1,
              py: 0.35,
              borderRadius: 1.5,
            }}
          >
            -{off}%
          </Box>
        )}

        <Tooltip title={wished ? "Remove from wishlist" : "Save to wishlist"}>
          <span style={{ position: "absolute", top: 8, right: 8 }}>
            <IconButton
              size="small"
              disabled={wishPending}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              onClick={(event) => {
                event.stopPropagation();
                onToggleWish();
              }}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "rgba(255,255,255,.95)",
                border: `1px solid ${c.border}`,
                color: wished ? c.red : c.ink,
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              {wished ? (
                <Favorite sx={{ fontSize: 17 }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: 17 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color: c.muted,
          mt: 1.5,
          fontWeight: 500,
        }}
        noWrap
      >
        {getCategory(product) || "Marketplace"}
      </Typography>

      <Typography
        sx={{
          fontSize: 14.5,
          fontWeight: 700,
          color: c.text,
          lineHeight: 1.35,
          minHeight: 39,
          mt: 0.25,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {product.name}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.6}
        sx={{ mt: 0.5, minHeight: 20 }}
      >
        {reviews > 0 ? (
          <>
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              size="small"
              sx={{
                fontSize: 15,
                "& .MuiRating-iconFilled": { color: c.gold },
                "& .MuiRating-iconEmpty": { color: "#D8D1C5" },
              }}
            />
            <Typography sx={{ fontSize: 11.5, color: c.muted }}>
              {rating.toFixed(1)} ({reviews})
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: 11.5, color: c.muted }}>
            No reviews yet
          </Typography>
        )}
      </Stack>

      <Stack
        direction="row"
        alignItems="baseline"
        spacing={0.9}
        sx={{ mt: 0.75 }}
      >
        <Typography
          sx={{
            fontSize: 19,
            fontWeight: 800,
            color: c.text,
            letterSpacing: "-0.01em",
          }}
        >
          {formatRupees(price)}
        </Typography>
        {off > 0 && (
          <Typography
            sx={{
              fontSize: 12.5,
              color: c.muted,
              textDecoration: "line-through",
            }}
          >
            {formatRupees(mrp)}
          </Typography>
        )}
      </Stack>

      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: c.green,
          minHeight: 18,
          mb: 1.25,
        }}
      >
        {off > 0 ? `You save ${formatRupees(save)}` : ""}
      </Typography>

      <Button
        fullWidth
        disableElevation
        variant="contained"
        disabled={adding}
        onClick={(event) => {
          event.stopPropagation();
          onAddToCart();
        }}
        startIcon={
          adding ? (
            <CircularProgress size={15} color="inherit" />
          ) : added ? (
            <Check sx={{ fontSize: 18 }} />
          ) : (
            <ShoppingCartOutlined sx={{ fontSize: 18 }} />
          )
        }
        sx={{
          mt: "auto",
          py: 1,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 800,
          fontSize: 13.5,
          bgcolor: added ? c.green : c.gold,
          color: added ? "#fff" : "#171717",
          "&:hover": { bgcolor: added ? c.green : c.goldDark },
          "&.Mui-disabled": {
            bgcolor: c.gold,
            color: "#171717",
            opacity: 0.75,
          },
        }}
      >
        {adding ? "Adding…" : added ? "Added" : "Add to cart"}
      </Button>
    </Paper>
  );
};

/* -------------------------------------------------------------------------- */
/*  Right rail                                                                */
/* -------------------------------------------------------------------------- */

const OrderStatusCard = ({ order, image, loading, onNavigate, onShop, sx }) => {
  const status = order ? normalizeStatus(order.status) : null;
  const step = status ? (STATUS_STEP[status] ?? 0) : 0;
  const copy = status
    ? STATUS_COPY[status] || { title: prettyStatus(status), body: "" }
    : null;
  const paymentPending = status === "PENDING_PAYMENT";

  return (
    <Paper elevation={0} sx={{ ...cardSx, p: 2.5, ...sx }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <LocalShippingOutlined sx={{ fontSize: 20, color: c.ink }} />
        <Typography
          component="h2"
          sx={{ fontSize: 16, fontWeight: 700, color: c.text }}
        >
          Track your order
        </Typography>
      </Stack>

      {loading ? (
        <>
          <Skeleton width="55%" height={26} />
          <Skeleton width="80%" />
          <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" height={40} sx={{ mt: 2 }} />
        </>
      ) : !order ? (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: c.text }}>
            No active orders
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: c.muted, mt: 0.5 }}>
            When you place an order you can follow it here.
          </Typography>
          <Button
            onClick={onShop}
            sx={{ ...linkButtonSx, mt: 1 }}
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
          >
            Start shopping
          </Button>
        </Box>
      ) : (
        <>
          <Typography
            sx={{
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: paymentPending ? "#946B16" : c.text,
            }}
          >
            {copy.title}
          </Typography>
          {copy.body && (
            <Typography sx={{ fontSize: 13, color: c.muted, mt: 0.25 }}>
              {copy.body}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mt: 2,
              p: 1.25,
              bgcolor: c.tint,
              border: `1px solid ${c.border}`,
              borderRadius: 2,
            }}
          >
            <Box
              component="img"
              src={image || "/placeholder.png"}
              alt=""
              onError={onImageError}
              sx={{
                width: 48,
                height: 48,
                objectFit: "contain",
                bgcolor: "#fff",
                borderRadius: 1.5,
                p: 0.5,
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: c.text }}
                noWrap
              >
                {order.orderNumber || order.id}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: c.muted }}>
                {formatDate(getOrderDate(order))}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: c.text }}>
              {formatRupees(order.totalAmount ?? order.total)}
            </Typography>
          </Stack>

          {!paymentPending && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${TRACK_STEPS.length}, 1fr)`,
                mt: 2.5,
              }}
            >
              {TRACK_STEPS.map((label, i) => {
                const done = i < step || step === TRACK_STEPS.length - 1;
                const current = i === step && !done;

                return (
                  <Box
                    key={label}
                    sx={{ position: "relative", textAlign: "center" }}
                  >
                    {i < TRACK_STEPS.length - 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 11,
                          left: "50%",
                          width: "100%",
                          height: 2,
                          bgcolor: i < step ? c.ink : c.border,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        mx: "auto",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: done ? c.ink : "#fff",
                        border: `2px solid ${done || current ? c.ink : c.border}`,
                        boxShadow: current
                          ? `0 0 0 4px rgba(232,170,43,.35)`
                          : "none",
                        color: "#fff",
                      }}
                    >
                      {done && <Check sx={{ fontSize: 14 }} />}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        mt: 0.75,
                        fontWeight: done || current ? 700 : 500,
                        color: done || current ? c.text : c.muted,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          <Button
            fullWidth
            disableElevation
            variant={paymentPending ? "contained" : "outlined"}
            onClick={onNavigate}
            sx={{
              mt: 2.5,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              fontSize: 13.5,
              ...(paymentPending
                ? {
                    bgcolor: c.gold,
                    color: "#171717",
                    "&:hover": { bgcolor: c.goldDark },
                  }
                : {
                    color: c.ink,
                    borderColor: c.border,
                    "&:hover": {
                      borderColor: c.ink,
                      bgcolor: "rgba(23,63,61,.04)",
                    },
                  }),
            }}
          >
            {paymentPending ? "Complete payment" : "View order details"}
          </Button>
        </>
      )}
    </Paper>
  );
};

const RecentOrdersCard = ({
  orders,
  loading,
  onOpen,
  onViewAll,
  onShop,
  sx,
}) => (
  <Paper elevation={0} sx={{ ...cardSx, p: 2.5, ...sx }}>
    <SectionHeader title="Recent orders" onViewAll={onViewAll} />

    {loading ? (
      <Stack spacing={1.5}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Stack>
    ) : orders.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: c.muted }}>
          You haven&apos;t placed any orders yet.
        </Typography>
        <Button onClick={onShop} sx={{ ...linkButtonSx, mt: 0.5 }}>
          Start shopping
        </Button>
      </Box>
    ) : (
      <Stack spacing={0.5}>
        {orders.map((order) => {
          const style = getStatusStyle(order.status);

          return (
            <ButtonBase
              key={order.key}
              onClick={onOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                textAlign: "left",
                p: 1,
                mx: -1,
                borderRadius: 2,
                "&:hover": { bgcolor: c.tint },
              }}
              style={{ width: "calc(100% + 16px)" }}
            >
              <Box
                component="img"
                src={order.image || "/placeholder.png"}
                alt=""
                onError={onImageError}
                sx={{
                  width: 48,
                  height: 48,
                  objectFit: "contain",
                  bgcolor: c.tint,
                  border: `1px solid ${c.border}`,
                  borderRadius: 1.5,
                  p: 0.5,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: c.text }}
                  noWrap
                >
                  {order.number}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: c.muted }}>
                  {order.date}
                  {order.itemCount > 0 &&
                    ` · ${order.itemCount} item${order.itemCount > 1 ? "s" : ""}`}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Chip
                  label={prettyStatus(order.status)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10.5,
                    fontWeight: 700,
                    bgcolor: style.bg,
                    color: style.fg,
                    "& .MuiChip-label": { px: 0.9 },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    mt: 0.4,
                    color: c.text,
                  }}
                >
                  {formatRupees(order.total)}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>
    )}
  </Paper>
);

const SavedForLaterCard = ({
  items,
  addingId,
  onViewAll,
  onOpen,
  onAdd,
  sx,
}) => (
  <Paper elevation={0} sx={{ ...cardSx, p: 2.5, ...sx }}>
    <SectionHeader title="Saved for later" onViewAll={onViewAll} />

    {items.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 1.5 }}>
        <FavoriteBorder sx={{ color: c.muted, fontSize: 28 }} />
        <Typography sx={{ fontSize: 13, color: c.muted, mt: 0.5 }}>
          Tap the heart on any product to save it here.
        </Typography>
      </Box>
    ) : (
      <Stack spacing={1.5}>
        {items.map((product) => {
          const { price, mrp, off } = getPricing(product);

          return (
            <Stack
              key={product.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <ButtonBase
                onClick={() => onOpen(product)}
                aria-label={`Open ${product.name}`}
                sx={{ flexShrink: 0, borderRadius: 2 }}
              >
                <Box
                  component="img"
                  src={resolveImageUrl(product.images?.[0]?.imageUrl)}
                  alt=""
                  onError={onImageError}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: "contain",
                    bgcolor: c.tint,
                    border: `1px solid ${c.border}`,
                    borderRadius: 2,
                    p: 0.5,
                  }}
                />
              </ButtonBase>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 700, color: c.text }}
                  noWrap
                >
                  {product.name}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="baseline">
                  <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                    {formatRupees(price)}
                  </Typography>
                  {off > 0 && (
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: c.muted,
                        textDecoration: "line-through",
                      }}
                    >
                      {formatRupees(mrp)}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Button
                size="small"
                variant="outlined"
                disabled={addingId === product.id}
                onClick={() => onAdd(product)}
                sx={{
                  minWidth: 58,
                  flexShrink: 0,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 1.5,
                  color: c.ink,
                  borderColor: c.gold,
                  borderWidth: 1.5,
                  "&:hover": {
                    borderWidth: 1.5,
                    borderColor: c.goldDark,
                    bgcolor: "rgba(232,170,43,.10)",
                  },
                }}
              >
                {addingId === product.id ? "…" : "Add"}
              </Button>
            </Stack>
          );
        })}
      </Stack>
    )}
  </Paper>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const DashboardPage = () => {
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const { wishlist, fetchWishlist } = useWishlist();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [availableCouponCount, setAvailableCouponCount] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [wishPending, setWishPending] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
    cartLink: false,
  });

  const dealsRef = useRef(null);

  /* ----------------------------- data fetching ----------------------------- */

  useEffect(() => {
    let active = true;

    const fetchAvailableCoupons = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !user?.id) {
          if (active) setAvailableCouponCount(null);
          return;
        }

        const response = await getAvailableCouponCount(token, user.id);

        if (active) {
          const payload = response.data;
          const count =
            typeof payload === "number"
              ? payload
              : (payload?.count ??
                payload?.availableCount ??
                payload?.availableCouponCount);

          setAvailableCouponCount(
            Number.isFinite(Number(count)) ? Number(count) : null,
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch available coupons:",
          error.response?.status,
          error.response?.data,
        );
        if (active) setAvailableCouponCount(null);
      }
    };

    fetchAvailableCoupons();

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(false);

      try {
        const response = await getProducts();
        const data = response.data;

        if (active) {
          setProducts(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.content)
                ? data.content
                : [],
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (active) setProductsError(true);
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      if (!user?.id) {
        if (active) {
          setOrders([]);
          setOrdersLoading(false);
        }
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await getOrders(token, user.id);

        if (active) {
          setOrders(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch account orders:", error);
        if (active) setOrders([]);
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [user?.id]);

  /* ------------------------------ derived data ----------------------------- */

  const activeProducts = useMemo(
    () => products.filter((product) => product.active !== false),
    [products],
  );

  const productMap = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products],
  );

  const wishlistItems = useMemo(() => wishlist?.items ?? [], [wishlist?.items]);

  const wishedMap = useMemo(
    () => new Map(wishlistItems.map((item) => [String(item.productId), item])),
    [wishlistItems],
  );

  const savedProducts = useMemo(
    () =>
      wishlistItems
        .map((item) => productMap.get(String(item.productId)) || item.product)
        .filter(Boolean)
        .slice(0, 3),
    [wishlistItems, productMap],
  );

  const deals = useMemo(
    () =>
      activeProducts
        .map((product) => ({ product, off: getPricing(product).off }))
        .filter(({ off }) => off >= 10)
        .sort((a, b) => b.off - a.off)
        .slice(0, 10)
        .map(({ product }) => product),
    [activeProducts],
  );

  const categoryOptions = useMemo(() => {
    const seen = new Set();
    activeProducts.forEach((product) => {
      const category = getCategory(product);
      if (category) seen.add(category);
    });
    return ["All", ...Array.from(seen).slice(0, 8)];
  }, [activeProducts]);

  const filteredProducts = useMemo(
    () =>
      activeCategory === "All"
        ? activeProducts
        : activeProducts.filter(
            (product) => getCategory(product) === activeCategory,
          ),
    [activeProducts, activeCategory],
  );

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(getOrderDate(b) || 0).getTime() -
          new Date(getOrderDate(a) || 0).getTime(),
      ),
    [orders],
  );

  const recentOrders = useMemo(
    () =>
      sortedOrders.slice(0, 3).map((order) => ({
        key: order.id ?? order.orderNumber,
        number: order.orderNumber || order.id,
        date: formatDate(getOrderDate(order)),
        status: normalizeStatus(order.status),
        total: order.totalAmount ?? order.total ?? 0,
        itemCount: order.items?.length ?? 0,
        image: getOrderImage(order, productMap),
      })),
    [sortedOrders, productMap],
  );

  const latestActiveOrder = useMemo(
    () =>
      sortedOrders.find(
        (order) => !INACTIVE_STATUSES.includes(normalizeStatus(order.status)),
      ),
    [sortedOrders],
  );

  const totalSavings = useMemo(
    () =>
      orders
        .filter((order) => order.paymentStatus === "PAID")
        .reduce((sum, order) => sum + Number(order.discount || 0), 0),
    [orders],
  );

  const stats = [
    {
      key: "orders",
      label: "Total orders",
      value: orders.length,
      loading: ordersLoading,
      caption: "View order history",
      icon: Inventory2Outlined,
      tone: { bg: "#E7F0EE", fg: c.ink },
      onClick: () => navigate(ROUTES.orders),
    },
    {
      key: "wishlist",
      label: "Wishlist items",
      value: wishlistItems.length,
      caption: "Saved for later",
      icon: FavoriteBorder,
      tone: { bg: c.redSoft, fg: c.red },
      onClick: () => navigate(ROUTES.wishlist),
    },
    {
      key: "coupons",
      label: "Coupons available",
      value: availableCouponCount ?? "—",
      caption: availableCouponCount > 0 ? "Ready to use" : "Browse coupons",
      icon: ConfirmationNumberOutlined,
      tone: { bg: c.goldSoft, fg: "#A8730B" },
      onClick: () => navigate(ROUTES.coupons),
    },
    {
      key: "savings",
      label: "Total saved",
      value: formatRupees(totalSavings),
      caption: "Across paid orders",
      icon: SavingsOutlined,
      tone: { bg: c.greenSoft, fg: c.green },
    },
  ];

  const firstName = (user?.name || "there").split(" ")[0];
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [],
  );
  const greeting = useMemo(getGreeting, []);

  /* -------------------------------- handlers ------------------------------- */

  const notify = (message, severity = "success", cartLink = false) =>
    setToast({ open: true, message, severity, cartLink });

  const closeToast = (_event, reason) => {
    if (reason === "clickaway") return;
    setToast((t) => ({ ...t, open: false }));
  };

  const handleAddToCart = async (product) => {
    if (!user?.id) {
      notify("Please sign in to add items to your cart.", "warning");
      return;
    }

    setAddingId(product.id);

    try {
      const token = localStorage.getItem("token");

      await addToCart({ productId: product.id, quantity: 1 }, token, user.id);
      await fetchCart();

      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(
        () =>
          setAddedIds((prev) => {
            const next = { ...prev };
            delete next[product.id];
            return next;
          }),
        2000,
      );

      notify(`${product.name} was added to your cart`, "success", true);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      console.error("Backend response:", error.response?.data);
      notify("We couldn't add that to your cart. Please try again.", "error");
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!user?.id) {
      notify("Please sign in to save items to your wishlist.", "warning");
      return;
    }

    const existing = wishedMap.get(String(product.id));
    setWishPending((prev) => ({ ...prev, [product.id]: true }));

    try {
      const token = localStorage.getItem("token");

      if (existing) {
        await removeFromWishlist(existing.id, token, user.id);
      } else {
        await addToWishlist(product.id, token, user.id);
      }

      await fetchWishlist();
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      console.error("Backend response:", error.response?.data);
      notify("We couldn't update your wishlist. Please try again.", "error");
    } finally {
      setWishPending((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const scrollDeals = (direction) => {
    const el = dealsRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  };

  const goToProducts = () => navigate(ROUTES.products);

  const renderProductCard = (product, sx) => (
    <ProductCard
      key={product.id}
      product={product}
      sx={sx}
      wished={wishedMap.has(String(product.id))}
      wishPending={Boolean(wishPending[product.id])}
      adding={addingId === product.id}
      added={Boolean(addedIds[product.id])}
      onOpen={() => navigate(ROUTES.product(product.id))}
      onToggleWish={() => handleWishlistToggle(product)}
      onAddToCart={() => handleAddToCart(product)}
    />
  );

  // Deals: 5 slots on desktop (4 deals + the "See all" tile fill it exactly).
  const dealGap = 12; // gap: 1.5 => 12px
  const dealWidth = (cols) =>
    `calc((100% - ${(cols - 1) * dealGap}px) / ${cols})`;
  const dealSlots = deals.length + 1; // +1 for the CTA tile

  // Recommended: fixed column counts, so cards keep a natural size.
  const recommendedColumns = {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    md: "repeat(4, minmax(0, 1fr))",
    lg: "repeat(5, minmax(0, 1fr))",
  };

  /* --------------------------------- render -------------------------------- */

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 1360,
        mx: "auto",
        px: { xs: 2, sm: 3, xl: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      {/* Page header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography sx={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>
            {todayLabel}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 26, md: 34 },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: c.text,
              mt: 0.5,
            }}
          >
            {greeting}, {firstName}
          </Typography>
          <Typography sx={{ color: c.muted, fontSize: 15, mt: 0.75 }}>
            Here&apos;s what&apos;s happening with your account today.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<LocalShippingOutlined />}
            onClick={() => navigate(ROUTES.orders)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              whiteSpace: "nowrap",
              color: c.ink,
              bgcolor: c.surface,
              borderColor: c.border,
              "&:hover": { borderColor: c.ink, bgcolor: c.surface },
            }}
          >
            Track orders
          </Button>
          <Button
            variant="outlined"
            startIcon={<ConfirmationNumberOutlined />}
            onClick={() => navigate(ROUTES.coupons)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              whiteSpace: "nowrap",
              color: c.ink,
              bgcolor: c.surface,
              borderColor: c.border,
              "&:hover": { borderColor: c.ink, bgcolor: c.surface },
            }}
          >
            My coupons
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
          mb: 3,
        }}
      >
        {stats.map(({ key, ...stat }) => (
          <StatCard key={key} {...stat} />
        ))}
      </Box>

      {/* Row 1: hero + (order tracking, saved). Hero stretches to the rail's height. */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "minmax(0, 1fr) 340px",
          },
          gap: 3,
          alignItems: "stretch",
          mb: 4,
        }}
      >
        <HeroCarousel onShop={goToProducts} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            minWidth: 0,
          }}
        >
          <OrderStatusCard
            order={latestActiveOrder}
            image={
              latestActiveOrder
                ? getOrderImage(latestActiveOrder, productMap)
                : null
            }
            loading={ordersLoading}
            onNavigate={() => navigate(ROUTES.orders)}
            onShop={goToProducts}
          />
          <SavedForLaterCard
            sx={{ flex: 1 }}
            items={savedProducts}
            addingId={addingId}
            onViewAll={() => navigate(ROUTES.wishlist)}
            onOpen={(product) => navigate(ROUTES.product(product.id))}
            onAdd={handleAddToCart}
          />
        </Box>
      </Box>

      {/* Row 2: categories + recent orders */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "minmax(0, 1fr) 340px",
          },
          gap: 3,
          alignItems: "start",
          mb: 4,
        }}
      >
        <Box component="section" sx={{ minWidth: 0 }}>
          <SectionHeader
            title="Shop by category"
            subtitle="Find what you're looking for faster"
            onViewAll={goToProducts}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(4, minmax(0, 1fr))",
                md: "repeat(7, minmax(0, 1fr))",
              },
              gap: { xs: 1.25, md: 1.5 },
            }}
          >
            {categories.map(({ label, image }) => (
              <CategoryTile
                key={label}
                label={label}
                image={image}
                onClick={goToProducts}
              />
            ))}
          </Box>
        </Box>

        <RecentOrdersCard
          orders={recentOrders.slice(0, 2)}
          loading={ordersLoading}
          onOpen={() => navigate(ROUTES.orders)}
          onViewAll={() => navigate(ROUTES.orders)}
          onShop={goToProducts}
        />
      </Box>

      {/* Deals of the day – full width */}
      {(productsLoading || deals.length > 0) && (
        <Paper
          component="section"
          elevation={0}
          sx={{
            ...cardSx,
            p: { xs: 2, md: 2.5 },
            mb: 4,
            background: "linear-gradient(180deg, #FFF4DA 0%, #FFFFFF 40%)",
          }}
        >
          <SectionHeader
            icon={<Bolt sx={{ color: c.goldDark }} />}
            title="Deals of the day"
            subtitle="Biggest savings from the catalogue"
            right={
              <>
                <Countdown />
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    display: {
                      xs: "none",
                      md: dealSlots > 4 ? "flex" : "none",
                      lg: dealSlots > 5 ? "flex" : "none",
                    },
                  }}
                >
                  {[-1, 1].map((direction) => (
                    <IconButton
                      key={direction}
                      size="small"
                      aria-label={
                        direction < 0
                          ? "Scroll deals left"
                          : "Scroll deals right"
                      }
                      onClick={() => scrollDeals(direction)}
                      sx={{
                        border: `1px solid ${c.border}`,
                        bgcolor: c.surface,
                        color: c.ink,
                        "&:hover": { bgcolor: c.tint },
                      }}
                    >
                      {direction < 0 ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                  ))}
                </Stack>
              </>
            }
          />

          <Box
            ref={dealsRef}
            sx={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: {
                xs: "170px",
                sm: "200px",
                md: dealWidth(4),
                lg: dealWidth(5),
              },
              gap: 1.5,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              pb: 1.5,
              pt: 0.5,
              px: 0.5,
              mx: -0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              "& > *": { minWidth: 0, scrollSnapAlign: "start" },
            }}
          >
            {productsLoading ? (
              [0, 1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
            ) : (
              <>
                {deals.map((product) => renderProductCard(product))}
                <DealsCtaTile count={deals.length} onClick={goToProducts} />
              </>
            )}
          </Box>
        </Paper>
      )}

      {/* Recommended – full width, below the grid */}
      <Box component="section">
        <SectionHeader
          title="Recommended for you"
          subtitle="Fresh picks from across the marketplace"
          onViewAll={goToProducts}
        />

        {categoryOptions.length > 1 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 2,
              overflowX: "auto",
              pb: 0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {categoryOptions.map((category) => {
              const selected = category === activeCategory;

              return (
                <Chip
                  key={category}
                  label={category}
                  clickable
                  onClick={() => selectCategory(category)}
                  sx={{
                    flexShrink: 0,
                    height: 34,
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 5,
                    bgcolor: selected ? c.ink : c.surface,
                    color: selected ? "#fff" : c.text,
                    border: `1px solid ${selected ? c.ink : c.border}`,
                    "&:hover": { bgcolor: selected ? c.ink : c.tint },
                  }}
                />
              );
            })}
          </Stack>
        )}

        {productsError ? (
          <Paper
            elevation={0}
            sx={{ ...cardSx, py: 5, px: 3, textAlign: "center" }}
          >
            <ErrorOutlined sx={{ fontSize: 36, color: c.red }} />
            <Typography sx={{ fontWeight: 700, color: c.text, mt: 1 }}>
              We couldn&apos;t load products
            </Typography>
            <Typography sx={{ fontSize: 13, color: c.muted, mt: 0.5 }}>
              Check your connection and try again.
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={() => setReloadKey((k) => k + 1)}
              sx={{ ...linkButtonSx, mt: 1.5 }}
            >
              Retry
            </Button>
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: recommendedColumns,
                gap: { xs: 1.25, md: 2 },
              }}
            >
              {productsLoading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))
                : filteredProducts
                    .slice(0, visibleCount)
                    .map((product) => renderProductCard(product))}
            </Box>

            {!productsLoading && filteredProducts.length === 0 && (
              <Typography sx={{ color: c.muted, py: 4, textAlign: "center" }}>
                No products are available right now.
              </Typography>
            )}

            {!productsLoading && filteredProducts.length > visibleCount && (
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 5,
                    px: 4,
                    color: c.ink,
                    bgcolor: c.surface,
                    borderColor: c.border,
                    "&:hover": { borderColor: c.ink, bgcolor: c.surface },
                  }}
                >
                  Show more products
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          action={
            toast.cartLink ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  closeToast();
                  navigate(ROUTES.cart);
                }}
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                View cart
              </Button>
            ) : undefined
          }
          sx={{ alignItems: "center", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
