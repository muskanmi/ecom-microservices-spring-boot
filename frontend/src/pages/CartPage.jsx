import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { DeleteOutlined } from "@mui/icons-material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { removeCartItem, updateCartItem } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8082";

const CartPage = () => {
  const { cart, cartItemCount, fetchCart } = useCart();

  const navigate = useNavigate();

  const { user } = useAuth();

  const subtotal = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const totalMrp = cart.items.reduce(
    (total, item) => total + item.product.mrp * item.quantity,
    0,
  );

  const savings = totalMrp - subtotal;

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    if (newQuantity < item.product.stock) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await updateCartItem(item.id, newQuantity, token, user.id);

      await fetchCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      console.log(itemId, "itemId");

      const token = localStorage.getItem("token");

      await removeCartItem(itemId, token, user.id);

      await fetchCart();
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  if (cartItemCount === 0) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <ShoppingCartOutlinedIcon
            sx={{
              fontSize: 72,
              color: "#8A8378",
            }}
          />

          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            Your cart is empty
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
            sx={{
              bgcolor: "#123C36",
              "&:hover": {
                bgcolor: "#0B2A26",
              },
            }}
          >
            Continue Shopping
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#F8F4EA",
        minHeight: "100vh",
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Typography
        sx={{
          fontSize: {
            xs: "1.6rem",
            md: "2rem",
          },
          fontWeight: 700,
          color: "#183F38",
          mb: 1,
        }}
      >
        My Cart
      </Typography>

      <Typography
        sx={{
          color: "#777",
          mb: 3,
        }}
      >
        {cartItemCount} item
        {cartItemCount !== 1 ? "s" : ""}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) 360px",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Cart items */}
        <Stack spacing={2}>
          {cart.items.map((item) => {
            const product = item.product;

            const image =
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
                  p: 2.5,
                  border: "1px solid #E4DED1",
                  borderRadius: 2,
                  bgcolor: "#FFFFFF",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "100px 1fr",
                      sm: "140px 1fr",
                    },
                    gap: 2.5,
                  }}
                >
                  {/* Product image */}
                  <Box
                    sx={{
                      width: {
                        xs: 100,
                        sm: 140,
                      },
                      height: {
                        xs: 100,
                        sm: 140,
                      },
                      bgcolor: "#FAFAFA",
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    {image ? (
                      <Box
                        component="img"
                        src={image}
                        alt={product.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <ShoppingCartOutlinedIcon
                        sx={{
                          fontSize: 40,
                          color: "#AAA",
                        }}
                      />
                    )}
                  </Box>

                  {/* Product details */}
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "#183F38",
                        mb: 0.7,
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#777",
                        fontSize: "0.85rem",
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
                        color: "#198754",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        mb: 1.2,
                      }}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Typography
                        sx={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                        }}
                      >
                        ₹{product.price.toLocaleString()}
                      </Typography>

                      {product.mrp > product.price && (
                        <>
                          <Typography
                            sx={{
                              textDecoration: "line-through",
                              color: "#888",
                              fontSize: "0.9rem",
                            }}
                          >
                            ₹{product.mrp.toLocaleString()}
                          </Typography>

                          <Typography
                            sx={{
                              color: "#138808",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                            }}
                          >
                            {discount}% off
                          </Typography>
                        </>
                      )}
                    </Stack>

                    <Divider
                      sx={{
                        my: 1.5,
                      }}
                    />

                    {/* Quantity / actions */}
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          border: "1px solid #D8D1C4",
                          borderRadius: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>

                        <Typography
                          sx={{
                            minWidth: 35,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Button
                        size="small"
                        startIcon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.id)}
                        sx={{
                          color: "#555",
                          textTransform: "none",
                        }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>

        {/* Order summary */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid #E4DED1",
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            position: {
              lg: "sticky",
            },
            top: {
              lg: 90,
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.2rem",
              mb: 2,
            }}
          >
            Order Summary
          </Typography>

          <Stack spacing={1.5}>
            <Stack
              direction="row"
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>MRP</Typography>

              <Typography>₹{totalMrp.toLocaleString()}</Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>Discount</Typography>

              <Typography
                sx={{
                  color: "#198754",
                }}
              >
                -₹{savings.toLocaleString()}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>Delivery</Typography>

              <Typography
                sx={{
                  color: "#198754",
                  fontWeight: 600,
                }}
              >
                FREE
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                Total
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                ₹{subtotal.toLocaleString()}
              </Typography>
            </Stack>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              bgcolor: "#D5A129",
              color: "#FFFFFF",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "#B8891F",
              },
            }}
          >
            Proceed to Checkout
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default CartPage;
