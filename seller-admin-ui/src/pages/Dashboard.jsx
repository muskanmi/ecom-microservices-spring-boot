import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { getProductImageUrl } from "../services/imageUtils";

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, description }) {
  return (
    <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
        {label}
      </p>

      <p className="mt-5 font-serif text-3xl text-[#233636]">{value}</p>

      <p className="mt-3 text-xs text-[#8A8378]">{description}</p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .replace(/_/g, " ");

  const isSuccess = [
    "delivered",
    "completed",
    "shipped",
    "confirmed",
    "paid",
  ].includes(normalizedStatus);

  const isDanger = ["cancelled", "canceled", "failed"].includes(
    normalizedStatus,
  );

  const isWarning = ["pending", "processing", "placed"].includes(
    normalizedStatus,
  );

  let className = "border border-[#DED7C9] bg-[#F4EFE4] text-[#6F766F]";

  if (isSuccess) {
    className = "border border-[#C9DCCB] bg-[#EEF5EE] text-[#55745A]";
  }

  if (isDanger) {
    className = "border border-[#E5C6C0] bg-[#FBF0EE] text-[#985F55]";
  }

  if (isWarning) {
    className = "border border-[#E6D7B8] bg-[#F9F3E5] text-[#8A744B]";
  }

  return (
    <span
      className={`inline-flex px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {normalizedStatus || "Unknown"}
    </span>
  );
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   ORDER HELPERS
========================================================= */

function getOrderId(order) {
  return order?.id ?? "—";
}

function getOrderNumber(order) {
  return order?.orderNumber ?? `#ORD-${getOrderId(order)}`;
}

function getOrderStatus(order) {
  return order?.status ?? "Pending";
}

function getOrderDate(order) {
  return order?.createdAt;
}

function getOrderTotal(order) {
  return Number(order?.totalAmount || 0);
}

/* =========================================================
   PRODUCT HELPERS
========================================================= */

function getProductStock(product) {
  return Number(product?.stock ?? 0);
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, ordersResponse] = await Promise.all([
          api.get("/api/admin/products"),
          api.get("/api/admin/orders"),
        ]);

        if (!isMounted) {
          return;
        }

        setProducts(
          Array.isArray(productsResponse.data) ? productsResponse.data : [],
        );

        setOrders(
          Array.isArray(ordersResponse.data) ? ordersResponse.data : [],
        );
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load dashboard information.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     DASHBOARD STATISTICS
  ======================================================= */

  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;

    const totalOrders = orders.length;

    /*
     * This is total order value, based on totalAmount.
     * It is intentionally not called "net revenue".
     */
    const totalOrderValue = orders.reduce((sum, order) => {
      return sum + getOrderTotal(order);
    }, 0);

    const pendingOrders = orders.filter((order) => {
      const status = String(getOrderStatus(order))
        .toLowerCase()
        .replace(/_/g, " ");

      return ["pending", "processing", "placed"].includes(status);
    }).length;

    return {
      totalProducts,
      totalOrders,
      totalOrderValue,
      pendingOrders,
    };
  }, [products, orders]);

  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(getOrderDate(a) || 0).getTime();

        const dateB = new Date(getOrderDate(b) || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  /* =======================================================
     CATALOGUE SNAPSHOT
  ======================================================= */

  const catalogueProducts = useMemo(() => {
    return [...products].slice(0, 5);
  }, [products]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Overview
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">Dashboard</h1>

          <p className="mt-3 text-sm text-[#6F766F]">
            Loading marketplace information...
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[150px] animate-pulse border border-[#DED7C9] bg-[#F7F1E5]"
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[350px] animate-pulse border border-[#DED7C9] bg-[#F7F1E5]" />

          <div className="h-[350px] animate-pulse border border-[#DED7C9] bg-[#F7F1E5]" />
        </div>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD UI
  ======================================================= */

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* =================================================
          PAGE INTRO
      ================================================= */}

      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Overview
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">Dashboard</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
            Manage your marketplace catalogue, orders and seller operations from
            one place.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-[#2D3A3A] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#233030]"
        >
          <span className="text-base leading-none">+</span>
          Add Product
        </Link>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
          {error}
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value={dashboardStats.totalProducts}
          description="Products in your catalogue"
        />

        <StatCard
          label="Total Orders"
          value={dashboardStats.totalOrders}
          description="Orders received"
        />

        <StatCard
          label="Order Value"
          value={formatCurrency(dashboardStats.totalOrderValue)}
          description="Total order value"
        />

        <StatCard
          label="Pending Orders"
          value={dashboardStats.pendingOrders}
          description="Orders awaiting action"
        />
      </div>

      {/* =================================================
          MAIN PANELS
      ================================================= */}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Activity
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Recent Orders
              </h2>
            </div>

            <Link
              to="/admin/orders"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5F6968] hover:text-[#233636]"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-serif text-lg text-[#2D3A3A]">
                No recent orders
              </p>

              <p className="mt-2 text-sm text-[#8A8378]">
                Order activity will appear here.
              </p>
            </div>
          ) : (
            <div>
              {recentOrders.map((order, index) => {
                const orderId = getOrderId(order);

                return (
                  <Link
                    key={`${orderId}-${index}`}
                    to={`/admin/orders/${orderId}`}
                    className="flex items-center justify-between gap-4 border-b border-[#DED7C9] px-6 py-5 last:border-b-0 hover:bg-[#F3ECDF]"
                  >
                    {/* Order information */}

                    <div className="min-w-0">
                      <p className="font-serif text-base text-[#233636]">
                        {getOrderNumber(order)}
                      </p>

                      <p className="mt-1 text-xs text-[#8A8378]">
                        {formatDate(getOrderDate(order))}
                      </p>
                    </div>

                    {/* Order amount/status */}

                    <div className="flex shrink-0 items-center gap-5">
                      <p className="text-sm text-[#344444]">
                        {formatCurrency(getOrderTotal(order))}
                      </p>

                      <StatusBadge status={getOrderStatus(order)} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            CATALOGUE SNAPSHOT
        ================================================= */}

        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Catalogue Snapshot
              </h2>
            </div>

            <Link
              to="/admin/products"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5F6968] hover:text-[#233636]"
            >
              View All
            </Link>
          </div>

          {catalogueProducts.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-serif text-lg text-[#2D3A3A]">
                Your catalogue is empty
              </p>

              <Link
                to="/admin/products/new"
                className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-[#4F6462] hover:text-[#233636]"
              >
                Add your first product →
              </Link>
            </div>
          ) : (
            <div>
              {catalogueProducts.map((product, index) => {
                const stock = getProductStock(product);

                const imageUrl = product?.images?.[0]?.imageUrl
                  ? getProductImageUrl(product.images[0].imageUrl)
                  : null;

                return (
                  <Link
                    key={`${product.id}-${index}`}
                    to={`/admin/products/${product.id}`}
                    className="flex items-center justify-between gap-4 border-b border-[#DED7C9] px-6 py-5 last:border-b-0 hover:bg-[#F3ECDF]"
                  >
                    {/* Product information */}

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[#DED7C9] bg-white">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name || "Product"}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xl text-[#B0A99D]">□</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-serif text-base text-[#233636]">
                          {product.name || "Unnamed Product"}
                        </p>

                        <p className="mt-1 text-xs text-[#8A8378]">
                          ID #{product.id}
                        </p>
                      </div>
                    </div>

                    {/* Product price/stock */}

                    <div className="shrink-0 text-right">
                      <p className="text-sm text-[#344444]">
                        {formatCurrency(product.price)}
                      </p>

                      <p
                        className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          stock > 0 ? "text-[#55745A]" : "text-[#985F55]"
                        }`}
                      >
                        {stock > 0 ? `${stock} in stock` : "Out of stock"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="mt-6 border border-[#DED7C9] bg-[#F7F1E5]">
        <div className="border-b border-[#DED7C9] px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
            Seller Workspace
          </p>

          <h2 className="mt-2 font-serif text-xl text-[#233636]">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px bg-[#DED7C9] md:grid-cols-3">
          {/* Add Product */}

          <Link
            to="/admin/products/new"
            className="bg-[#F7F1E5] px-6 py-6 transition hover:bg-[#F3ECDF]"
          >
            <p className="text-lg text-[#233636]">＋</p>

            <p className="mt-3 font-serif text-lg text-[#233636]">
              Add Product
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8378]">
              Create a new product and upload its images.
            </p>
          </Link>

          {/* Manage Products */}

          <Link
            to="/admin/products"
            className="bg-[#F7F1E5] px-6 py-6 transition hover:bg-[#F3ECDF]"
          >
            <p className="text-lg text-[#233636]">▣</p>

            <p className="mt-3 font-serif text-lg text-[#233636]">
              Manage Products
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8378]">
              Edit catalogue information, pricing, stock and images.
            </p>
          </Link>

          {/* Manage Orders */}

          <Link
            to="/admin/orders"
            className="bg-[#F7F1E5] px-6 py-6 transition hover:bg-[#F3ECDF]"
          >
            <p className="text-lg text-[#233636]">□</p>

            <p className="mt-3 font-serif text-lg text-[#233636]">
              Manage Orders
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8378]">
              Review orders, shipping information and fulfilment status.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
