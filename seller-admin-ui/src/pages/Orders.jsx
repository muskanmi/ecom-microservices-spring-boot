import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { getOrders } from "../services/orderApi";

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

function getOrderId(order) {
  return order?.id ?? order?.orderId ?? "—";
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
  return order?.status || "PENDING";
}

function getPaymentStatus(order) {
  return order?.paymentStatus || order?.payment?.status || "PENDING";
}

function getCustomerEmail(order) {
  return order?.customerEmail || order?.email || order?.userEmail || "";
}

function getCustomerName(order) {
  return (
    order?.customerName ||
    order?.userName ||
    order?.customer?.name ||
    "Customer"
  );
}

function getItemCount(order) {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce((total, item) => {
    return total + Number(item?.quantity ?? item?.qty ?? 1);
  }, 0);
}

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function StatusBadge({ status, type = "order" }) {
  const normalized = normalizeStatus(status);

  let className = "border border-[#E6D7B8] bg-[#F9F3E5] text-[#8A744B]";

  if (
    ["delivered", "completed", "confirmed", "shipped", "paid"].includes(
      normalized,
    )
  ) {
    className = "border border-[#C9DCCB] bg-[#EEF5EE] text-[#55745A]";
  }

  if (["cancelled", "canceled", "failed"].includes(normalized)) {
    className = "border border-[#E5C6C0] bg-[#FBF0EE] text-[#985F55]";
  }

  if (type === "payment" && normalized === "refunded") {
    className = "border border-[#E6D7B8] bg-[#F9F3E5] text-[#8A744B]";
  }

  return (
    <span
      className={`inline-flex px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {normalized || "pending"}
    </span>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [orderStatus, setOrderStatus] = useState("ALL");

  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const [refreshing, setRefreshing] = useState(false);

  async function loadOrders(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getOrders();

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);

      setError(err?.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(getOrderDate(a) || 0).getTime();

      const dateB = new Date(getOrderDate(b) || 0).getTime();

      return dateB - dateA;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedOrders.filter((order) => {
      const id = String(getOrderId(order));

      const number = getOrderNumber(order);

      const customerName = getCustomerName(order);

      const customerEmail = getCustomerEmail(order);

      const matchesSearch =
        !query ||
        id.toLowerCase().includes(query) ||
        number.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query);

      const currentOrderStatus = String(getOrderStatus(order)).toUpperCase();

      const currentPaymentStatus = String(
        getPaymentStatus(order),
      ).toUpperCase();

      const matchesOrderStatus =
        orderStatus === "ALL" || currentOrderStatus === orderStatus;

      const matchesPaymentStatus =
        paymentStatus === "ALL" || currentPaymentStatus === paymentStatus;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [sortedOrders, search, orderStatus, paymentStatus]);

  const totalOrderValue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(getOrderTotal(order) || 0),
      0,
    );
  }, [orders]);

  const pendingFulfilmentCount = useMemo(() => {
    return orders.filter((order) => {
      const status = normalizeStatus(getOrderStatus(order));

      return [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out for delivery",
      ].includes(status);
    }).length;
  }, [orders]);

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* PAGE HEADER */}

      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Orders
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">Orders</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
            Manage customer orders, payments, shipping and fulfilment from one
            place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="bg-[#2D3A3A] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#233030] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Total Orders
          </p>

          <p className="mt-6 font-serif text-4xl text-[#233636]">
            {orders.length}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">Orders received</p>
        </div>

        <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Pending Fulfilment
          </p>

          <p className="mt-6 font-serif text-4xl text-[#233636]">
            {pendingFulfilmentCount}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">Orders requiring action</p>
        </div>

        <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">
            Order Value
          </p>

          <p className="mt-6 font-serif text-3xl text-[#233636]">
            {formatCurrency(totalOrderValue)}
          </p>

          <p className="mt-2 text-xs text-[#8A8378]">Total order value</p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-center justify-between border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadOrders()}
            className="text-[10px] font-semibold uppercase tracking-[0.15em] underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="mb-6 border border-[#DED7C9] bg-[#F7F1E5] p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px]">
          {/* SEARCH */}

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Search Orders
            </label>

            <div className="flex h-12 items-center gap-3 border border-[#DED7C9] bg-[#FFFCF4] px-4 focus-within:border-[#2D3A3A]">
              <SearchOutlinedIcon fontSize="small" className="text-[#8A8378]" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order number, ID or customer..."
                className="w-full bg-transparent text-sm text-[#344444] outline-none placeholder:text-[#9A948A]"
              />
            </div>
          </div>

          {/* ORDER STATUS */}

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Order Status
            </label>

            <select
              value={orderStatus}
              onChange={(event) => setOrderStatus(event.target.value)}
              className="h-12 w-full border border-[#DED7C9] bg-[#FFFCF4] px-4 text-sm text-[#344444] outline-none focus:border-[#2D3A3A]"
            >
              <option value="ALL">All statuses</option>

              <option value="PENDING">Pending</option>

              <option value="CONFIRMED">Confirmed</option>

              <option value="PROCESSING">Processing</option>

              <option value="SHIPPED">Shipped</option>

              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>

              <option value="DELIVERED">Delivered</option>

              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* PAYMENT STATUS */}

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="h-12 w-full border border-[#DED7C9] bg-[#FFFCF4] px-4 text-sm text-[#344444] outline-none focus:border-[#2D3A3A]"
            >
              <option value="ALL">All payments</option>

              <option value="PENDING">Pending</option>

              <option value="PAID">Paid</option>

              <option value="FAILED">Failed</option>

              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULT COUNT */}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? "Order" : "Orders"} Shown
        </p>

        {(search || orderStatus !== "ALL" || paymentStatus !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setOrderStatus("ALL");
              setPaymentStatus("ALL");
            }}
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6F766F] underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="border border-[#DED7C9] bg-[#F7F1E5]">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[100px] animate-pulse border-b border-[#DED7C9] last:border-b-0"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-20 text-center">
          <p className="font-serif text-2xl text-[#233636]">No orders found</p>

          <p className="mt-2 text-sm text-[#8A8378]">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DED7C9] bg-[#F7F1E5]">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="border-b border-[#DED7C9]">
                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Order
                </th>

                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Customer
                </th>

                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Date
                </th>

                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Items
                </th>

                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Total
                </th>

                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Payment
                </th>

                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Status
                </th>

                <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const orderId = getOrderId(order);

                return (
                  <tr
                    key={orderId}
                    className="border-b border-[#DED7C9] last:border-b-0 hover:bg-[#F3ECDF]"
                  >
                    {/* ORDER */}

                    <td className="px-6 py-6">
                      <Link to={`/admin/orders/${orderId}`} className="group">
                        <p className="max-w-[220px] font-serif text-lg text-[#233636] group-hover:text-[#526766]">
                          #{getOrderNumber(order)}
                        </p>

                        <p className="mt-1 text-xs text-[#8A8378]">
                          Order ID #{orderId}
                        </p>
                      </Link>
                    </td>

                    {/* CUSTOMER */}

                    <td className="px-6 py-6">
                      <p className="max-w-[220px] truncate text-sm text-[#344444]">
                        {getCustomerName(order)}
                      </p>

                      {getCustomerEmail(order) && (
                        <p className="mt-1 max-w-[220px] truncate text-xs text-[#8A8378]">
                          {getCustomerEmail(order)}
                        </p>
                      )}
                    </td>

                    {/* DATE */}

                    <td className="px-6 py-6 text-sm text-[#596361]">
                      {formatDate(getOrderDate(order))}
                    </td>

                    {/* ITEMS */}

                    <td className="px-6 py-6">
                      <p className="text-sm text-[#344444]">
                        {getItemCount(order)}
                      </p>

                      <p className="mt-1 text-xs text-[#8A8378]">
                        {getItemCount(order) === 1 ? "product" : "products"}
                      </p>
                    </td>

                    {/* TOTAL */}

                    <td className="px-6 py-6 font-serif text-base text-[#233636]">
                      {formatCurrency(getOrderTotal(order))}
                    </td>

                    {/* PAYMENT */}

                    <td className="px-6 py-6">
                      <StatusBadge
                        status={getPaymentStatus(order)}
                        type="payment"
                      />
                    </td>

                    {/* ORDER STATUS */}

                    <td className="px-6 py-6">
                      <StatusBadge status={getOrderStatus(order)} />
                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-6 text-right">
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="inline-flex bg-[#2D3A3A] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#233030]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;
