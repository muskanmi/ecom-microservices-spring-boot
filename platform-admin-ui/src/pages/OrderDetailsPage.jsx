import { useCallback, useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Divider } from "@mui/material";
import {
  ArrowBackOutlined,
  RefreshOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getOrderById,
  updateOrderStatus,
  updateShippingInfo,
} from "../api/adminOrderApi";

const STATUS_TRANSITIONS = {
  CONFIRMED: ["SHIPPED"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

function formatCurrency(value) {
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

const inputClassName =
  "w-full rounded-sm border border-[#D9D0BE] bg-white px-3 py-3 text-sm text-[#2D3A3A] outline-none focus:border-[#2D5B4C] disabled:cursor-not-allowed disabled:bg-[#F7F3EA] disabled:opacity-70";

function ShippingField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  min,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#77796F]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        required
        maxLength={type === "text" ? 100 : undefined}
        className={inputClassName}
      />
    </div>
  );
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    carrier: "",
    trackingNumber: "",
    expectedDeliveryDate: "",
  });
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [shippingError, setShippingError] = useState("");

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUserId");
    sessionStorage.removeItem("adminRole");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadOrder = useCallback(async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      clearAdminSession();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getOrderById(token, orderId);

      setOrder(result);
      setSelectedStatus("");

      setShippingInfo({
        carrier: result.carrier || "",
        trackingNumber: result.trackingNumber || "",
        expectedDeliveryDate: result.expectedDeliveryDate
          ? String(result.expectedDeliveryDate).slice(0, 10)
          : "",
      });
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        clearAdminSession();
        return;
      }

      setError(err.message || "Unable to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId, clearAdminSession]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  function handleShippingChange(event) {
    const { name, value } = event.target;

    setShippingInfo((previous) => ({
      ...previous,
      [name]: value,
    }));

    setShippingError("");
    setShippingMessage("");
  }

  async function handleStatusUpdate() {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      clearAdminSession();
      return;
    }

    if (!order?.id || !selectedStatus) {
      setStatusError("Please select a new order status.");
      return;
    }

    try {
      setStatusSaving(true);
      setStatusMessage("");
      setStatusError("");

      await updateOrderStatus(token, order.id, selectedStatus);

      setStatusMessage("Order status updated successfully.");
      await loadOrder();
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        clearAdminSession();
        return;
      }

      setStatusError(err.message || "Unable to update order status.");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleShippingSubmit(event) {
    event.preventDefault();

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      clearAdminSession();
      return;
    }

    if (!order?.id) {
      setShippingError("Order details are unavailable.");
      return;
    }

    const { carrier, trackingNumber, expectedDeliveryDate } = shippingInfo;

    if (!carrier.trim() || !trackingNumber.trim() || !expectedDeliveryDate) {
      setShippingError("Please complete all shipping fields.");
      return;
    }

    if (carrier.trim().length > 100 || trackingNumber.trim().length > 100) {
      setShippingError(
        "Carrier and tracking number must not exceed 100 characters.",
      );
      return;
    }

    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (expectedDeliveryDate < localToday) {
      setShippingError("Expected delivery date cannot be in the past.");
      return;
    }

    try {
      setShippingSaving(true);
      setShippingMessage("");
      setShippingError("");

      await updateShippingInfo(token, order.id, {
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
        expectedDeliveryDate,
      });

      setShippingMessage("Shipping information saved successfully.");

      await loadOrder();
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        clearAdminSession();
        return;
      }

      setShippingError(err.message || "Unable to save shipping information.");
    } finally {
      setShippingSaving(false);
    }
  }

  const address = order?.shippingAddress;
  const items = Array.isArray(order?.items) ? order.items : [];
  const currentStatus = String(order?.status || "").toUpperCase();
  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  const shippingEditable =
    currentStatus !== "CANCELLED" &&
    currentStatus !== "DELIVERED" &&
    String(order?.paymentStatus || "").toUpperCase() === "PAID";

  const today = new Date();
  const minimumDeliveryDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <div>
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#8B7850] hover:text-[#233636]"
      >
        <ArrowBackOutlined fontSize="small" />
        Back to Marketplace Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">Order Details</h1>

          <p className="mt-3 text-sm text-[#77796F]">Order ID: {orderId}</p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadOrder}
          disabled={loading || statusSaving || shippingSaving}
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
          Loading order details...
        </div>
      ) : order ? (
        <>
          {/* Order overview */}
          <section className="mt-8 border border-[#E7E0D1] bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#77796F]">
                  Order number
                </p>

                <h2 className="mt-2 font-editorial text-3xl">
                  {order.orderNumber || `Order #${order.id}`}
                </h2>

                <p className="mt-2 text-sm text-[#77796F]">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="border border-[#D9D0BE] px-3 py-2 text-xs font-semibold uppercase">
                  {String(order.status || "UNKNOWN").replaceAll("_", " ")}
                </span>

                <span className="border border-[#D9D0BE] px-3 py-2 text-xs font-semibold uppercase">
                  Payment:{" "}
                  {String(order.paymentStatus || "UNKNOWN").replaceAll(
                    "_",
                    " ",
                  )}
                </span>
              </div>
            </div>

            <Divider sx={{ my: 3, borderColor: "#E7E0D1" }} />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <Detail label="Order ID" value={order.id} />
              <Detail label="Customer ID" value={order.userId} />
              <Detail label="Customer email" value={order.customerEmail} />
              <Detail
                label="Last updated"
                value={formatDate(order.updatedAt)}
              />
            </div>
          </section>

          {/* Order management */}
          <section className="mt-6 border border-[#E7E0D1] bg-white p-5 md:p-6">
            <h2 className="font-editorial text-2xl">Order management</h2>

            <p className="mt-2 text-sm text-[#77796F]">
              Update the fulfillment status of this order.
            </p>

            {statusMessage && (
              <Alert
                severity="success"
                className="mt-4"
                onClose={() => setStatusMessage("")}
              >
                {statusMessage}
              </Alert>
            )}

            {statusError && (
              <Alert
                severity="error"
                className="mt-4"
                onClose={() => setStatusError("")}
              >
                {statusError}
              </Alert>
            )}

            <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-sm">
                <label
                  htmlFor="order-status"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#77796F]"
                >
                  New order status
                </label>

                <select
                  id="order-status"
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value);
                    setStatusError("");
                    setStatusMessage("");
                  }}
                  disabled={
                    statusSaving ||
                    shippingSaving ||
                    loading ||
                    availableStatuses.length === 0
                  }
                  className={inputClassName}
                >
                  <option value="">Select new status</option>

                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="contained"
                onClick={handleStatusUpdate}
                disabled={
                  !selectedStatus || statusSaving || shippingSaving || loading
                }
                startIcon={
                  statusSaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{
                  backgroundColor: "#233636",
                  color: "#FFFFFF",
                  borderRadius: "3px",
                  textTransform: "none",
                  minHeight: "44px",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#2D5B4C",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#D9D0BE",
                    color: "#77796F",
                  },
                }}
              >
                {statusSaving ? "Updating..." : "Update Status"}
              </Button>
            </div>

            {availableStatuses.length === 0 && (
              <p className="mt-3 text-xs text-[#77796F]">
                No further fulfillment status transitions are configured for
                this order's current status.
              </p>
            )}
          </section>

          {/* Shipping information form */}
          <section className="mt-6 border border-[#E7E0D1] bg-white p-5 md:p-6">
            <div>
              <h2 className="font-editorial text-2xl">Shipping information</h2>
              <p className="mt-2 text-sm text-[#77796F]">
                Manage the carrier, tracking number, and expected delivery date.
              </p>
            </div>

            {shippingMessage && (
              <Alert
                severity="success"
                className="mt-4"
                onClose={() => setShippingMessage("")}
              >
                {shippingMessage}
              </Alert>
            )}

            {shippingError && (
              <Alert
                severity="error"
                className="mt-4"
                onClose={() => setShippingError("")}
              >
                {shippingError}
              </Alert>
            )}

            {!shippingEditable && (
              <Alert severity="info" className="mt-4">
                Shipping information cannot be edited for this order. The order
                must be paid and not cancelled or delivered.
              </Alert>
            )}

            <form onSubmit={handleShippingSubmit}>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <ShippingField
                  label="Carrier"
                  name="carrier"
                  value={shippingInfo.carrier}
                  onChange={handleShippingChange}
                  disabled={!shippingEditable || shippingSaving || statusSaving}
                />

                <ShippingField
                  label="Tracking number"
                  name="trackingNumber"
                  value={shippingInfo.trackingNumber}
                  onChange={handleShippingChange}
                  disabled={!shippingEditable || shippingSaving || statusSaving}
                />

                <ShippingField
                  label="Expected delivery date"
                  name="expectedDeliveryDate"
                  type="date"
                  value={shippingInfo.expectedDeliveryDate}
                  onChange={handleShippingChange}
                  min={minimumDeliveryDate}
                  disabled={!shippingEditable || shippingSaving || statusSaving}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    shippingSaving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SaveOutlined />
                    )
                  }
                  disabled={
                    !shippingEditable ||
                    shippingSaving ||
                    statusSaving ||
                    loading
                  }
                  sx={{
                    backgroundColor: "#233636",
                    color: "#FFFFFF",
                    borderRadius: "3px",
                    textTransform: "none",
                    minHeight: "44px",
                    px: 3,
                    "&:hover": {
                      backgroundColor: "#2D5B4C",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#D9D0BE",
                      color: "#77796F",
                    },
                  }}
                >
                  {shippingSaving ? "Saving..." : "Save Shipping Information"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  disabled={shippingSaving || statusSaving || loading}
                  onClick={() => {
                    setShippingInfo({
                      carrier: order.carrier || "",
                      trackingNumber: order.trackingNumber || "",
                      expectedDeliveryDate: order.expectedDeliveryDate
                        ? String(order.expectedDeliveryDate).slice(0, 10)
                        : "",
                    });
                    setShippingError("");
                    setShippingMessage("");
                  }}
                  sx={{
                    color: "#233636",
                    borderColor: "#BEB7A6",
                    borderRadius: "3px",
                    textTransform: "none",
                    minHeight: "44px",
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </section>

          {/* Order items and summary */}
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
            <section className="border border-[#E7E0D1] bg-white p-5 md:p-6 xl:col-span-2">
              <h2 className="font-editorial text-2xl">Order items</h2>

              {items.length === 0 ? (
                <p className="mt-5 text-sm text-[#77796F]">
                  No order items were returned for this order.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left">
                    <thead>
                      <tr className="border-b border-[#E7E0D1]">
                        {["Product", "Quantity", "Unit price", "Subtotal"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="pb-3 pr-4 text-xs uppercase tracking-wider text-[#77796F]"
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => {
                        const quantity = Number(item.quantity ?? 0);
                        const unitPrice = Number(
                          item.price ?? item.unitPrice ?? 0,
                        );
                        const subtotal =
                          item.subtotal != null
                            ? Number(item.subtotal)
                            : item.totalPrice != null
                              ? Number(item.totalPrice)
                              : quantity * unitPrice;

                        return (
                          <tr
                            key={
                              item.id ?? `${item.productId ?? "item"}-${index}`
                            }
                            className="border-b border-[#EEE8DC] last:border-0"
                          >
                            <td className="py-4 pr-4 text-sm font-medium text-[#2D3A3A]">
                              {item.productName ||
                                item.name ||
                                `Product ${item.productId ?? ""}`}
                            </td>
                            <td className="py-4 pr-4 text-sm">
                              {item.quantity ?? "—"}
                            </td>
                            <td className="py-4 pr-4 text-sm">
                              {formatCurrency(unitPrice)}
                            </td>
                            <td className="py-4 pr-4 text-sm font-medium">
                              {formatCurrency(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="border border-[#E7E0D1] bg-white p-5 md:p-6">
              <h2 className="font-editorial text-2xl">Order summary</h2>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-[#77796F]">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-[#77796F]">Discount</span>
                  <span>{formatCurrency(order.discount)}</span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-[#77796F]">Shipping</span>
                  <span>{formatCurrency(order.shippingFee)}</span>
                </div>

                <Divider sx={{ borderColor: "#E7E0D1" }} />

                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            {/* Delivery address */}
            <section className="border border-[#E7E0D1] bg-white p-5 md:p-6 xl:col-span-2">
              <h2 className="font-editorial text-2xl">Delivery address</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Detail
                  label="Recipient"
                  value={address?.fullName ?? address?.recipientName}
                />
                <Detail label="Phone" value={address?.phone} />
                <Detail
                  label="Address"
                  value={
                    address
                      ? [
                          address.addressLine1,
                          address.addressLine2,
                          address.city,
                          address.state,
                          address.pincode ?? address.postalCode,
                          address.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address details unavailable"
                      : "Address details unavailable"
                  }
                />
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
