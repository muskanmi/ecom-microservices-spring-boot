import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { Search, ShoppingBagOutlined, ArrowBack } from "@mui/icons-material";

import { getProducts } from "../api/productApi";

const API_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const COLORS = {
  teal: "#173F3D",
  deepTeal: "#0F2E2D",
  gold: "#E8AA2B",
  cream: "#F8F3E8",
  paper: "#FFFCF4",
  border: "#E5DED0",
  text: "#263735",
  muted: "#777368",
};

const getProductId = (product) => product?.id ?? product?.productId;

const getProductName = (product) =>
  product?.name || product?.title || "Unnamed product";

const getProductCategory = (product) => {
  if (typeof product?.category === "string") {
    return product.category;
  }

  return (
    product?.categoryName ||
    product?.category?.name ||
    product?.category?.categoryName ||
    product?.subcategory ||
    ""
  );
};

const getParentCategory = (product) =>
  product?.parentCategoryName ||
  product?.parentCategory?.name ||
  product?.parentCategory ||
  "";

const getProductImage = (product) => {
  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;

  const image =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.imageUrl ||
        firstImage?.url ||
        product?.imageUrl ||
        product?.image ||
        "";

  if (!image) return "";

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const formatPrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const getStock = (product) => Number(product?.stock ?? product?.quantity ?? 0);

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep the search input in sync with the URL.
  useEffect(() => {
    setSearchText(searchParams.get("q") || "");
  }, [searchParams]);

  // Fetch products whenever the selected category changes.
  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // IMPORTANT:
        // Send the selected category to the backend.
        // Example: GET /api/products?category=Electronics
        const response = await getProducts({
          category: selectedCategory || undefined,
        });

        const data = response.data;

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.products)
              ? data.products
              : Array.isArray(data?.data)
                ? data.data
                : [];

        if (active) {
          setProducts(productList);
        }
      } catch (err) {
        console.error("Failed to load products:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load products. Please try again.",
          );
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  // Build category chips from the products returned by the API.
  const categories = useMemo(() => {
    const values = products.flatMap((product) => [
      getParentCategory(product),
      getProductCategory(product),
    ]);

    return [...new Set(values.filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [products]);

  // Apply the text search locally.
  // Category filtering is already handled by the backend.
  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const description = String(product?.description || "").toLowerCase();
      const brand = String(product?.brand || "").toLowerCase();

      const productCategory = getProductCategory(product).toLowerCase();
      const parentCategory = getParentCategory(product).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        description.includes(query) ||
        brand.includes(query) ||
        productCategory.includes(query) ||
        parentCategory.includes(query);

      return matchesSearch;
    });
  }, [products, searchText]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSearchParams({});
  };

  const openProduct = (product) => {
    const id = getProductId(product);

    if (id == null) {
      console.error("Product ID is missing:", product);
      return;
    }

    navigate(`/products/${id}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "65vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          bgcolor: COLORS.cream,
        }}
      >
        <CircularProgress sx={{ color: COLORS.teal }} />

        <Typography color={COLORS.muted}>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "75vh",
        bgcolor: COLORS.cream,
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 1360, mx: "auto" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
          sx={{
            mb: 3,
            color: COLORS.teal,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Back to shopping
        </Button>

        {/* Page heading */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: COLORS.muted,
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Marketplace Collection
            </Typography>

            <Typography
              component="h1"
              sx={{
                mt: 0.5,
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: { xs: 30, md: 40 },
                color: COLORS.teal,
              }}
            >
              {selectedCategory || "All Products"}
            </Typography>

            <Typography sx={{ color: COLORS.muted, mt: 0.5 }}>
              Explore products from across the marketplace.
            </Typography>
          </Box>

          <Typography
            sx={{
              color: COLORS.teal,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {filteredProducts.length} products found
          </Typography>
        </Box>

        {/* Product search */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: COLORS.paper,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 2,
          }}
        >
          <TextField
            fullWidth
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search products, brands and descriptions..."
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: COLORS.muted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
                borderRadius: 1.5,
                "& fieldset": {
                  borderColor: COLORS.border,
                },
                "&:hover fieldset": {
                  borderColor: COLORS.teal,
                },
                "&.Mui-focused fieldset": {
                  borderColor: COLORS.teal,
                },
              },
            }}
          />
        </Paper>

        {/* Category filters */}
        {categories.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 3,
            }}
          >
            <Chip
              label="All"
              clickable
              onClick={() => handleCategoryChange("")}
              sx={{
                bgcolor: !selectedCategory ? COLORS.teal : COLORS.paper,
                color: !selectedCategory ? "#FFFFFF" : COLORS.text,
                border: `1px solid ${COLORS.border}`,
                fontWeight: 600,
              }}
            />

            {categories.map((category) => {
              const selected =
                selectedCategory.toLowerCase() === category.toLowerCase();

              return (
                <Chip
                  key={category}
                  label={category}
                  clickable
                  onClick={() => handleCategoryChange(category)}
                  sx={{
                    bgcolor: selected ? COLORS.teal : COLORS.paper,
                    color: selected ? "#FFFFFF" : COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* API error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Empty state */}
        {!error && filteredProducts.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              py: 8,
              textAlign: "center",
              bgcolor: COLORS.paper,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 2,
            }}
          >
            <ShoppingBagOutlined
              sx={{ fontSize: 48, color: COLORS.teal, mb: 1 }}
            />

            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.teal,
              }}
            >
              No products found
            </Typography>

            <Typography sx={{ color: COLORS.muted, mt: 1 }}>
              Try another search or choose a different category.
            </Typography>

            <Button
              onClick={handleClearFilters}
              sx={{
                mt: 2,
                color: COLORS.teal,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Clear filters
            </Button>
          </Paper>
        )}

        {/* Product cards */}
        <Grid container spacing={2.5}>
          {filteredProducts.map((product) => {
            const price = Number(product.price ?? product.sellingPrice ?? 0);

            const mrp = Number(product.mrp ?? product.originalPrice ?? price);

            const discount =
              mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

            const stock = getStock(product);
            const image = getProductImage(product);

            return (
              <Grid
                item
                key={getProductId(product)}
                xs={6}
                sm={4}
                md={3}
                lg={2.4}
              >
                <Card
                  onClick={() => openProduct(product)}
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    bgcolor: COLORS.paper,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 2.5,
                    overflow: "hidden",
                    boxShadow: "0 3px 12px rgba(23,63,61,.05)",
                    transition: "transform .2s ease, box-shadow .2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 24px rgba(23,63,61,.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      height: 210,
                      bgcolor: "#F3EFE7",
                      p: 1.5,
                    }}
                  >
                    {image ? (
                      <CardMedia
                        component="img"
                        image={image}
                        alt={getProductName(product)}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ShoppingBagOutlined
                          sx={{
                            fontSize: 48,
                            color: COLORS.muted,
                          }}
                        />
                      </Box>
                    )}

                    {discount > 0 && (
                      <Chip
                        label={`${discount}% OFF`}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          bgcolor: "#C83C45",
                          color: "#FFFFFF",
                          fontWeight: 800,
                        }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      sx={{
                        color: COLORS.muted,
                        fontSize: 12,
                        mb: 0.5,
                      }}
                    >
                      {getProductCategory(product)}
                    </Typography>

                    <Typography
                      sx={{
                        color: COLORS.text,
                        fontWeight: 700,
                        fontSize: 14,
                        minHeight: 42,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {getProductName(product)}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: COLORS.teal,
                          fontWeight: 800,
                          fontSize: 17,
                        }}
                      >
                        {formatPrice(price)}
                      </Typography>

                      {mrp > price && (
                        <Typography
                          sx={{
                            color: COLORS.muted,
                            textDecoration: "line-through",
                            fontSize: 12,
                          }}
                        >
                          {formatPrice(mrp)}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 12,
                        fontWeight: 700,
                        color: stock > 0 ? "#16834B" : "#C13A45",
                      }}
                    >
                      {stock > 0 ? "In stock" : "Out of stock"}
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={(event) => {
                        event.stopPropagation();
                        openProduct(product);
                      }}
                      sx={{
                        mt: 1.5,
                        bgcolor: COLORS.gold,
                        color: COLORS.deepTeal,
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "#D99A1C",
                          boxShadow: "none",
                        },
                      }}
                    >
                      View product
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductsPage;
