import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { Alert, Button, CircularProgress } from "@mui/material";

import { getProduct } from "../services/productApi";

import { getProductImageUrl } from "../services/imageUtils";

function ProductDetails() {
  const { productId } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  // ============================================================
  // LOAD PRODUCT
  // ============================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await getProduct(productId);

        const productData = response.data;

        setProduct(productData);

        if (productData.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        }
      } catch (err) {
        console.error("Unable to load product:", err);

        setError(
          err?.response?.data?.message || "Unable to load product details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <CircularProgress
            size={28}
            sx={{
              color: "#2D3A3A",
            }}
          />

          <p className="mt-4 text-sm text-[#8A8378]">Loading product...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <Alert
          severity="error"
          sx={{
            borderRadius: 0,
            border: "1px solid #D4B5AF",
            backgroundColor: "#F7EDEA",
            color: "#5A302A",
          }}
        >
          {error}
        </Alert>

        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#6F766F] hover:text-[#233636]"
        >
          <ArrowBackOutlinedIcon fontSize="small" />
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images || [];

  const isInStock = Number(product.stock) > 0;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* ==================================================
          BACK
      ================================================== */}

      <button
        type="button"
        onClick={() => navigate("/admin/products")}
        className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#6F766F] transition hover:text-[#233636]"
      >
        <ArrowBackOutlinedIcon fontSize="small" />
        Back to Products
      </button>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Catalogue / Product
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">{product.name}</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
            {product.description}
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
          sx={{
            borderRadius: 0,
            backgroundColor: "#2D3A3A",
            color: "#FFFCF4",
            textTransform: "none",
            padding: "10px 20px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#233636",
              boxShadow: "none",
            },
          }}
        >
          Edit Product
        </Button>
      </div>

      {/* ==================================================
          PRODUCT OVERVIEW
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ==================================================
            IMAGE
        ================================================== */}

        <section className="border border-[#DED7C9] bg-[#F7F1E5] lg:col-span-2">
          <div className="border-b border-[#DED7C9] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Product Gallery
            </p>

            <h2 className="mt-2 font-serif text-xl text-[#233636]">
              Product Images
            </h2>
          </div>

          <div className="p-6">
            {/* MAIN IMAGE */}

            <div className="flex h-[420px] items-center justify-center border border-[#DED7C9] bg-[#FFFCF4]">
              {selectedImage ? (
                <img
                  src={getProductImageUrl(selectedImage.imageUrl)}
                  alt={product.name}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <div className="text-center">
                  <ImageOutlinedIcon
                    sx={{
                      fontSize: 48,
                      color: "#A9A195",
                    }}
                  />

                  <p className="mt-3 font-serif text-lg text-[#233636]">
                    No product image
                  </p>

                  <p className="mt-2 text-sm text-[#8A8378]">
                    Add images from Edit Product.
                  </p>
                </div>
              )}
            </div>

            {/* THUMBNAILS */}

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden border bg-[#FFFCF4] ${
                      selectedImage?.id === image.id
                        ? "border-[#2D3A3A]"
                        : "border-[#DED7C9]"
                    }`}
                  >
                    <img
                      src={getProductImageUrl(image.imageUrl)}
                      alt=""
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            PRODUCT INFORMATION
        ================================================== */}

        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="border-b border-[#DED7C9] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Catalogue
            </p>

            <h2 className="mt-2 font-serif text-xl text-[#233636]">
              Product Information
            </h2>
          </div>

          <div className="divide-y divide-[#DED7C9]">
            {/* PRICE */}

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                Selling Price
              </p>

              <p className="mt-2 font-serif text-2xl text-[#233636]">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
            </div>

            {/* MRP */}

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                MRP
              </p>

              <p className="mt-2 text-sm text-[#4F5955]">
                ₹{Number(product.mrp).toLocaleString("en-IN")}
              </p>
            </div>

            {/* STOCK */}

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                Stock
              </p>

              <div className="mt-2 flex items-center gap-3">
                <p className="font-serif text-xl text-[#233636]">
                  {product.stock}
                </p>

                <span
                  className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    isInStock
                      ? "border-[#C7D6C7] bg-[#EEF5EE] text-[#49664D]"
                      : "border-[#D4B5AF] bg-[#F7EDEA] text-[#7A4A42]"
                  }`}
                >
                  {isInStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* CATEGORY */}

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                Category
              </p>

              <p className="mt-2 text-sm text-[#4F5955]">
                {product.categoryName || `Category ${product.categoryId}`}
              </p>
            </div>

            {/* PRODUCT ID */}

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                Product ID
              </p>

              <p className="mt-2 text-sm text-[#4F5955]">#{product.id}</p>
            </div>

            {/* IMAGE COUNT */}

            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <Inventory2OutlinedIcon
                  sx={{
                    color: "#8A8378",
                  }}
                />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                    Images
                  </p>

                  <p className="mt-1 text-sm text-[#4F5955]">
                    {images.length} {images.length === 1 ? "image" : "images"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================
          DESCRIPTION
      ================================================== */}

      <section className="mt-6 border border-[#DED7C9] bg-[#F7F1E5]">
        <div className="border-b border-[#DED7C9] px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
            Product Information
          </p>

          <h2 className="mt-2 font-serif text-xl text-[#233636]">
            Description
          </h2>
        </div>

        <div className="px-6 py-6">
          <p className="max-w-4xl text-sm leading-7 text-[#4F5955]">
            {product.description || "No description available."}
          </p>
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
