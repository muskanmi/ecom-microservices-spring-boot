import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ProductImage from "../components/ProductImage";

import {
  getOrder,
  updateOrderStatus,
  updateShippingInfo,
  updatePaymentStatus,
} from "../services/orderApi";

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

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProductImage(item) {
  return (
    item?.product?.images?.[0]?.imageUrl ||
    item?.images?.[0]?.imageUrl ||
    item?.productImage ||
    item?.imageUrl ||
    null
  );
}

function getItemProductId(item) {
  return item?.productId ?? item?.product?.id ?? item?.id;
}

function getItemName(item) {
  return item?.productName || item?.name || item?.product?.name || "Product";
}

function getItemQuantity(item) {
  return Number(item?.quantity ?? item?.qty ?? 1);
}

function getItemPrice(item) {
  return Number(item?.unitPrice ?? item?.price ?? item?.product?.price ?? 0);
}

function getOrderStatus(order) {
  return order?.status || "PENDING_PAYMENT";
}

function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case "CONFIRMED":
      return "SHIPPED";

    case "SHIPPED":
      return "OUT_FOR_DELIVERY";

    case "OUT_FOR_DELIVERY":
      return "DELIVERED";

    default:
      return null;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pending Payment";

    case "CONFIRMED":
      return "Confirmed";

    case "SHIPPED":
      return "Shipped";

    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";

    case "DELIVERED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    default:
      return String(status || "Unknown")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
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

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingShipping, setSavingShipping] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState("PENDING_PAYMENT");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    carrier: "",
    trackingNumber: "",
    expectedDeliveryDate: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await getOrder(orderId);

        if (!mounted) {
          return;
        }

        const data = response.data;

        setOrder(data);

        setStatus(data?.status || "PENDING_PAYMENT");

        setPaymentStatus(data?.paymentStatus || "PENDING");

        const address = data?.shippingAddress || {};

        setShipping({
          name: address?.name || address?.fullName || "",
          phone: address?.phone || address?.phoneNumber || "",
          addressLine1:
            address?.addressLine1 || address?.line1 || address?.address || "",
          addressLine2: address?.addressLine2 || address?.line2 || "",
          city: address?.city || "",
          state: address?.state || "",
          postalCode:
            address?.postalCode || address?.pincode || address?.zipCode || "",
          country: address?.country || "India",
          carrier: data?.carrier || "",
          trackingNumber: data?.trackingNumber || "",
          expectedDeliveryDate: data?.expectedDeliveryDate
            ? String(data.expectedDeliveryDate).substring(0, 10)
            : "",
        });
      } catch (err) {
        console.error("Failed to load order:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message || "Unable to load order details.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  function handleShippingChange(event) {
    const { name, value } = event.target;

    setShipping((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleShippingSave(event) {
    event.preventDefault();

    try {
      setSavingShipping(true);
      setError("");
      setSuccess("");

      const payload = {
        name: shipping.name,
        phone: shipping.phone,
        addressLine1: shipping.addressLine1,
        addressLine2: shipping.addressLine2,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country,
        carrier: shipping.carrier,
        trackingNumber: shipping.trackingNumber,
        expectedDeliveryDate: shipping.expectedDeliveryDate || null,
      };

      const response = await updateShippingInfo(orderId, payload);

      setOrder(response.data);

      setSuccess("Shipping information updated successfully.");
    } catch (err) {
      console.error("Failed to update shipping:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update shipping information.",
      );
    } finally {
      setSavingShipping(false);
    }
  }

  async function handleStatusUpdate() {
    const currentStatus = getOrderStatus(order);
    const nextStatus = getNextStatus(currentStatus);

    if (!nextStatus) {
      setError(
        `No further status update is available for ${getStatusLabel(
          currentStatus,
        )}.`,
      );

      return;
    }

    try {
      setSavingStatus(true);
      setError("");
      setSuccess("");

      const response = await updateOrderStatus(orderId, nextStatus);

      const updatedOrder = response.data;

      setOrder(updatedOrder);

      setStatus(updatedOrder?.status || nextStatus);

      setSuccess(
        `Order status updated to ${getStatusLabel(
          updatedOrder?.status || nextStatus,
        )}.`,
      );
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update order status.",
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function handlePaymentStatusUpdate() {
    if (!paymentStatus) {
      setError("Please select a payment status.");
      return;
    }

    try {
      setSavingPayment(true);
      setError("");
      setSuccess("");

      const response = await updatePaymentStatus(orderId, paymentStatus);

      const updatedOrder = response.data;

      setOrder(updatedOrder);

      setPaymentStatus(updatedOrder?.paymentStatus || paymentStatus);

      setSuccess(
        `Payment status updated to ${
          updatedOrder?.paymentStatus || paymentStatus
        }.`,
      );
    } catch (err) {
      console.error("Failed to update payment status:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update payment status.",
      );
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="h-[40px] w-[250px] animate-pulse bg-[#F7F1E5]" />

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-[450px] animate-pulse border border-[#DED7C9] bg-[#F7F1E5] xl:col-span-2" />

          <div className="h-[450px] animate-pulse border border-[#DED7C9] bg-[#F7F1E5]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="border border-[#E5C6C0] bg-[#FBF0EE] px-6 py-10 text-center">
          <p className="font-serif text-xl text-[#985F55]">Order not found</p>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mt-5 bg-[#2D3A3A] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const currentStatus = getOrderStatus(order);

  const shippingAddress = order.shippingAddress || {};

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Back */}
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6F766F] hover:text-[#233636]"
      >
        ← Back to Orders
      </Link>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Orders / Details
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">
            Order #{order.orderNumber || order.id}
          </h1>

          <p className="mt-3 text-sm text-[#6F766F]">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <StatusBadge status={currentStatus} />
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-6 border border-[#E5C6C0] bg-[#FBF0EE] px-5 py-4 text-sm text-[#985F55]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 border border-[#C9DCCB] bg-[#EEF5EE] px-5 py-4 text-sm text-[#55745A]">
          {success}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 xl:col-span-2">
          {/* Products */}
          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Order Items
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Products
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-[#8A8378]">
                  No items found for this order.
                </p>
              </div>
            ) : (
              <div>
                {items.map((item, index) => {
                  const productId = getItemProductId(item);

                  const quantity = getItemQuantity(item);

                  const unitPrice = getItemPrice(item);

                  return (
                    <div
                      key={`${productId}-${index}`}
                      className="flex flex-col gap-5 border-b border-[#DED7C9] px-6 py-6 last:border-b-0 sm:flex-row sm:items-center"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden border border-[#DED7C9] bg-white">
                        <ProductImage
                          imageUrl={getProductImage(item)}
                          alt={getItemName(item)}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-xl text-[#233636]">
                          {getItemName(item)}
                        </p>

                        {productId && (
                          <Link
                            to={`/admin/products/${productId}`}
                            className="mt-1 inline-block text-xs text-[#8A8378] hover:text-[#233636]"
                          >
                            Product ID #{productId}
                          </Link>
                        )}

                        <div className="mt-5 flex gap-10">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                              Quantity
                            </p>

                            <p className="mt-2 text-sm text-[#344444]">
                              {quantity}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                              Unit Price
                            </p>

                            <p className="mt-2 text-sm text-[#344444]">
                              {formatCurrency(unitPrice)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                          Total
                        </p>

                        <p className="mt-2 font-serif text-xl text-[#233636]">
                          {formatCurrency(unitPrice * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Shipping */}
          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Fulfilment
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Shipping Information
              </h2>
            </div>

            <form onSubmit={handleShippingSave} className="p-6">
              <div className="grid grid-cols-1 gap-px border border-[#DED7C9] bg-[#DED7C9] md:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  value={shipping.name}
                  onChange={handleShippingChange}
                  placeholder="Customer Name"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="phone"
                  value={shipping.phone}
                  onChange={handleShippingChange}
                  placeholder="Phone Number"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="addressLine1"
                  value={shipping.addressLine1}
                  onChange={handleShippingChange}
                  placeholder="Address Line 1"
                  className="md:col-span-2 border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="addressLine2"
                  value={shipping.addressLine2}
                  onChange={handleShippingChange}
                  placeholder="Address Line 2"
                  className="md:col-span-2 border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="city"
                  value={shipping.city}
                  onChange={handleShippingChange}
                  placeholder="City"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="state"
                  value={shipping.state}
                  onChange={handleShippingChange}
                  placeholder="State"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="postalCode"
                  value={shipping.postalCode}
                  onChange={handleShippingChange}
                  placeholder="Postal Code"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="country"
                  value={shipping.country}
                  onChange={handleShippingChange}
                  placeholder="Country"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="carrier"
                  value={shipping.carrier}
                  onChange={handleShippingChange}
                  placeholder="Carrier"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <input
                  type="text"
                  name="trackingNumber"
                  value={shipping.trackingNumber}
                  onChange={handleShippingChange}
                  placeholder="Tracking Number"
                  className="border-0 bg-[#FBF8F0] px-4 py-4 text-sm text-[#344444] outline-none placeholder:text-[#9A968D]"
                />

                <div className="bg-[#FBF8F0] px-4 py-3">
                  <label className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A8378]">
                    Expected Delivery
                  </label>

                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={shipping.expectedDeliveryDate}
                    onChange={handleShippingChange}
                    className="w-full border-0 bg-transparent text-sm text-[#344444] outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={savingShipping}
                  className="bg-[#2D3A3A] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#233030] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingShipping ? "Saving..." : "Save Shipping"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Order information */}
          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Order Information
              </h2>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Order ID
                </span>

                <span className="text-sm text-[#344444]">#{order.id}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#DED7C9] px-6 py-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Customer
                </span>

                <span className="max-w-[180px] truncate text-right text-sm text-[#344444]">
                  {order.customerEmail || `User #${order.userId}`}
                </span>
              </div>

              <div className="border-b border-[#DED7C9] px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                    Payment Status
                  </span>

                  <StatusBadge status={paymentStatus} />
                </div>

                <div className="mt-4">
                  <select
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value)}
                    className="w-full border border-[#DED7C9] bg-[#FBF8F0] px-4 py-3 text-sm text-[#344444] outline-none focus:border-[#2D3A3A]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>

                  <button
                    type="button"
                    onClick={handlePaymentStatusUpdate}
                    disabled={savingPayment}
                    className="mt-3 w-full bg-[#2D3A3A] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#233030] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingPayment ? "Updating..." : "Update Payment Status"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Order Status
                </span>

                <StatusBadge status={currentStatus} />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Summary
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Pricing
              </h2>
            </div>

            <div>
              <div className="flex justify-between border-b border-[#DED7C9] px-6 py-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Subtotal
                </span>

                <span className="text-sm text-[#344444]">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#DED7C9] px-6 py-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Discount
                </span>

                <span className="text-sm text-[#344444]">
                  {formatCurrency(order.discount)}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#DED7C9] px-6 py-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Shipping
                </span>

                <span className="text-sm text-[#344444]">
                  {formatCurrency(order.shippingFee)}
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-6">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                  Total
                </span>

                <span className="font-serif text-2xl text-[#233636]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Update status */}
          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Fulfilment
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Update Status
              </h2>
            </div>

            <div className="p-6">
              {(() => {
                const nextStatus = getNextStatus(currentStatus);

                return (
                  <>
                    {/* Current status */}
                    <div className="border border-[#DED7C9] bg-[#FBF8F0] px-4 py-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A8378]">
                        Current Status
                      </p>

                      <p className="mt-2 text-sm font-medium text-[#344444]">
                        {getStatusLabel(currentStatus)}
                      </p>
                    </div>

                    {/* Next status */}
                    {nextStatus && (
                      <>
                        <div className="my-4 flex items-center justify-center text-[#9A968D]">
                          ↓
                        </div>

                        <div className="border border-[#C9DCCB] bg-[#EEF5EE] px-4 py-4">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#55745A]">
                            Next Status
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#344444]">
                            {getStatusLabel(nextStatus)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleStatusUpdate}
                          disabled={savingStatus}
                          className="mt-4 w-full bg-[#2D3A3A] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#233030] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingStatus
                            ? "Updating..."
                            : `Mark as ${getStatusLabel(nextStatus)}`}
                        </button>
                      </>
                    )}

                    {/* No further transition */}
                    {!nextStatus && currentStatus === "DELIVERED" && (
                      <div className="border border-[#C9DCCB] bg-[#EEF5EE] px-4 py-5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#55745A]">
                          Completed
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#596361]">
                          This order has been delivered successfully. No further
                          status updates are available.
                        </p>
                      </div>
                    )}

                    {!nextStatus && currentStatus === "CANCELLED" && (
                      <div className="border border-[#E5C6C0] bg-[#FBF0EE] px-4 py-5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#985F55]">
                          Cancelled
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#596361]">
                          This order has been cancelled. No further status
                          updates are available.
                        </p>
                      </div>
                    )}

                    {!nextStatus &&
                      currentStatus !== "DELIVERED" &&
                      currentStatus !== "CANCELLED" && (
                        <div className="border border-[#E6D7B8] bg-[#F9F3E5] px-4 py-5">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8A744B]">
                            Waiting
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#596361]">
                            This order cannot be advanced yet. Complete the
                            required payment or fulfilment step first.
                          </p>
                        </div>
                      )}
                  </>
                );
              })()}
            </div>
          </section>

          {/* Existing shipping address */}
          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Delivery
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Current Address
              </h2>
            </div>

            <div className="px-6 py-6 text-sm leading-7 text-[#596361]">
              {shippingAddress?.name && <p>{shippingAddress.name}</p>}

              {shippingAddress?.addressLine1 && (
                <p>{shippingAddress.addressLine1}</p>
              )}

              {shippingAddress?.addressLine2 && (
                <p>{shippingAddress.addressLine2}</p>
              )}

              {(shippingAddress?.city ||
                shippingAddress?.state ||
                shippingAddress?.postalCode) && (
                <p>
                  {shippingAddress.city}
                  {shippingAddress.city && shippingAddress.state ? ", " : ""}
                  {shippingAddress.state}
                  {shippingAddress.postalCode
                    ? ` - ${shippingAddress.postalCode}`
                    : ""}
                </p>
              )}

              {shippingAddress?.country && <p>{shippingAddress.country}</p>}

              {shippingAddress?.phone && (
                <p className="mt-3">{shippingAddress.phone}</p>
              )}

              {!shippingAddress?.name &&
                !shippingAddress?.addressLine1 &&
                !shippingAddress?.city && (
                  <p className="text-[#8A8378]">
                    No shipping address available.
                  </p>
                )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
