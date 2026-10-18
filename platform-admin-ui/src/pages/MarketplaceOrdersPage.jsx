import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../api/adminOrderApi";
import OrderTable from "../components/OrderTable";

export default function MarketplaceOrdersPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAllOrders(token);
      setOrders(result);
    } catch (err) {
      if (err.message?.includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = [
        order.orderNumber,
        order.customerEmail,
        String(order.id ?? ""),
        String(order.userId ?? ""),
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        String(order.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders
    .filter(
      (order) => String(order.paymentStatus || "").toUpperCase() === "PAID",
    )
    .reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);

  const statuses = [
    "ALL",
    ...new Set(
      orders
        .map((order) => String(order.status || "").toUpperCase())
        .filter(Boolean),
    ),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Marketplace Orders
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#77796F]">
            Monitor orders across the entire marketplace.
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadOrders}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total orders", value: orders.length },
          {
            label: "Paid orders",
            value: orders.filter(
              (order) =>
                String(order.paymentStatus || "").toUpperCase() === "PAID",
            ).length,
          },
          {
            label: "Paid order value",
            value: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            }).format(totalRevenue),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="border border-[#E7E0D1] bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77796F]">
              {card.label}
            </p>
            <p className="mt-3 break-words font-editorial text-3xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border border-[#E7E0D1] bg-[#F7F3E9] p-4 lg:flex-row">
        <TextField
          size="small"
          fullWidth
          placeholder="Search order number, customer email, or ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <SearchOutlined
                fontSize="small"
                sx={{ mr: 1, color: "#77796F" }}
              />
            ),
          }}
          sx={{
            backgroundColor: "#FFFFFF",
            "& .MuiOutlinedInput-root": { borderRadius: "3px" },
          }}
        />

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "contained" : "outlined"}
              onClick={() => setStatusFilter(status)}
              sx={{
                minWidth: "auto",
                borderRadius: "3px",
                borderColor: "#D9D0BE",
                backgroundColor:
                  statusFilter === status ? "#233636" : "transparent",
                color: statusFilter === status ? "#FFFFFF" : "#4D5B56",
                fontSize: 11,
                "&:hover": {
                  backgroundColor:
                    statusFilter === status ? "#304744" : "#EEE8DC",
                },
              }}
            >
              {status.replaceAll("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <p className="mb-3 mt-5 text-sm text-[#77796F]">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {loading ? (
        <div className="flex min-h-52 items-center justify-center border border-[#E7E0D1] bg-white">
          <div className="flex items-center gap-3 text-sm text-[#77796F]">
            <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
            Loading marketplace orders...
          </div>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onViewOrder={(order) => navigate(`/orders/${order.id}`)}
        />
      )}
    </div>
  );
}
