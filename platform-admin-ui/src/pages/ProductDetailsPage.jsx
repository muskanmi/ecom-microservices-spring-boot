import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Chip, CircularProgress, Divider } from "@mui/material";
import { ArrowBackOutlined, RefreshOutlined } from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getAllCatalogProducts, CATALOG_URL } from "../api/adminCatalogApi";
import { getAllSellers } from "../api/adminSellerApi";

function formatCurrency(value) {
  if (value == null || value === "") return "—";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getImageUrl(image) {
  const value =
    typeof image === "string"
      ? image
      : image?.imageUrl || image?.url || image?.path || "";

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${CATALOG_URL}/${value.replace(/^\/+/, "")}`;
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#77796F]">{label}</p>

      <p className="mt-1 break-words text-sm font-medium text-[#2D3A3A]">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [sellerProfileId, setSellerProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sellerError, setSellerError] = useState("");

  const loadProduct = useCallback(async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      sessionStorage.removeItem("adminUserId");
      sessionStorage.removeItem("adminRole");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    setSellerError("");
    setProduct(null);
    setSellerProfileId(null);

    try {
      const products = await getAllCatalogProducts(token);

      const found = products.find(
        (item) => String(item.id) === String(productId),
      );

      if (!found) {
        setError("Product not found.");
        return;
      }

      setProduct(found);

      // product.sellerId is the seller's userId.
      // The seller details route requires sellerProfileId.
      try {
        const sellers = await getAllSellers(token);

        const matchingSeller = sellers.find(
          (seller) => String(seller.userId) === String(found.sellerId),
        );

        if (matchingSeller) {
          setSellerProfileId(matchingSeller.sellerProfileId);
        } else {
          setSellerError(
            "The seller profile could not be matched to this product.",
          );
        }
      } catch (err) {
        if (err.message?.toLowerCase().includes("sign in again")) {
          sessionStorage.removeItem("adminToken");
          sessionStorage.removeItem("adminUserId");
          sessionStorage.removeItem("adminRole");
          navigate("/login", { replace: true });
          return;
        }

        setSellerError(err.message || "Unable to load the seller profile.");
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load product details.");
    } finally {
      setLoading(false);
    }
  }, [productId, navigate]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const images = Array.isArray(product?.images) ? product.images : [];

  const stock = Number(product?.stock ?? 0);

  return (
    <div>
      <Link
        to="/catalog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#8B7850] hover:text-[#233636]"
      >
        <ArrowBackOutlined fontSize="small" />
        Back to Catalog Oversight
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Product Details
          </h1>

          <p className="mt-3 text-sm text-[#77796F]">Product ID: {productId}</p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadProduct}
          disabled={loading}
          sx={{
            color: "#233636",
            borderColor: "#BEB7A6",
            borderRadius: "3px",
            textTransform: "none",
          }}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mt-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="mt-8 flex min-h-56 items-center justify-center gap-3 border border-[#E7E0D1] bg-white text-sm text-[#77796F]">
          <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
          Loading product details...
        </div>
      ) : product ? (
        <>
          <section className="mt-8 border border-[#E7E0D1] bg-white p-5 md:p-7">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((image, index) => {
                      const src = getImageUrl(image);

                      if (!src) return null;

                      return (
                        <img
                          key={`${src}-${index}`}
                          src={src}
                          alt={`${product.name || "Product"} ${index + 1}`}
                          className="aspect-square w-full border border-[#E7E0D1] bg-[#F7F3E9] object-contain p-3"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-64 items-center justify-center border border-[#E7E0D1] bg-[#F7F3E9] text-sm text-[#77796F]">
                    No product images available
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B7850]">
                  {product.categoryName || "Uncategorized"}
                </p>

                <h2 className="mt-3 font-editorial text-3xl md:text-4xl">
                  {product.name || "Unnamed product"}
                </h2>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#77796F]">
                  {product.description || "No description available."}
                </p>

                <Divider sx={{ my: 3, borderColor: "#E7E0D1" }} />

                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="font-editorial text-3xl">
                    {formatCurrency(product.price)}
                  </p>

                  {product.mrp != null && (
                    <p className="text-sm text-[#77796F]">
                      MRP: {formatCurrency(product.mrp)}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <Chip
                    label={
                      stock <= 0 ? "Out of stock" : `${stock} units in stock`
                    }
                    sx={{
                      backgroundColor: stock <= 0 ? "#FBE9E6" : "#E7F2E8",
                      color: stock <= 0 ? "#A33B32" : "#326B43",
                      borderRadius: "3px",
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 border border-[#E7E0D1] bg-white p-5 md:p-7">
            <h2 className="font-editorial text-2xl">Product information</h2>

            <Divider sx={{ my: 3, borderColor: "#E7E0D1" }} />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <Detail label="Product ID" value={product.id} />
              <Detail label="Product name" value={product.name} />
              <Detail label="Category" value={product.categoryName} />
              <Detail label="Category ID" value={product.categoryId} />
              <Detail
                label="Parent category"
                value={product.parentCategoryName}
              />
              <Detail label="Seller user ID" value={product.sellerId} />
              <Detail
                label="Selling price"
                value={formatCurrency(product.price)}
              />
              <Detail
                label="Maximum retail price"
                value={formatCurrency(product.mrp)}
              />
              <Detail label="Available stock" value={stock} />
              <Detail
                label="Created on"
                value={formatDate(product.createdAt)}
              />
            </div>

            <div className="mt-6">
              {sellerError && (
                <Alert severity="warning" className="mb-4">
                  {sellerError}
                </Alert>
              )}

              {sellerProfileId != null ? (
                <Button
                  component={Link}
                  to={`/sellers/${sellerProfileId}`}
                  variant="outlined"
                  sx={{
                    color: "#233636",
                    borderColor: "#BEB7A6",
                    borderRadius: "3px",
                    textTransform: "none",
                  }}
                >
                  View seller profile
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/sellers"
                  variant="outlined"
                  sx={{
                    color: "#233636",
                    borderColor: "#BEB7A6",
                    borderRadius: "3px",
                    textTransform: "none",
                  }}
                >
                  View seller management
                </Button>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
