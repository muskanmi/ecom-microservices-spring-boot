import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBackOutlined,
  RefreshOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllSellers, updateSellerApproval } from "../api/adminSellerApi";
import { getAllCatalogProducts, CATALOG_URL } from "../api/adminCatalogApi";

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

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
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

function statusColors(status) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return { backgroundColor: "#E7F2E8", color: "#326B43" };
    case "REJECTED":
      return { backgroundColor: "#FBE9E6", color: "#A33B32" };
    default:
      return { backgroundColor: "#F7EED8", color: "#87651C" };
  }
}

function getProductImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0];

  if (!firstImage) return "";

  const imageValue =
    typeof firstImage === "string"
      ? firstImage
      : firstImage.url || firstImage.imageUrl || firstImage.path || "";

  if (!imageValue) return "";

  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  return `${CATALOG_URL}${imageValue.startsWith("/") ? "" : "/"}${imageValue}`;
}

export default function SellerDetailsPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [message, setMessage] = useState("");

  const clearSession = useCallback(() => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUserId");
    sessionStorage.removeItem("adminRole");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadSeller = useCallback(async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      clearSession();
      return;
    }

    setLoading(true);
    setProductsLoading(true);
    setError("");
    setProductsError("");

    try {
      const sellers = await getAllSellers(token);

      const found = sellers.find(
        (item) => String(item.sellerProfileId) === String(sellerId),
      );

      if (!found) {
        setSeller(null);
        setProducts([]);
        setError("Seller not found.");
        setProductsLoading(false);
        return;
      }

      setSeller(found);

      try {
        const allProducts = await getAllCatalogProducts(token);

        // Products are associated with the seller's user ID.
        const sellerProducts = allProducts.filter(
          (product) => String(product.sellerId) === String(found.userId),
        );

        setProducts(sellerProducts);
      } catch (err) {
        if (err.message?.toLowerCase().includes("sign in again")) {
          clearSession();
          return;
        }

        setProductsError(
          err.message || "Unable to load this seller's products.",
        );
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        clearSession();
        return;
      }

      setError(err.message || "Unable to load seller details.");
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  }, [sellerId, clearSession]);

  useEffect(() => {
    loadSeller();
  }, [loadSeller]);

  async function handleApproval(status) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this seller?`)) {
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      clearSession();
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const updated = await updateSellerApproval(
        token,
        seller.sellerProfileId,
        status,
      );

      setSeller((previous) => ({
        ...previous,
        ...updated,
        approvalStatus: updated?.approvalStatus || status,
      }));

      setMessage(
        `Seller successfully ${status === "APPROVED" ? "approved" : "rejected"}.`,
      );
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        clearSession();
        return;
      }

      setError(err.message || "Unable to update seller approval.");
    } finally {
      setUpdating(false);
    }
  }

  const status = seller?.approvalStatus?.toUpperCase() || "PENDING";

  const totalStock = products.reduce(
    (total, product) => total + (Number(product.stock) || 0),
    0,
  );

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) <= 0,
  ).length;

  return (
    <div>
      <Link
        to="/sellers"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#8B7850] hover:text-[#233636]"
      >
        <ArrowBackOutlined fontSize="small" />
        Back to Seller Management
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Seller Details
          </h1>

          <p className="mt-3 text-sm text-[#77796F]">
            Seller Profile ID: {sellerId}
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadSeller}
          disabled={loading || productsLoading || updating}
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

      {message && (
        <Alert
          severity="success"
          className="mt-6"
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {loading ? (
        <div className="mt-8 flex min-h-56 items-center justify-center gap-3 border border-[#E7E0D1] bg-white text-sm text-[#77796F]">
          <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
          Loading seller details...
        </div>
      ) : seller ? (
        <>
          {/* Seller profile */}
          <section className="mt-8 border border-[#E7E0D1] bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#233636",
                    color: "#E6C875",
                    fontSize: 26,
                  }}
                >
                  {seller.shopName?.charAt(0)?.toUpperCase() || "S"}
                </Avatar>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#77796F]">
                    Seller profile
                  </p>

                  <h2 className="mt-2 font-editorial text-3xl">
                    {seller.shopName || "Unnamed shop"}
                  </h2>

                  <p className="mt-2 text-sm text-[#77796F]">
                    {seller.name || "Unnamed seller"}
                  </p>

                  <p className="mt-1 break-all text-sm text-[#77796F]">
                    {seller.email || "—"}
                  </p>
                </div>
              </div>

              <Chip
                label={status}
                sx={{
                  ...statusColors(status),
                  borderRadius: "3px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              />
            </div>

            <Divider sx={{ my: 3, borderColor: "#E7E0D1" }} />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <Detail
                label="Seller profile ID"
                value={seller.sellerProfileId}
              />
              <Detail label="User ID" value={seller.userId} />
              <Detail label="Seller name" value={seller.name} />
              <Detail label="Email address" value={seller.email} />
              <Detail label="Shop name" value={seller.shopName} />
              <Detail
                label="Registered on"
                value={formatDate(seller.createdAt)}
              />
            </div>
          </section>

          {/* Seller product statistics */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border border-[#E7E0D1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77796F]">
                Total products
              </p>
              <p className="mt-3 font-editorial text-4xl">
                {productsLoading ? "—" : products.length}
              </p>
            </div>

            <div className="border border-[#E7E0D1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77796F]">
                Total stock units
              </p>
              <p className="mt-3 font-editorial text-4xl">
                {productsLoading ? "—" : totalStock}
              </p>
            </div>

            <div className="border border-[#E7E0D1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77796F]">
                Out of stock
              </p>
              <p className="mt-3 font-editorial text-4xl">
                {productsLoading ? "—" : outOfStockCount}
              </p>
            </div>
          </section>

          {/* Seller products */}
          <section className="mt-8 border border-[#E7E0D1] bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-editorial text-2xl">Seller products</h2>
                <p className="mt-2 text-sm text-[#77796F]">
                  Products associated with this seller's account.
                </p>
              </div>

              <span className="text-sm text-[#77796F]">
                {productsLoading ? "Loading..." : `${products.length} products`}
              </span>
            </div>

            {productsError && (
              <Alert severity="error" className="mt-5">
                {productsError}
              </Alert>
            )}

            {productsLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-[#77796F]">
                <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
                Loading seller products...
              </div>
            ) : !productsError && products.length === 0 ? (
              <div className="mt-5 border border-[#EEE8DC] px-5 py-12 text-center">
                <Inventory2Outlined sx={{ fontSize: 36, color: "#8B7850" }} />
                <h3 className="mt-3 font-editorial text-xl">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-[#77796F]">
                  No catalog products are associated with this seller's user ID.
                </p>
              </div>
            ) : (
              !productsError && (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[850px] border-collapse text-left">
                    <thead className="bg-[#F5F0E5]">
                      <tr>
                        {[
                          "Product",
                          "Category",
                          "Price",
                          "Stock",
                          "Created",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="border-b border-[#E7E0D1] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F]"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product) => {
                        const imageUrl = getProductImage(product);
                        const stock = Number(product.stock) || 0;

                        return (
                          <tr
                            key={product.id}
                            className="border-b border-[#EEE8DC] last:border-0 hover:bg-[#FFFCF7]"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product.name || "Product"}
                                    className="h-14 w-14 rounded-sm border border-[#E7E0D1] object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.visibility =
                                        "hidden";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 items-center justify-center border border-[#E7E0D1] bg-[#F7F3E9]">
                                    <Inventory2Outlined
                                      sx={{ color: "#8B7850" }}
                                    />
                                  </div>
                                )}

                                <div>
                                  <p className="font-medium text-[#2D3A3A]">
                                    {product.name || "Unnamed product"}
                                  </p>
                                  <p className="mt-1 text-xs text-[#77796F]">
                                    ID: {product.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-[#77796F]">
                              {product.categoryName || "Uncategorized"}
                            </td>

                            <td className="px-4 py-4 text-sm font-medium">
                              {formatCurrency(product.price)}
                            </td>

                            <td className="px-4 py-4">
                              <Chip
                                size="small"
                                label={stock <= 0 ? "Out of stock" : stock}
                                sx={{
                                  backgroundColor:
                                    stock <= 0 ? "#FBE9E6" : "#E7F2E8",
                                  color: stock <= 0 ? "#A33B32" : "#326B43",
                                  borderRadius: "3px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              />
                            </td>

                            <td className="px-4 py-4 text-sm text-[#77796F]">
                              {formatDate(product.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </section>

          {/* Approval management */}
          <section className="mt-6 border border-[#E7E0D1] bg-white p-5 md:p-6">
            <h2 className="font-editorial text-2xl">Approval management</h2>

            <p className="mt-2 text-sm text-[#77796F]">
              Review and manage this seller's marketplace application.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {status === "PENDING" ? (
                <>
                  <Button
                    variant="contained"
                    disabled={updating}
                    onClick={() => handleApproval("APPROVED")}
                    sx={{
                      backgroundColor: "#2D5B4C",
                      borderRadius: "3px",
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#23483C",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {updating ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      "Approve Seller"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    disabled={updating}
                    onClick={() => handleApproval("REJECTED")}
                    sx={{
                      color: "#A33B32",
                      borderColor: "#D9B8B1",
                      borderRadius: "3px",
                      textTransform: "none",
                    }}
                  >
                    Reject Seller
                  </Button>
                </>
              ) : (
                <p className="text-sm text-[#77796F]">
                  This seller's current status is {status}. The existing
                  workflow only offers actions for pending applications.
                </p>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
