import { Box, Button, IconButton, Typography, Divider } from "@mui/material";

import {
  FavoriteBorder,
  ShoppingCartOutlined,
  Remove,
  Add,
  ArrowBack,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProductById } from "../api/productApi";

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId);

        const productData = response.data;

        setProduct(productData);

        // Select first image by default
        if (productData.images?.length > 0) {
          setSelectedImage(productData.images[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <Box className="flex min-h-[70vh] items-center justify-center">
        <Typography sx={{ color: "#8A8378" }}>Loading product...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Typography sx={{ color: "#2D3A3A" }}>Product not found</Typography>

        <Button
          onClick={() => navigate(-1)}
          className="!normal-case"
          sx={{
            backgroundColor: "#E9B44C",
            color: "#2D3A3A",
          }}
        >
          Go Back
        </Button>
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
        {/* LEFT - Images */}

        <Box>
          {/* Main Image */}

          <Box
            className="flex items-center justify-center rounded-2xl"
            sx={{
              backgroundColor: "#F3EFE7",
              height: 500,
              overflow: "hidden",
            }}
          >
            {selectedImage ? (
              <Box
                component="img"
                src={`http://localhost:8082${selectedImage.imageUrl}`}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: 4,
                }}
              />
            ) : (
              <Typography sx={{ color: "#8A8378" }}>
                No image available
              </Typography>
            )}
          </Box>

          {/* Image Thumbnails */}

          {product.images?.length > 0 && (
            <Box className="mt-4 flex gap-3 overflow-x-auto">
              {product.images
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((image) => (
                  <Box
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    sx={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundColor: "#F3EFE7",
                      border:
                        selectedImage?.id === image.id
                          ? "2px solid #E9B44C"
                          : "1px solid #DDD6CA",
                      transition: "border .2s",
                    }}
                  >
                    <Box
                      component="img"
                      src={`http://localhost:8082${image.imageUrl}`}
                      alt={`${product.name} ${image.displayOrder}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        p: 0.5,
                      }}
                    />
                  </Box>
                ))}
            </Box>
          )}
        </Box>

        {/* RIGHT - Product Information */}

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

          {/* Stock */}

          <Typography
            className="!mb-4 !text-sm !font-semibold"
            sx={{
              color: product.stock > 0 ? "#2E7D32" : "#C62828",
            }}
          >
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
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
              disabled={product.stock <= 0}
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
