import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Avatar, CircularProgress, Divider, Paper } from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  ArrowForward,
  GroupsOutlined,
  Inventory2Outlined,
  RefreshOutlined,
  ShoppingBagOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";

const API_URL = import.meta.env.VITE_API_URL;

const dashboardCards = [
  {
    title: "Seller Management",
    description: "Review seller applications and manage onboarding.",
    icon: <GroupsOutlined />,
    path: "/sellers",
    status: "Manage sellers",
  },
  {
    title: "Customer Management",
    description: "View registered customers and account details.",
    icon: <AdminPanelSettingsOutlined />,
    path: "/customers",
    status: "View customers",
  },
  {
    title: "Marketplace Orders",
    description: "Monitor orders, payments, and marketplace activity.",
    icon: <ShoppingBagOutlined />,
    path: "/orders",
    status: "View orders",
  },
  {
    title: "Catalog Oversight",
    description: "Review products, pricing, categories, and stock.",
    icon: <Inventory2Outlined />,
    path: "/catalog",
    status: "Review catalog",
  },
];

async function fetchAdminData(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("ADMIN_SESSION_EXPIRED");
  }

  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(`Unexpected response from ${path}`);
  }

  return data;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

function StatusBadge({ value }) {
  const status = String(value || "UNKNOWN").toUpperCase();

  let colorClass = "border-[#D9D0BE] text-[#6C6C61]";

  if (["APPROVED", "DELIVERED", "PAID"].includes(status)) {
    colorClass = "border-[#B8D7C0] bg-[#EDF6EF] text-[#34744A]";
  } else if (["PENDING", "PENDING_PAYMENT"].includes(status)) {
    colorClass = "border-[#E7D6A7] bg-[#FBF5E5] text-[#8B6C22]";
  } else if (["REJECTED", "CANCELLED", "FAILED", "REFUNDED"].includes(status)) {
    colorClass = "border-[#E8C2BB] bg-[#FCF0ED] text-[#A7473B]";
  } else if (["SHIPPED", "OUT_FOR_DELIVERY", "CONFIRMED"].includes(status)) {
    colorClass = "border-[#C5D7E8] bg-[#EEF4FA] text-[#3B6387]";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${colorClass}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function SectionLoading() {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-[#77796F]">
      <CircularProgress size={19} sx={{ color: "#2D5B4C" }} />
      Loading section...
    </div>
  );
}

function SectionError({ message }) {
  return (
    <div className="p-5 text-sm text-[#A7473B]">
      {message || "Unable to load this section."}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    sellers: { data: [], loading: true, error: "" },
    customers: { data: [], loading: true, error: "" },
    orders: { data: [], loading: true, error: "" },
    products: { data: [], loading: true, error: "" },
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      sessionStorage.removeItem("adminUserId");
      sessionStorage.removeItem("adminRole");
      navigate("/login", { replace: true });
      return;
    }

    setRefreshing(true);

    const endpoints = [
      {
        key: "sellers",
        path: "/api/admin/sellers",
        label: "Seller applications",
      },
      {
        key: "customers",
        path: "/api/admin/customers",
        label: "Customers",
      },
      {
        key: "orders",
        path: "/api/admin/orders",
        label: "Orders",
      },
      {
        key: "products",
        path: "/api/admin/catalog/products",
        label: "Products",
      },
    ];

    // Keep previously loaded data visible while refreshing.
    setMetrics((previous) => {
      const next = { ...previous };

      endpoints.forEach(({ key }) => {
        next[key] = {
          ...previous[key],
          loading: true,
          error: "",
        };
      });

      return next;
    });

    // Each endpoint updates its own section independently.
    await Promise.all(
      endpoints.map(async ({ key, path, label }) => {
        try {
          const data = await fetchAdminData(path, token);

          setMetrics((previous) => ({
            ...previous,
            [key]: {
              data,
              loading: false,
              error: "",
            },
          }));
        } catch (error) {
          if (error.message === "ADMIN_SESSION_EXPIRED") {
            sessionStorage.removeItem("adminToken");
            sessionStorage.removeItem("adminUserId");
            sessionStorage.removeItem("adminRole");
            navigate("/login", { replace: true });
            return;
          }

          setMetrics((previous) => ({
            ...previous,
            [key]: {
              ...previous[key],
              loading: false,
              error: `Unable to load ${label.toLowerCase()}.`,
            },
          }));
        }
      }),
    );

    setRefreshing(false);
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const sellers = metrics.sellers.data;
  const customers = metrics.customers.data;
  const orders = metrics.orders.data;
  const products = metrics.products.data;

  const pendingSellers = sellers.filter(
    (seller) => String(seller.approvalStatus || "").toUpperCase() === "PENDING",
  );

  const approvedSellers = sellers.filter(
    (seller) =>
      String(seller.approvalStatus || "").toUpperCase() === "APPROVED",
  );

  const rejectedSellers = sellers.filter(
    (seller) =>
      String(seller.approvalStatus || "").toUpperCase() === "REJECTED",
  );

  const paidOrders = orders.filter(
    (order) => String(order.paymentStatus || "").toUpperCase() === "PAID",
  );

  const paidOrderValue = paidOrders.reduce(
    (total, order) => total + (Number(order.totalAmount) || 0),
    0,
  );

  const outOfStockCount = products.filter(
    (product) => Number(product.stock ?? 0) <= 0,
  ).length;

  const overviewCards = [
    {
      label: "Total sellers",
      metric: metrics.sellers,
      value: sellers.length,
      detail: `${pendingSellers.length} pending review`,
      path: "/sellers",
    },
    {
      label: "Total customers",
      metric: metrics.customers,
      value: customers.length,
      detail: "Registered customer accounts",
      path: "/customers",
    },
    {
      label: "Total orders",
      metric: metrics.orders,
      value: orders.length,
      detail: `${paidOrders.length} paid orders`,
      path: "/orders",
    },
    {
      label: "Paid order value",
      metric: metrics.orders,
      value: formatCurrency(paidOrderValue),
      detail: "Orders marked PAID",
      path: "/orders",
    },
    {
      label: "Total products",
      metric: metrics.products,
      value: products.length,
      detail: `${outOfStockCount} out of stock`,
      path: "/catalog",
    },
    {
      label: "Pending sellers",
      metric: metrics.sellers,
      value: pendingSellers.length,
      detail: `${approvedSellers.length} approved · ${rejectedSellers.length} rejected`,
      path: "/sellers",
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            PLATFORM OVERVIEW
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Welcome, Administrator.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#73776E]">
            Monitor seller onboarding, customers, orders, and catalog activity
            from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={refreshing}
          className="inline-flex items-center gap-2 border border-[#BEB7A6] px-4 py-2.5 text-sm text-[#233636] hover:bg-[#F3EFE3] disabled:opacity-50"
        >
          {refreshing ? (
            <CircularProgress size={16} />
          ) : (
            <RefreshOutlined fontSize="small" />
          )}
          Refresh overview
        </button>
      </div>

      <Alert
        icon={<VerifiedUserOutlined />}
        severity="success"
        className="mt-7"
      >
        Admin authentication and dashboard authorization verified.
      </Alert>

      <div className="mt-8">
        <h2 className="font-editorial text-2xl">Marketplace overview</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card) => (
            <Link
              key={card.label}
              to={card.path}
              className="block focus-visible:outline-2 focus-visible:outline-[#2D5B4C]"
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #E7E0D1",
                  borderRadius: "4px",
                  padding: "20px",
                  "&:hover": { backgroundColor: "#FFFEFA" },
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#77796F]">
                  {card.label}
                </p>

                {card.metric.loading && card.metric.data.length === 0 ? (
                  <div className="mt-4">
                    <CircularProgress size={19} />
                  </div>
                ) : card.metric.error && card.metric.data.length === 0 ? (
                  <p className="mt-4 text-sm text-[#A7473B]">Unavailable</p>
                ) : (
                  <div className="mt-3 break-words font-editorial text-3xl text-[#2D3A3A]">
                    {card.value}
                  </div>
                )}

                <p className="mt-2 text-xs text-[#77796F]">
                  {card.metric.error
                    ? "Data could not be refreshed"
                    : card.detail}
                </p>
              </Paper>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid items-start gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <section className="border border-[#E7E0D1] bg-white">
          <div className="flex items-center justify-between border-b border-[#E7E0D1] px-5 py-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#8B7850]">
                MARKETPLACE ACTIVITY
              </p>
              <h2 className="mt-2 font-editorial text-2xl">Recent orders</h2>
            </div>

            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B7850] hover:text-[#233636]"
            >
              View all <ArrowForward fontSize="small" />
            </Link>
          </div>

          {metrics.orders.loading && orders.length === 0 ? (
            <SectionLoading />
          ) : metrics.orders.error && orders.length === 0 ? (
            <SectionError message={metrics.orders.error} />
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-[#77796F]">
              No orders have been placed yet.
            </p>
          ) : (
            <div className="divide-y divide-[#EEE8DC]">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2D3A3A]">
                      {order.orderNumber || `Order #${order.id}`}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#77796F]">
                      {order.customerEmail ||
                        `Customer ID: ${order.userId ?? "—"}`}
                    </p>
                    <p className="mt-1 text-xs text-[#77796F]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-semibold text-[#2D3A3A]">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <StatusBadge value={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending seller applications */}
        <section className="border border-[#E7E0D1] bg-white">
          <div className="flex items-center justify-between border-b border-[#E7E0D1] px-5 py-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#8B7850]">
                SELLER ONBOARDING
              </p>
              <h2 className="mt-2 font-editorial text-2xl">
                Pending applications
              </h2>
            </div>

            <Link
              to="/sellers"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B7850] hover:text-[#233636]"
            >
              Manage <ArrowForward fontSize="small" />
            </Link>
          </div>

          {metrics.sellers.loading && sellers.length === 0 ? (
            <SectionLoading />
          ) : metrics.sellers.error && sellers.length === 0 ? (
            <SectionError message={metrics.sellers.error} />
          ) : pendingSellers.length === 0 ? (
            <div className="p-6">
              <p className="text-sm font-medium text-[#2D3A3A]">
                No pending applications
              </p>
              <p className="mt-2 text-sm text-[#77796F]">
                All currently listed seller applications have been reviewed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEE8DC]">
              {pendingSellers.slice(0, 5).map((seller) => (
                <div
                  key={seller.sellerProfileId ?? seller.userId}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#F3EFE3",
                        color: "#2D3A3A",
                      }}
                    >
                      {(seller.name || seller.shopName || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2D3A3A]">
                        {seller.shopName || seller.name || "Unnamed seller"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#77796F]">
                        {seller.email || "No email available"}
                      </p>
                      <p className="mt-1 text-xs text-[#77796F]">
                        Applied {formatDate(seller.createdAt)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge value={seller.approvalStatus} />
                </div>
              ))}

              {pendingSellers.length > 5 && (
                <Link
                  to="/sellers"
                  className="block px-5 py-4 text-sm font-medium text-[#8B7850] hover:bg-[#FFFCF7]"
                >
                  View all {pendingSellers.length} pending applications
                  <ArrowForward
                    fontSize="small"
                    className="ml-2 align-middle"
                  />
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="mt-10">
        <p className="text-xs font-bold tracking-[0.2em] text-[#8B7850]">
          ADMIN WORKSPACE
        </p>
        <h2 className="mt-2 font-editorial text-3xl">Marketplace operations</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className="block focus-visible:outline-2 focus-visible:outline-[#2D5B4C]"
            >
              <Paper
                elevation={0}
                className="h-full border border-[#E7E0D1] bg-white p-6 transition-colors hover:bg-[#FFFEFA]"
                sx={{ borderRadius: "4px" }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: "#F3EFE3",
                    color: "#2D3A3A",
                    width: 46,
                    height: 46,
                  }}
                >
                  {item.icon}
                </Avatar>

                <h3 className="mt-5 font-editorial text-2xl">{item.title}</h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-[#77796F]">
                  {item.description}
                </p>

                <Divider sx={{ my: 2, borderColor: "#E7E0D1" }} />

                <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8B7850]">
                  {item.status}
                  <ArrowForward fontSize="small" />
                </span>
              </Paper>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-10 text-xs text-[#8A8A80]">
        Marketplace Platform Admin · User ID{" "}
        {sessionStorage.getItem("adminUserId") || "—"}
      </p>
    </div>
  );
}
