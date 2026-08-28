import { Box, Button, IconButton, Typography, Divider } from "@mui/material";

import {
  FavoriteBorder,
  ShoppingCartOutlined,
  Remove,
  Add,
  ArrowBack,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  // Temporary product data
  // Later this will come from your backend API
  const products = [
    {
      id: 1,
      name: "Pink Summer Dress",
      price: 1499,
      mrp: 2499,
      image: "/assets/products/pink-dress.png",
      category: "Fashion",
      description:
        "A stylish and comfortable summer dress designed for everyday wear and special occasions.",
    },
    {
      id: 2,
      name: "Wireless Headphones",
      price: 2999,
      mrp: 4999,
      image: "/assets/products/headphones.png",
      category: "Electronics",
      description:
        "Premium wireless headphones with comfortable design and immersive sound quality.",
    },
  ];

  const product = products.find((item) => item.id === Number(productId));

  if (!product) {
    return (
      <Box className="flex min-h-[70vh] items-center justify-center">
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  return (
    <Box className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Back Button */}

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        className="!mb-8 !normal-case"
        sx={{
          color: "#2D3A3A",
          fontWeight: 600,
        }}
      >
        Back
      </Button>

      {/* Main Product Section */}

      <Box className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left - Product Image */}

        <Box
          className="flex items-center justify-center rounded-2xl p-8"
          sx={{
            backgroundColor: "#F3EFE7",
            minHeight: 500,
          }}
        >
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            className="max-h-[430px] max-w-full object-contain"
          />
        </Box>

        {/* Right - Product Information */}

        <Box className="flex flex-col justify-center">
          <Typography
            className="!mb-3 !text-xs !font-bold !uppercase !tracking-widest"
            sx={{ color: "#8A8378" }}
          >
            {product.category}
          </Typography>

          <Typography
            className="!mb-4 !text-3xl !font-bold md:!text-4xl"
            sx={{ color: "#2D3A3A" }}
          >
            {product.name}
          </Typography>

          {/* Rating */}

          <Typography className="!mb-5 !text-sm" sx={{ color: "#8A8378" }}>
            ★★★★★ (24 reviews)
          </Typography>

          {/* Price */}

          <Box className="mb-6 flex items-center gap-3">
            <Typography
              className="!text-3xl !font-bold"
              sx={{ color: "#2D3A3A" }}
            >
              ₹{product.price}
            </Typography>

            <Typography
              className="!text-base line-through"
              sx={{ color: "#8A8378" }}
            >
              ₹{product.mrp}
            </Typography>

            <Typography
              className="!rounded-md !px-2 !py-1 !text-xs !font-bold"
              sx={{
                backgroundColor: "#E6F4EA",
                color: "#2E7D32",
              }}
            >
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
              OFF
            </Typography>
          </Box>

          <Divider className="!mb-6" />

          {/* Description */}

          <Typography
            className="!mb-2 !text-sm !font-bold"
            sx={{ color: "#2D3A3A" }}
          >
            Description
          </Typography>

          <Typography
            className="!mb-8 !text-sm !leading-7"
            sx={{ color: "#8A8378" }}
          >
            {product.description}
          </Typography>

          {/* Quantity */}

          <Typography
            className="!mb-3 !text-sm !font-bold"
            sx={{ color: "#2D3A3A" }}
          >
            Quantity
          </Typography>

          <Box className="mb-8 flex items-center gap-3">
            <IconButton
              sx={{
                border: "1px solid #DDD6CA",
              }}
            >
              <Remove />
            </IconButton>

            <Typography className="min-w-8 text-center font-bold">1</Typography>

            <IconButton
              sx={{
                border: "1px solid #DDD6CA",
              }}
            >
              <Add />
            </IconButton>
          </Box>

          {/* Actions */}

          <Box className="flex flex-col gap-3 sm:flex-row">
            <Button
              startIcon={<ShoppingCartOutlined />}
              variant="contained"
              className="!flex-1 !py-3 !normal-case"
              sx={{
                backgroundColor: "#E9B44C",
                color: "#2D3A3A",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#E9B44C",
                  opacity: 0.9,
                  boxShadow: "none",
                },
              }}
            >
              Add to Cart
            </Button>

            <Button
              startIcon={<FavoriteBorder />}
              variant="outlined"
              className="!flex-1 !py-3 !normal-case"
              sx={{
                borderColor: "#DDD6CA",
                color: "#2D3A3A",
                fontWeight: 700,
              }}
            >
              Add to Wishlist
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetailsPage;
