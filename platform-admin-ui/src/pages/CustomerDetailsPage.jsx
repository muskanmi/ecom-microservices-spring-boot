import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ArrowBackOutlined, RefreshOutlined } from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllCustomers } from "../api/adminCustomerApi";
import { getAllOrders } from "../api/adminOrderApi";

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

export default function CustomerDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomerDetails = useCallback(async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      sessionStorage.removeItem("adminUserId");
      sessionStorage.removeItem("adminRole");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [customersData, ordersData] = await Promise.all([
        getAllCustomers(token),
        getAllOrders(token),
      ]);

      const foundCustomer = customersData.find(
        (item) => String(item.id) === String(customerId),
      );

      if (!foundCustomer) {
        setCustomer(null);
        setOrders([]);
        setError("Customer not found.");
        return;
      }

      setCustomer(foundCustomer);

      const customerOrders = ordersData.filter(
        (order) => String(order.userId) === String(foundCustomer.id),
      );

      setOrders(customerOrders);
    } catch (err) {
      if (err.message?.toLowerCase().includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load customer details.");
    } finally {
      setLoading(false);
    }
  }, [customerId, navigate]);

  useEffect(() => {
    loadCustomerDetails();
  }, [loadCustomerDetails]);

  const metrics = useMemo(() => {
    const paidOrders = orders.filter(
      (order) => String(order.paymentStatus).toUpperCase() === "PAID",
    );

    return {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      totalSpend: paidOrders.reduce(
        (total, order) => total + (Number(order.totalAmount) || 0),
        0,
      ),
    };
  }, [orders]);

  return (
    <div>
      <Link
        to="/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#8B7850] hover:text-[#233636]"
      >
        <ArrowBackOutlined fontSize="small" />
        Back to Customer Management
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Customer Details
          </h1>

          <p className="mt-3 text-sm text-[#77796F]">
            Customer ID: {customerId}
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadCustomerDetails}
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
          Loading customer details...
        </div>
      ) : customer ? (
        <>
          <section className="mt-8 border border-[#E7E0D1] bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar
                src={customer.avatarUrl || undefined}
                alt={customer.name || "Customer"}
                sx={{
                  width: 76,
                  height: 76,
                  bgcolor: "#233636",
                  color: "#E6C875",
                  fontSize: 28,
                }}
              >
                {customer.name?.charAt(0)?.toUpperCase() || "C"}
              </Avatar>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#77796F]">
                  Customer profile
                </p>
                <h2 className="mt-1 font-editorial text-3xl">
                  {customer.name || "Unnamed customer"}
                </h2>
                <p className="mt-2 break-all text-sm text-[#77796F]">
                  {customer.email || "No email available"}
                </p>
              </div>
            </div>

            <Divider sx={{ my: 3, borderColor: "#E7E0D1" }} />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <Detail label="Customer ID" value={customer.id} />
              <Detail label="Full name" value={customer.name} />
              <Detail label="Email address" value={customer.email} />
              <Detail
                label="Registered on"
                value={formatDate(customer.createdAt)}
              />
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border border-[#E7E0D1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77796F]">
                Total orders
              </p>
              <p className="mt-3 font-editorial text-4xl">
                {metrics.totalOrders}
              </p>
            </div>

            <div className="border border-[#E7E0D1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77796F]">
                Paid orders
              </p>
              <p className="mt-3 font-editorial text-4xl">
                {metrics.paidOrders}
              </p>
            </div>

            <div className="border border-[#E7E0D1] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77796F]">
                Paid order value
              </p>
              <p className="mt-3 font-editorial text-3xl">
                {formatCurrency(metrics.totalSpend)}
              </p>
            </div>
          </section>

          <section className="mt-8 border border-[#E7E0D1] bg-white p-5 md:p-6">
            <h2 className="font-editorial text-2xl">Order history</h2>
            <p className="mt-2 text-sm text-[#77796F]">
              Orders associated with this customer account.
            </p>

            {orders.length === 0 ? (
              <p className="mt-6 border border-[#EEE8DC] p-5 text-sm text-[#77796F]">
                No orders were found for this customer.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-[#E7E0D1]">
                      {[
                        "Order",
                        "Date",
                        "Total",
                        "Payment",
                        "Status",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="pb-3 pr-4 text-xs uppercase tracking-wider text-[#77796F]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[#EEE8DC] last:border-0"
                      >
                        <td className="py-4 pr-4 text-sm font-medium">
                          {order.orderNumber || `Order #${order.id}`}
                        </td>

                        <td className="py-4 pr-4 text-sm text-[#77796F]">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="py-4 pr-4 text-sm font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="py-4 pr-4 text-xs font-semibold">
                          {String(order.paymentStatus || "UNKNOWN").replaceAll(
                            "_",
                            " ",
                          )}
                        </td>

                        <td className="py-4 pr-4 text-xs font-semibold">
                          {String(order.status || "UNKNOWN").replaceAll(
                            "_",
                            " ",
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          <Button
                            component={Link}
                            to={`/orders/${order.id}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: "#233636",
                              borderColor: "#BEB7A6",
                              borderRadius: "3px",
                              textTransform: "none",
                            }}
                          >
                            View order
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
