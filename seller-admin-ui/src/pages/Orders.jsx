import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

function getItemCount(order) {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce((total, item) => {
    return total + Number(item?.quantity ?? item?.qty ?? 1);
  }, 0);
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
      className={`inline-flex px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {normalized}
    </span>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await getOrders();

        if (!mounted) {
          return;
        }

        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);

        if (mounted) {
          setError(err?.response?.data?.message || "Unable to load orders.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(getOrderDate(a) || 0).getTime();

      const dateB = new Date(getOrderDate(b) || 0).getTime();

      return dateB - dateA;
    });
  }, [orders]);

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Page Header */}
      <div className="mb-10">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
          Seller Console / Orders
        </p>

        <h1 className="font-serif text-4xl text-[#233636]">Orders</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
          Manage customer orders, payments, shipping and fulfilment from one
          place.
        </p>
      </div>

      {/* Order count */}
      <div className="mb-6 flex items-center justify-between border border-[#DED7C9] bg-[#F7F1E5] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="text-lg text-[#8A8378]">▣</span>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
            Order Management
          </p>
        </div>

        <p className="font-serif text-sm text-[#344444]">
          {orders.length} orders
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="border border-[#DED7C9] bg-[#F7F1E5]">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[100px] animate-pulse border-b border-[#DED7C9] last:border-b-0"
            />
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-16 text-center">
          <p className="font-serif text-xl text-[#233636]">No orders found</p>

          <p className="mt-2 text-sm text-[#8A8378]">
            Customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DED7C9] bg-[#F7F1E5]">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-[#DED7C9]">
                <th className="px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Order
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
                  Status
                </th>

                <th className="px-6 py-5 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedOrders.map((order) => {
                const orderId = getOrderId(order);

                return (
                  <tr
                    key={orderId}
                    className="border-b border-[#DED7C9] last:border-b-0 hover:bg-[#F3ECDF]"
                  >
                    {/* Order */}
                    <td className="px-6 py-6">
                      <Link to={`/admin/orders/${orderId}`} className="group">
                        <p className="font-serif text-lg text-[#233636] group-hover:text-[#526766]">
                          #{getOrderNumber(order)}
                        </p>

                        <p className="mt-1 text-xs text-[#8A8378]">
                          Order ID #{orderId}
                        </p>
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-6 text-sm text-[#596361]">
                      {formatDate(getOrderDate(order))}
                    </td>

                    {/* Items */}
                    <td className="px-6 py-6">
                      <p className="text-sm text-[#344444]">
                        {getItemCount(order)}
                      </p>

                      <p className="mt-1 text-xs text-[#8A8378]">
                        {getItemCount(order) === 1 ? "product" : "products"}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-6 font-serif text-base text-[#233636]">
                      {formatCurrency(getOrderTotal(order))}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-6">
                      <StatusBadge status={getOrderStatus(order)} />
                    </td>

                    {/* Action */}
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
