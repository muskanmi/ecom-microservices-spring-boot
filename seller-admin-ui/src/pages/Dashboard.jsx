import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../services/productApi";
import { getOrders } from "../services/orderApi";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
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

function getOrderId(order) {
  return order?.id ?? order?.orderId;
}

function getOrderNumber(order) {
  return order?.orderNumber || `ORD-${getOrderId(order)}`;
}

function getOrderDate(order) {
  return order?.createdAt || order?.createdDate || order?.orderDate;
}

function getOrderTotal(order) {
  return order?.totalAmount ?? order?.total ?? order?.grandTotal ?? 0;
}

function getOrderStatus(order) {
  return String(order?.status || "PENDING").toUpperCase();
}

function getProductStock(product) {
  return Number(product?.stock ?? product?.stockQuantity ?? 0);
}

function getProductImage(product) {
  if (!Array.isArray(product?.images) || product.images.length === 0) {
    return null;
  }

  const imageUrl = product.images[0]?.imageUrl;

  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${import.meta.env.VITE_CATALOG_URL}${imageUrl}`;
}

function StatusBadge({ status }) {
  const normalized = String(status || "PENDING")
    .toLowerCase()
    .replace(/_/g, " ");

  let className = "border border-[#E6D7B8] bg-[#F9F3E5] text-[#8A744B]";

  if (["delivered", "completed", "confirmed", "shipped"].includes(normalized)) {
    className = "border border-[#C9DCCB] bg-[#EEF5EE] text-[#55745A]";
  }

  if (["cancelled", "canceled", "failed"].includes(normalized)) {
    className = "border border-[#E5C6C0] bg-[#FBF0EE] text-[#985F55]";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {normalized}
    </span>
  );
}

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, ordersResponse] = await Promise.all([
        getProducts(),
        getOrders(),
      ]);

      setProducts(
        Array.isArray(productsResponse.data) ? productsResponse.data : [],
      );

      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);

      setError(
        err?.response?.data?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalProducts = products.length;

  const totalOrders = orders.length;

  const totalOrderValue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(getOrderTotal(order) || 0),
      0,
    );
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order);

      return !["DELIVERED", "COMPLETED", "CANCELLED", "CANCELED"].includes(
        status,
      );
    }).length;
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(getOrderDate(a) || 0).getTime();

        const dateB = new Date(getOrderDate(b) || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  const catalogueProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="border border-[#2D3A3A] bg-[#2D3A3A] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#233030] disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

          <Link
            to="/admin/products/new"
            className="border border-[#2D3A3A] bg-[#2D3A3A] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#233030]"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center justify-between border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadDashboard}
            className="text-[10px] font-semibold uppercase tracking-[0.15em] underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Total Products
          </p>

          <p className="mt-5 font-serif text-3xl text-[#233636]">
            {loading ? "—" : totalProducts}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">
            Products in your catalogue
          </p>
        </div>

        <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Total Orders
          </p>

          <p className="mt-5 font-serif text-3xl text-[#233636]">
            {loading ? "—" : totalOrders}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">Orders received</p>
        </div>

        <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Order Value
          </p>

          <p className="mt-5 font-serif text-3xl text-[#233636]">
            {loading ? "—" : formatCurrency(totalOrderValue)}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">Total order value</p>
        </div>

        <div className="border border-[#DED7C9] bg-[#F7F1E5] p-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Pending Orders
          </p>

          <p className="mt-5 font-serif text-3xl text-[#233636]">
            {loading ? "—" : pendingOrders}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">Orders awaiting action</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {/* RECENT ORDERS */}
        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-6">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
                Activity
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#233636]">
                Recent Orders
              </h2>
            </div>

            <Link
              to="/admin/orders"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#526766] hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="mb-3 h-16 animate-pulse bg-[#EDE5D7]"
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-serif text-xl text-[#233636]">No orders yet</p>

              <p className="mt-2 text-sm text-[#8A8378]">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div>
              {recentOrders.map((order) => {
                const orderId = getOrderId(order);

                return (
                  <Link
                    key={orderId}
                    to={`/admin/orders/${orderId}`}
                    className="flex items-center justify-between gap-5 border-b border-[#DED7C9] px-6 py-5 transition last:border-b-0 hover:bg-[#F3ECDF]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base text-[#233636]">
                        {getOrderNumber(order)}
                      </p>

                      <p className="mt-1 text-xs text-[#8A8378]">
                        {formatDate(getOrderDate(order))}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-5">
                      <p className="font-serif text-sm text-[#344444]">
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

        {/* CATALOGUE */}
        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-6">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#233636]">
                Catalogue Snapshot
              </h2>
            </div>

            <Link
              to="/admin/products"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#526766] hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="mb-3 h-16 animate-pulse bg-[#EDE5D7]"
                />
              ))}
            </div>
          ) : catalogueProducts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-serif text-xl text-[#233636]">
                No products yet
              </p>

              <Link
                to="/admin/products/new"
                className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#526766] underline"
              >
                Add Product
              </Link>
            </div>
          ) : (
            <div>
              {catalogueProducts.map((product) => {
                const productId = product?.id ?? product?.productId;

                const image = getProductImage(product);

                const stock = getProductStock(product);

                return (
                  <Link
                    key={productId}
                    to={`/admin/products/${productId}`}
                    className="flex items-center gap-4 border-b border-[#DED7C9] px-6 py-4 transition last:border-b-0 hover:bg-[#F3ECDF]"
                  >
                    {/* IMAGE */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden border border-[#DED7C9] bg-[#FFFCF4]">
                      {image ? (
                        <img
                          src={image}
                          alt={product?.name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#A19A90]">
                          □
                        </div>
                      )}
                    </div>

                    {/* PRODUCT */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base text-[#233636]">
                        {product?.name || "Unnamed Product"}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8A8378]">
                        ID #{productId}
                      </p>
                    </div>

                    {/* PRICE */}
                    <div className="text-right">
                      <p className="font-serif text-sm text-[#344444]">
                        {formatCurrency(product?.price)}
                      </p>

                      <p
                        className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                          stock <= 0
                            ? "text-[#985F55]"
                            : stock <= 10
                              ? "text-[#8A744B]"
                              : "text-[#55745A]"
                        }`}
                      >
                        {stock <= 0 ? "Out of stock" : `${stock} in stock`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* QUICK ACTIONS */}
      <section className="mt-5 border border-[#DED7C9] bg-[#F7F1E5]">
        <div className="border-b border-[#DED7C9] px-6 py-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Seller Workspace
          </p>

          <h2 className="mt-2 font-serif text-2xl text-[#233636]">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <Link
            to="/admin/products/new"
            className="border-b border-[#DED7C9] p-6 transition hover:bg-[#F3ECDF] md:border-b-0 md:border-r"
          >
            <p className="text-lg text-[#526766]">+</p>

            <p className="mt-4 font-serif text-lg text-[#233636]">
              Add Product
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8378]">
              Add a new product to your marketplace catalogue.
            </p>
          </Link>

          <Link
            to="/admin/products"
            className="border-b border-[#DED7C9] p-6 transition hover:bg-[#F3ECDF] md:border-b-0 md:border-r"
          >
            <p className="text-lg text-[#526766]">▣</p>

            <p className="mt-4 font-serif text-lg text-[#233636]">
              Manage Catalogue
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8378]">
              Review pricing, inventory and product images.
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="p-6 transition hover:bg-[#F3ECDF]"
          >
            <p className="text-lg text-[#526766]">◫</p>

            <p className="mt-4 font-serif text-lg text-[#233636]">
              Manage Orders
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8378]">
              Review orders, shipping and fulfilment status.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
