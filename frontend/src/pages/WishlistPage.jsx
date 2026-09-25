import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import { useNavigate } from "react-router-dom";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { removeFromWishlist } from "../api/wishlistApi";

import { addToCart } from "../api/cartApi";

const API_BASE_URL = "http://localhost:8082";

const WishlistPage = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { wishlist, wishlistItemCount, fetchWishlist } = useWishlist();

  const { fetchCart } = useCart();

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      await removeFromWishlist(itemId, token, user.id);

      await fetchWishlist();
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);

      console.error("Backend response:", error.response?.data);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await addToCart(
        {
          productId,
          quantity: 1,
        },
        token,
        user.id,
      );

      await fetchCart();

      console.log("Product added to cart:", productId);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  // -----------------------------
  // EMPTY WISHLIST
  // -----------------------------

  if (wishlistItemCount === 0) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              backgroundColor: "#FBF5E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FavoriteBorderIcon
              sx={{
                fontSize: 52,
                color: "#E9A719",
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#294541",
            }}
          >
            Your wishlist is empty
          </Typography>

          <Typography
            sx={{
              color: "#7A817D",
              maxWidth: 500,
              lineHeight: 1.7,
            }}
          >
            Save the products you love and come back to them anytime.
            <br />
            Start exploring and add something to your wishlist.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
            sx={{
              mt: 1,
              px: 4,
              py: 1.2,
              backgroundColor: "#E9A719",
              color: "#173A36",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#D99712",
              },
            }}
          >
            Explore Products
          </Button>
        </Stack>
      </Box>
    );
  }

  // -----------------------------
  // WISHLIST WITH PRODUCTS
  // -----------------------------

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
        py: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 1250,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: "1.7rem",
                  md: "2rem",
                },
                fontWeight: 800,
                color: "#183F38",
              }}
            >
              My Wishlist
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#7A817D",
                fontSize: 14,
              }}
            >
              {wishlistItemCount} saved{" "}
              {wishlistItemCount === 1 ? "item" : "items"}
            </Typography>
          </Box>

          <FavoriteIcon
            sx={{
              color: "#E9A719",
              fontSize: 30,
            }}
          />
        </Stack>

        {/* Products */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {wishlist.items.map((item) => {
            const product = item.product;

            if (!product) {
              return null;
            }

            const imageUrl =
              product.images?.length > 0
                ? `${API_BASE_URL}${product.images[0].imageUrl}`
                : null;

            const discount =
              product.mrp > product.price
                ? Math.round(
                    ((product.mrp - product.price) / product.mrp) * 100,
                  )
                : 0;

            return (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  border: "1px solid #E5DED1",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 24px rgba(30,50,45,0.08)",
                  },
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    position: "relative",
                    height: 220,
                    backgroundColor: "#FAFAFA",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
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
                        p: 2,
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
                      <ShoppingCartOutlinedIcon
                        sx={{
                          fontSize: 50,
                          color: "#B8B1A6",
                        }}
                      />
                    </Box>
                  )}

                  {/* Remove */}
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();

                      handleRemoveFromWishlist(item.id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 34,
                      height: 34,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      color: "#C84B55",
                      border: "1px solid #E8DED8",
                      "&:hover": {
                        backgroundColor: "#FFF1F2",
                      },
                    }}
                  >
                    <FavoriteIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  </IconButton>
                </Box>

                {/* Details */}
                <Box sx={{ p: 2 }}>
                  <Typography
                    onClick={() => navigate(`/products/${product.id}`)}
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#183F38",
                      cursor: "pointer",
                      mb: 0.5,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#7A817D",
                      fontSize: 12,
                      mb: 1,
                    }}
                  >
                    {product.parentCategoryName
                      ? `${product.parentCategoryName} › `
                      : ""}
                    {product.categoryName}
                  </Typography>

                  <Typography
                    sx={{
                      color: product.stock > 0 ? "#198754" : "#C62828",
                      fontSize: 12,
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Typography>

                  {/* Price */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "#233636",
                      }}
                    >
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </Typography>

                    {product.mrp > product.price && (
                      <>
                        <Typography
                          sx={{
                            textDecoration: "line-through",
                            color: "#8A8378",
                            fontSize: 12,
                          }}
                        >
                          ₹{Number(product.mrp).toLocaleString("en-IN")}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#198754",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {discount}% off
                        </Typography>
                      </>
                    )}
                  </Stack>

                  {/* Add to Cart */}
                  <Button
                    fullWidth
                    disabled={product.stock <= 0}
                    startIcon={<ShoppingCartOutlinedIcon />}
                    onClick={(event) => {
                      event.stopPropagation();

                      handleAddToCart(product.id);
                    }}
                    sx={{
                      backgroundColor: "#E9B44C",
                      color: "#173A36",
                      fontWeight: 700,
                      textTransform: "none",
                      py: 1,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "#DFA83D",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#E5E1D8",
                      },
                    }}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default WishlistPage;
