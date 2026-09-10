import {
  Box,
  Button,
  IconButton,
  Typography,
  Divider,
  Rating,
  Stack,
} from "@mui/material";

import {
  FavoriteBorder,
  Favorite,
  ShoppingCartOutlined,
  Remove,
  Add,
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  LocalShippingOutlined,
  AutorenewOutlined,
  VerifiedOutlined,
  CreditCardOutlined,
  LocalOfferOutlined,
  FullscreenOutlined,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProductById } from "../api/productApi";

const API_URL = "http://localhost:8082";

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);

  // --------------------------------------------------
  // Fetch product
  // --------------------------------------------------

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await getProductById(productId);

        setProduct(response.data);
        setSelectedImageIndex(0);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // --------------------------------------------------
  // Sort images by display order
  // --------------------------------------------------

  const images = useMemo(() => {
    if (!product?.images?.length) {
      return [];
    }

    return [...product.images].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
  }, [product]);

  const selectedImage = images[selectedImageIndex];

  const imageUrl = selectedImage ? `${API_URL}${selectedImage.imageUrl}` : null;

  // --------------------------------------------------
  // Discount
  // --------------------------------------------------

  const discountPercentage =
    product?.mrp && product?.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  // --------------------------------------------------
  // Category name
  // --------------------------------------------------

  const categoryName =
    typeof product?.category === "object"
      ? product?.category?.name
      : product?.category;

  // --------------------------------------------------
  // Quantity
  // --------------------------------------------------

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(product?.stock || 1, previous + 1));
  };

  // --------------------------------------------------
  // Image navigation
  // --------------------------------------------------

  const previousImage = () => {
    if (images.length === 0) return;

    setSelectedImageIndex((previous) =>
      previous === 0 ? images.length - 1 : previous - 1,
    );
  };

  const nextImage = () => {
    if (images.length === 0) return;

    setSelectedImageIndex((previous) =>
      previous === images.length - 1 ? 0 : previous + 1,
    );
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <Box className="flex min-h-[70vh] items-center justify-center">
        <Typography
          sx={{
            color: "#8A8378",
            fontSize: 14,
          }}
        >
          Loading product...
        </Typography>
      </Box>
    );
  }

  // --------------------------------------------------
  // Product not found
  // --------------------------------------------------

  if (!product) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Typography
          sx={{
            color: "#2D3A3A",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Product not found
        </Typography>

        <Button
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: "#E9B44C",
            color: "#2D3A3A",
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            "&:hover": {
              backgroundColor: "#E9B44C",
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#FFFCF4",
        minHeight: "100%",
        px: {
          xs: 2,
          md: 3,
          lg: 4,
        },
        py: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 1250,
          mx: "auto",
        }}
      >
        {/* =========================================================
            BREADCRUMB
        ========================================================= */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            mb: 2.5,
            color: "#6F766F",
            fontSize: 12,
          }}
        >
          <Typography
            onClick={() => navigate("/dashboard")}
            sx={{
              cursor: "pointer",
              color: "#344B4B",
              fontSize: 12,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Home
          </Typography>

          <ChevronRight sx={{ fontSize: 15 }} />

          <Typography sx={{ fontSize: 12 }}>
            {categoryName || "Products"}
          </Typography>

          <ChevronRight sx={{ fontSize: 15 }} />

          <Typography
            sx={{
              fontSize: 12,
              color: "#2D3A3A",
              fontWeight: 700,
            }}
          >
            {product.name}
          </Typography>
        </Stack>

        {/* =========================================================
            MAIN PRODUCT SECTION
        ========================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.55fr) minmax(380px, 1fr)",
            },
            gap: {
              xs: 4,
              lg: 3,
            },
            alignItems: "start",
          }}
        >
          {/* =======================================================
              LEFT - PRODUCT IMAGES
          ======================================================= */}

          <Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "70px minmax(0,1fr)",
                  sm: "82px minmax(0,1fr)",
                },
                gap: 1.5,
              }}
            >
              {/* -----------------------------
                  THUMBNAILS
              ----------------------------- */}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.2,
                }}
              >
                {images.map((image, index) => {
                  const thumbnailUrl = `${API_URL}${image.imageUrl}`;

                  return (
                    <Box
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        width: {
                          xs: 68,
                          sm: 78,
                        },
                        height: {
                          xs: 68,
                          sm: 78,
                        },
                        borderRadius: 1.5,
                        overflow: "hidden",
                        cursor: "pointer",
                        backgroundColor: "#F3EFE7",
                        border:
                          selectedImageIndex === index
                            ? "2px solid #E9B44C"
                            : "1px solid #DDD6CA",
                        transition: "all .2s ease",
                        "&:hover": {
                          borderColor: "#E9B44C",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={thumbnailUrl}
                        alt={`${product.name} ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          p: 0.5,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>

              {/* -----------------------------
                  MAIN IMAGE
              ----------------------------- */}

              <Box
                sx={{
                  position: "relative",
                  height: {
                    xs: 380,
                    sm: 450,
                    md: 500,
                  },
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#F3EFE7",
                  border: "1px solid #E8E1D5",
                }}
              >
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      p: {
                        xs: 2,
                        sm: 3,
                        md: 4,
                      },
                    }}
                  />
                ) : (
                  <Box className="flex h-full items-center justify-center">
                    <Typography
                      sx={{
                        color: "#8A8378",
                        fontSize: 14,
                      }}
                    >
                      No image available
                    </Typography>
                  </Box>
                )}

                {/* Discount badge */}

                {discountPercentage > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      backgroundColor: "#F20D5A",
                      color: "#FFFFFF",
                      px: 1.5,
                      py: 0.8,
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {discountPercentage}% OFF
                  </Box>
                )}

                {/* Previous */}

                {images.length > 1 && (
                  <IconButton
                    onClick={previousImage}
                    sx={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 38,
                      height: 38,
                      backgroundColor: "rgba(255,255,255,.95)",
                      border: "1px solid #E1DACD",
                      boxShadow: "0 3px 10px rgba(0,0,0,.08)",
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                      },
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                )}

                {/* Next */}

                {images.length > 1 && (
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 38,
                      height: 38,
                      backgroundColor: "rgba(255,255,255,.95)",
                      border: "1px solid #E1DACD",
                      boxShadow: "0 3px 10px rgba(0,0,0,.08)",
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                      },
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                )}

                {/* Fullscreen */}

                <IconButton
                  sx={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,.95)",
                    border: "1px solid #E1DACD",
                    "&:hover": {
                      backgroundColor: "#FFFFFF",
                    },
                  }}
                >
                  <FullscreenOutlined sx={{ fontSize: 19 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* =======================================================
              RIGHT - PRODUCT INFORMATION
          ======================================================= */}

          <Box>
            {/* Brand */}

            <Typography
              sx={{
                color: "#6F766F",
                fontSize: 12,
                fontWeight: 600,
                mb: 0.8,
              }}
            >
              {categoryName || "Marketplace"}
            </Typography>

            {/* Product Name */}

            <Typography
              sx={{
                color: "#162A32",
                fontSize: {
                  xs: 28,
                  md: 32,
                },
                lineHeight: 1.15,
                fontWeight: 800,
                mb: 1.2,
              }}
            >
              {product.name}
            </Typography>

            {/* Rating */}

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.8}
              sx={{ mb: 2.2 }}
            >
              <Rating
                value={product.rating || 0}
                precision={0.1}
                readOnly
                size="small"
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#E9A719",
                  },
                }}
              />

              <Typography
                sx={{
                  color: "#344B4B",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {product.rating || "0.0"}
              </Typography>

              <Typography
                sx={{
                  color: "#7C807B",
                  fontSize: 12,
                }}
              >
                ({product.reviews || 0} reviews)
              </Typography>
            </Stack>

            {/* Short description */}

            <Typography
              sx={{
                color: "#6F766F",
                fontSize: 13,
                lineHeight: 1.7,
                mb: 2.5,
              }}
            >
              {product.description}
            </Typography>

            {/* Price */}

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.2}
              sx={{
                mb: 0.8,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  color: "#1D3737",
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                ₹{Number(product.price).toLocaleString("en-IN")}
              </Typography>

              <Typography
                sx={{
                  color: "#8A8378",
                  fontSize: 25,
                  textDecoration: "line-through",
                }}
              >
                ₹{Number(product.mrp).toLocaleString("en-IN")}
              </Typography>

              {discountPercentage > 0 && (
                <Typography
                  sx={{
                    backgroundColor: "#DDF1E2",
                    color: "#258144",
                    borderRadius: 1,
                    alignItems: "center",
                    display: "flex",
                    px: 1,
                    py: 0.5,
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  {discountPercentage}% OFF
                </Typography>
              )}
            </Stack>

            <Typography
              sx={{
                color: "#777B75",
                fontSize: 11,
                mb: 2,
              }}
            >
              Inclusive of all taxes
            </Typography>

            {/* Savings */}

            {discountPercentage > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#EAF6EC",
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  mb: 2.5,
                }}
              >
                <LocalOfferOutlined
                  sx={{
                    fontSize: 18,
                    color: "#218344",
                  }}
                />

                <Typography
                  sx={{
                    color: "#218344",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Save ₹
                  {Number(product.mrp - product.price).toLocaleString("en-IN")}{" "}
                  on this item!
                </Typography>
              </Box>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Stock */}

            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  color: "#273A3A",
                  fontSize: 13,
                  fontWeight: 700,
                  mb: 0.8,
                }}
              >
                Availability
              </Typography>

              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: product.stock > 0 ? "#1DA45B" : "#C62828",
                  }}
                />

                <Typography
                  sx={{
                    color: product.stock > 0 ? "#218344" : "#C62828",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {product.stock > 0
                    ? `${product.stock} items available`
                    : "Out of stock"}
                </Typography>
              </Stack>
            </Box>

            {/* Quantity */}

            <Typography
              sx={{
                color: "#273A3A",
                fontSize: 13,
                fontWeight: 700,
                mb: 1,
              }}
            >
              Quantity
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2.5 }}
            >
              <IconButton
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                sx={{
                  width: 36,
                  height: 36,
                  border: "1px solid #DDD6CA",
                  borderRadius: 1.5,
                  color: "#2D3A3A",
                }}
              >
                <Remove sx={{ fontSize: 18 }} />
              </IconButton>

              <Typography
                sx={{
                  minWidth: 32,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {quantity}
              </Typography>

              <IconButton
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                sx={{
                  width: 36,
                  height: 36,
                  border: "1px solid #DDD6CA",
                  borderRadius: 1.5,
                  color: "#2D3A3A",
                }}
              >
                <Add sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            {/* Actions */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.2}
              sx={{ mb: 3 }}
            >
              <Button
                fullWidth
                startIcon={<ShoppingCartOutlined />}
                disabled={product.stock <= 0}
                sx={{
                  py: 1.35,
                  backgroundColor: "#E9B44C",
                  color: "#172C30",
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 1,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#DFA83D",
                    boxShadow: "none",
                  },
                }}
              >
                Add to Cart
              </Button>

              <Button
                fullWidth
                onClick={() => setWishlist((previous) => !previous)}
                startIcon={wishlist ? <Favorite /> : <FavoriteBorder />}
                sx={{
                  py: 1.35,
                  backgroundColor: wishlist ? "#FFF1F2" : "#FFFFFF",
                  color: wishlist ? "#C84B55" : "#263A3A",
                  border: "1px solid #DDD6CA",
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "#FFF8F5",
                  },
                }}
              >
                {wishlist ? "Added to Wishlist" : "Add to Wishlist"}
              </Button>
            </Stack>

            {/* Benefits */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                gap: 1.5,
                pt: 1,
              }}
            >
              <Benefit
                icon={<LocalShippingOutlined />}
                title="Free Delivery"
                subtitle="On orders above ₹499"
              />

              <Benefit
                icon={<AutorenewOutlined />}
                title="7 Days Return"
                subtitle="Easy returns"
              />

              <Benefit
                icon={<VerifiedOutlined />}
                title="1 Year Warranty"
                subtitle="Brand warranty"
              />

              <Benefit
                icon={<CreditCardOutlined />}
                title="Secure Payment"
                subtitle="100% secure"
              />
            </Box>
          </Box>
        </Box>

        {/* =========================================================
            PRODUCT INFORMATION TABS
        ========================================================= */}

        <Box
          sx={{
            mt: 5,
            borderTop: "1px solid #E5DED1",
            borderBottom: "1px solid #E5DED1",
          }}
        >
          <Stack
            direction="row"
            spacing={{
              xs: 2.5,
              md: 5,
            }}
            sx={{
              overflowX: "auto",
              py: 1.5,
            }}
          >
            {[
              "Description",
              "Specifications",
              `Reviews (${product.reviews || 0})`,
              "Questions",
              "Shipping & Returns",
            ].map((tab, index) => (
              <Typography
                key={tab}
                sx={{
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: index === 0 ? 800 : 600,
                  color: index === 0 ? "#183B3B" : "#5E655F",
                  pb: 0.8,
                  borderBottom:
                    index === 0 ? "2px solid #183B3B" : "2px solid transparent",
                }}
              >
                {tab}
              </Typography>
            ))}
          </Stack>
        </Box>

        {/* =========================================================
            DESCRIPTION
        ========================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.7fr 1fr",
            },
            gap: 4,
            py: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 800,
                color: "#233636",
                mb: 1.5,
              }}
            >
              Product Description
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                lineHeight: 1.8,
                color: "#68706B",
                whiteSpace: "pre-line",
              }}
            >
              {product.description}
            </Typography>

            <Box
              component="ul"
              sx={{
                pl: 2.5,
                mt: 2,
                color: "#68706B",
                fontSize: 13,
                lineHeight: 1.9,
              }}
            >
              <li>Premium quality product</li>
              <li>Designed for everyday use</li>
              <li>Carefully selected materials</li>
              <li>Easy returns within 7 days</li>
            </Box>
          </Box>

          {/* Secondary product image */}

          {images.length > 1 && (
            <Box
              sx={{
                height: 230,
                borderRadius: 1.5,
                overflow: "hidden",
                backgroundColor: "#F3EFE7",
              }}
            >
              <Box
                component="img"
                src={`${API_URL}${images[1].imageUrl}`}
                alt={`${product.name} detail`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: 2,
                }}
              />
            </Box>
          )}
        </Box>

        {/* =========================================================
            YOU MAY ALSO LIKE
        ========================================================= */}

        <Box
          sx={{
            backgroundColor: "#F7F1E5",
            border: "1px solid #E8DFD0",
            borderRadius: 2,
            p: {
              xs: 2,
              md: 2.5,
            },
            mb: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "#233636",
              }}
            >
              You May Also Like
            </Typography>

            <Button
              endIcon={<ChevronRight />}
              sx={{
                color: "#233636",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              View All
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2,minmax(0,1fr))",
                sm: "repeat(3,minmax(0,1fr))",
                md: "repeat(5,minmax(0,1fr))",
              },
              gap: 1.5,
            }}
          >
            {/* We intentionally keep this section ready for your
                GET /api/products integration. */}
            <Typography
              sx={{
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "#8A8378",
                fontSize: 12,
                py: 2,
              }}
            >
              More products will appear here.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ================================================================
// BENEFIT COMPONENT
// ================================================================

const Benefit = ({ icon, title, subtitle }) => {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box
        sx={{
          color: "#243D3D",
          display: "flex",
          pt: 0.2,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            color: "#273A3A",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "#858980",
            fontSize: 9.5,
            mt: 0.2,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
};

export default ProductDetailsPage;
