import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import LocalFireDepartmentOutlined from "@mui/icons-material/LocalFireDepartmentOutlined";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/productApi";

const API_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const DealsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts();
        console.log(response, "response");

        const allProducts = Array.isArray(response.data) ? response.data : [];

        const discountedProducts = allProducts.filter((product) => {
          const price = Number(product.price);
          const mrp = Number(product.mrp);

          return (
            product.active !== false &&
            Number.isFinite(price) &&
            Number.isFinite(mrp) &&
            mrp > price &&
            price > 0
          );
        });

        if (active) {
          setProducts(discountedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch today's deals:", err);

        if (active) {
          setError("Unable to load today's deals. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDeals();

    return () => {
      active = false;
    };
  }, []);

  const getDiscount = (mrp, price) => {
    const originalPrice = Number(mrp);
    const sellingPrice = Number(price);

    if (!originalPrice || originalPrice <= sellingPrice) {
      return 0;
    }

    return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  };

  // Product images are objects containing imageUrl, not plain strings.
  const getProductImage = (product) => {
    const imageUrl = product.images?.[0]?.imageUrl;

    if (typeof imageUrl !== "string" || !imageUrl.trim()) {
      return "";
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        minHeight: "70vh",
      }}
    >
      {/* Page heading */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalFireDepartmentOutlined
            sx={{ fontSize: 34, color: "#e9a923" }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#173f3b",
              fontFamily: "Georgia, serif",
              fontSize: { xs: 30, md: 40 },
            }}
          >
            Today's Deals
          </Typography>
        </Box>

        <Typography
          sx={{
            color: "#81796d",
            mt: 1,
            fontSize: 16,
          }}
        >
          Discover exciting offers and save more on your favourite products.
        </Typography>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "#17443f" }} />

          <Typography sx={{ color: "#81796d" }}>
            Finding the best deals for you...
          </Typography>
        </Box>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            px: 2,
            bgcolor: "#fffdf8",
            border: "1px solid #e8dfd0",
            borderRadius: 3,
          }}
        >
          <LocalFireDepartmentOutlined
            sx={{ fontSize: 60, color: "#e9a923" }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#263a37",
              mt: 2,
            }}
          >
            No deals available right now
          </Typography>

          <Typography sx={{ color: "#81796d", mt: 1 }}>
            Check back soon for exciting offers on your favourite products.
          </Typography>
        </Box>
      )}

      {/* Deals product list */}
      {!loading && !error && products.length > 0 && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: "#17443f",
                fontSize: 16,
              }}
            >
              {products.length} {products.length === 1 ? "deal" : "deals"}{" "}
              available
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {products.map((product) => {
              const imageUrl = getProductImage(product);
              const discount = getDiscount(product.mrp, product.price);

              return (
                <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id}>
                  <Card
                    onClick={() => handleProductClick(product.id)}
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      border: "1px solid #e8dfd0",
                      borderRadius: 3,
                      boxShadow: "none",
                      position: "relative",
                      overflow: "hidden",
                      bgcolor: "#fff",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(23,63,59,0.12)",
                        transform: "translateY(-3px)",
                      },
                    }}
                  >
                    {/* Product image */}
                    <Box
                      sx={{
                        position: "relative",
                        bgcolor: "#faf8f2",
                        minHeight: 210,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imageUrl ? (
                        <CardMedia
                          component="img"
                          image={imageUrl}
                          alt={product.name || "Product"}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          sx={{
                            height: 210,
                            width: "100%",
                            objectFit: "contain",
                            p: 2,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 210,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ShoppingBagOutlined
                            sx={{ fontSize: 55, color: "#b7b0a4" }}
                          />
                        </Box>
                      )}

                      {/* Discount badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          bgcolor: "#d33e45",
                          color: "#fff",
                          px: 1.2,
                          py: 0.5,
                          borderRadius: 5,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {discount}% OFF
                      </Box>
                    </Box>

                    {/* Product details */}
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#263a37",
                          minHeight: 44,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.name || product.productName || "Product"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#173f3b",
                            fontSize: 16,
                          }}
                        >
                          ₹{formatPrice(product.price)}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#938b80",
                            textDecoration: "line-through",
                            fontSize: 13,
                          }}
                        >
                          ₹{formatPrice(product.mrp)}
                        </Typography>
                      </Box>

                      {product.categoryName && (
                        <Typography
                          sx={{
                            color: "#81796d",
                            fontSize: 12,
                            mt: 1,
                          }}
                        >
                          {product.categoryName}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DealsPage;
