import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts, deleteProduct } from "../services/productApi";
import { getProductImageUrl } from "../services/imageUtils";
import { getSellerProfile } from "../services/authApi";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getProductId(product) {
  return product?.id ?? product?.productId;
}

function getProductName(product) {
  return product?.name || "Unnamed Product";
}

function getProductDescription(product) {
  return product?.description || "No description available";
}

function getProductPrice(product) {
  return product?.price ?? product?.sellingPrice ?? 0;
}

function getProductMrp(product) {
  return product?.mrp ?? product?.maximumRetailPrice ?? 0;
}

function getProductStock(product) {
  return Number(product?.stock ?? product?.stockQuantity ?? 0);
}

function getProductCategory(product) {
  return (
    product?.categoryName ||
    product?.category ||
    product?.categoryId ||
    "Uncategorized"
  );
}

function getProductImages(product) {
  if (!Array.isArray(product?.images)) {
    return [];
  }

  return product.images;
}

function StockBadge({ stock }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex whitespace-nowrap border border-[#E5C6C0] bg-[#FBF0EE] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#985F55]">
        Out of Stock
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="inline-flex whitespace-nowrap border border-[#E6D7B8] bg-[#F9F3E5] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A744B]">
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap border border-[#C9DCCB] bg-[#EEF5EE] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#55745A]">
      In Stock
    </span>
  );
}

function ProductStatusBadge({ active }) {
  if (active === false) {
    return (
      <span className="inline-flex whitespace-nowrap border border-[#DED7C9] bg-[#F3ECDF] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#77796F]">
        Inactive
      </span>
    );
  }

  if (active === true) {
    return (
      <span className="inline-flex whitespace-nowrap border border-[#C9DCCB] bg-[#EEF5EE] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#55745A]">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap border border-[#E6D7B8] bg-[#F9F3E5] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A744B]">
      Unknown
    </span>
  );
}

function DeleteModal({ product, deleting, onCancel, onConfirm }) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#233636]/40 px-4">
      <div className="w-full max-w-md border border-[#DED7C9] bg-[#FFFCF4] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#DED7C9] px-7 py-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#985F55]">
            Catalogue / Delete Product
          </p>

          <h2 className="mt-3 font-serif text-2xl text-[#233636]">
            Delete Product
          </h2>
        </div>

        {/* Content */}
        <div className="px-7 py-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center border border-[#E5C6C0] bg-[#FBF0EE] text-xl text-[#985F55]">
            !
          </div>

          <p className="text-sm leading-6 text-[#596361]">
            Are you sure you want to delete this product?
          </p>

          <div className="mt-5 border border-[#DED7C9] bg-[#F7F1E5] px-5 py-4">
            <p className="font-serif text-lg text-[#233636]">
              {getProductName(product)}
            </p>

            <p className="mt-1 text-xs text-[#8A8378]">
              Product ID #{getProductId(product)}
            </p>
          </div>

          <p className="mt-5 text-xs leading-5 text-[#8A8378]">
            This action cannot be undone. The product will be removed from the
            seller catalogue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[#DED7C9] px-7 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="border border-[#DED7C9] bg-[#FFFCF4] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#596361] transition hover:border-[#2D3A3A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="border border-[#985F55] bg-[#985F55] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#824E46] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(true);
  const [approvalError, setApprovalError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getProducts();

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load products:", err);

      setError(err?.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map((product) => String(getProductCategory(product)))
      .filter(Boolean);

    return [...new Set(values)];
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    async function loadApprovalStatus() {
      const token = localStorage.getItem("token");

      if (!token) {
        setApprovalError("Your session has expired. Please log in again.");
        setApprovalLoading(false);
        return;
      }

      try {
        const response = await getSellerProfile(token);
        const status = response?.data?.approvalStatus;

        if (!status) {
          throw new Error("Seller approval status is unavailable.");
        }

        if (!cancelled) {
          setApprovalStatus(String(status).trim().toUpperCase());
          setApprovalError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load seller approval status:", error);
          setApprovalError(
            "Unable to verify your seller approval status. Please refresh and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setApprovalLoading(false);
        }
      }
    }

    loadApprovalStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = getProductName(product).toLowerCase();

      const description = getProductDescription(product).toLowerCase();

      const category = String(getProductCategory(product)).toLowerCase();

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        description.includes(searchValue) ||
        category.includes(searchValue);

      const matchesCategory =
        categoryFilter === "ALL" ||
        String(getProductCategory(product)) === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) => total + getProductStock(product),
      0,
    );
  }, [products]);

  const outOfStock = useMemo(() => {
    return products.filter((product) => getProductStock(product) <= 0).length;
  }, [products]);

  const lowStock = useMemo(() => {
    return products.filter((product) => {
      const stock = getProductStock(product);

      return stock > 0 && stock <= 10;
    }).length;
  }, [products]);

  function openDeleteModal(product) {
    setSuccess("");
    setError("");
    setProductToDelete(product);
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setProductToDelete(null);
  }

  async function confirmDelete() {
    if (!productToDelete) {
      return;
    }

    // Verify that the seller is approved before deleting.
    if (approvalLoading || approvalError || approvalStatus !== "APPROVED") {
      setError(
        "You can delete products only after your seller account is approved.",
      );
      setProductToDelete(null);
      return;
    }

    const productId = getProductId(productToDelete);
    const productName = getProductName(productToDelete);

    if (productId == null) {
      setError("Unable to delete product: product ID is missing.");
      setProductToDelete(null);
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await deleteProduct(productId);

      setProducts((currentProducts) =>
        currentProducts.filter((item) => getProductId(item) !== productId),
      );

      setProductToDelete(null);

      setSuccess(`"${productName}" was deleted successfully.`);

      window.setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Failed to delete product:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete product. Please try again.",
      );

      setProductToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
              Seller Console / Catalogue
            </p>

            <h1 className="font-serif text-4xl text-[#233636]">Products</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
              Manage your product catalogue, pricing, inventory and product
              images.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="border border-[#2D3A3A] bg-[#2D3A3A] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#233030] disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>

            {approvalStatus === "APPROVED" &&
            !approvalLoading &&
            !approvalError ? (
              <Link
                to="/admin/products/new"
                className="border border-[#2D3A3A] bg-[#2D3A3A] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#233030]"
              >
                + Add Product
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Product management requires an approved seller account."
                className="cursor-not-allowed border border-[#DED7C9] bg-[#EAE5DA] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A8378]"
              >
                + Add Product
              </button>
            )}
          </div>
        </div>

        {approvalLoading ? (
          <div className="mb-6 border border-[#DED7C9] bg-[#F7F1E5] px-5 py-4 text-sm text-[#596361]">
            Verifying seller approval...
          </div>
        ) : approvalError ? (
          <div className="mb-6 border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
            {approvalError}
          </div>
        ) : approvalStatus === "REJECTED" ? (
          <div className="mb-6 border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
            <p className="font-semibold">Seller application rejected</p>
            <p className="mt-1">
              You cannot add, edit, or delete products because your seller
              application has been rejected. Please contact marketplace support
              if you need assistance.
            </p>
          </div>
        ) : approvalStatus === "PENDING" ? (
          <div className="mb-6 border border-[#E6D7B8] bg-[#F9F3E5] px-5 py-4 text-sm text-[#8A744B]">
            Your seller application is awaiting approval. Product management
            will be available once your account is approved.
          </div>
        ) : approvalStatus !== "APPROVED" ? (
          <div className="mb-6 border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
            Your seller status could not be verified. Product management is
            unavailable until your approval status is confirmed.
          </div>
        ) : null}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-center justify-between border border-[#C9DCCB] bg-[#EEF5EE] px-5 py-4 text-sm text-[#55745A]">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SUMMARY */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
              Total Products
            </p>

            <p className="mt-4 font-serif text-3xl text-[#233636]">
              {products.length}
            </p>

            <p className="mt-2 text-xs text-[#8A8378]">Products in catalogue</p>
          </div>

          <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
              Total Inventory
            </p>

            <p className="mt-4 font-serif text-3xl text-[#233636]">
              {totalStock}
            </p>

            <p className="mt-2 text-xs text-[#8A8378]">
              Units currently available
            </p>
          </div>

          <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
              Inventory Alerts
            </p>

            <div className="mt-4 flex items-end gap-5">
              <div>
                <p className="font-serif text-2xl text-[#8A744B]">{lowStock}</p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8A8378]">
                  Low
                </p>
              </div>

              <div>
                <p className="font-serif text-2xl text-[#985F55]">
                  {outOfStock}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8A8378]">
                  Out
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 border border-[#DED7C9] bg-[#F7F1E5] p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Search Products
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8378]">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product name, description or category..."
                  className="h-12 w-full border border-[#DED7C9] bg-[#FFFCF4] pl-10 pr-4 text-sm text-[#344444] outline-none placeholder:text-[#A19A90] focus:border-[#2D3A3A]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-12 w-full border border-[#DED7C9] bg-[#FFFCF4] px-4 text-sm text-[#344444] outline-none focus:border-[#2D3A3A]"
              >
                <option value="ALL">All categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center justify-between border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadProducts}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* RESULT COUNT */}
        {!loading && !error && (
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} shown
            </p>

            {(search || categoryFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("ALL");
                }}
                className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#526766] underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="border border-[#DED7C9] bg-[#F7F1E5]">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-[120px] animate-pulse border-b border-[#DED7C9] last:border-b-0"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-[#DED7C9] bg-[#FFFCF4] text-xl text-[#8A8378]">
              ▣
            </div>

            <p className="font-serif text-2xl text-[#233636]">
              No products found
            </p>

            <p className="mt-2 text-sm text-[#8A8378]">
              Try changing your search or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#DED7C9] bg-[#F7F1E5]">
            <table className="w-full min-w-[1150px] border-collapse">
              <thead>
                <tr className="border-b border-[#DED7C9]">
                  <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Product
                  </th>

                  <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Category
                  </th>

                  <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Price
                  </th>

                  <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    MRP
                  </th>

                  <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Stock
                  </th>

                  <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Status
                  </th>

                  <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const productId = getProductId(product);

                  const images = getProductImages(product);

                  const firstImage =
                    images.length > 0
                      ? getProductImageUrl(images[0]?.imageUrl)
                      : null;

                  const stock = getProductStock(product);

                  const isBeingDeleted =
                    deleting && getProductId(productToDelete) === productId;

                  return (
                    <tr
                      key={productId}
                      className="border-b border-[#DED7C9] transition last:border-b-0 hover:bg-[#F3ECDF]"
                    >
                      {/* PRODUCT */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden border border-[#DED7C9] bg-[#FFFCF4]">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={getProductName(product)}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl text-[#A19A90]">
                                □
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <Link
                              to={`/admin/products/${productId}`}
                              className="font-serif text-lg text-[#233636] hover:text-[#526766]"
                            >
                              {getProductName(product)}
                            </Link>

                            <p className="mt-1 max-w-[320px] truncate text-xs text-[#8A8378]">
                              {getProductDescription(product)}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#A19A90]">
                              ID #{productId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="px-6 py-5 text-sm text-[#596361]">
                        {getProductCategory(product)}
                      </td>

                      {/* PRICE */}
                      <td className="whitespace-nowrap px-6 py-5 font-serif text-base text-[#233636]">
                        {formatCurrency(getProductPrice(product))}
                      </td>

                      {/* MRP */}
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-[#8A8378]">
                        {formatCurrency(getProductMrp(product))}
                      </td>

                      {/* STOCK */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-[#344444]">
                          {stock}
                        </p>

                        <p className="mt-1 text-xs text-[#8A8378]">units</p>
                      </td>

                      {/* PRODUCT STATUS */}
                      <td className="px-6 py-5">
                        <ProductStatusBadge active={product.active} />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/products/${productId}`}
                            className="border border-[#DED7C9] bg-[#FFFCF4] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#344444] transition hover:border-[#2D3A3A]"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/products/${productId}/edit`}
                            aria-disabled={
                              approvalStatus !== "APPROVED" ||
                              approvalLoading ||
                              !!approvalError
                            }
                            onClick={(event) => {
                              if (
                                approvalStatus !== "APPROVED" ||
                                approvalLoading ||
                                approvalError
                              ) {
                                event.preventDefault();
                              }
                            }}
                            className={`border px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                              approvalStatus === "APPROVED" &&
                              !approvalLoading &&
                              !approvalError
                                ? "bg-[#2D3A3A] text-white hover:bg-[#233030]"
                                : "cursor-not-allowed border-[#DED7C9] bg-[#EAE5DA] text-[#8A8378]"
                            }`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(product)}
                            disabled={
                              deleting ||
                              approvalLoading ||
                              !!approvalError ||
                              approvalStatus !== "APPROVED"
                            }
                            className="border border-[#E5C6C0] bg-[#FBF0EE] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#985F55] transition hover:bg-[#F6E4E0] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBeingDeleted ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      <DeleteModal
        product={productToDelete}
        deleting={deleting}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default Products;
