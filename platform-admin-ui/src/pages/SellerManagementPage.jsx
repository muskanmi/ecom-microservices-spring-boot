import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllSellers, updateSellerApproval } from "../api/adminSellerApi";
import SellerTable from "../components/SellerTable";

export default function SellerManagementPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("adminToken");

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingSellerId, setUpdatingSellerId] = useState(null);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getAllSellers(token);
      setSellers(data);
    } catch (err) {
      if (err.message?.includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load sellers.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  async function handleUpdateApproval(sellerProfileId, status) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this seller?`)) {
      return;
    }

    setUpdatingSellerId(sellerProfileId);
    setError("");
    setMessage("");

    try {
      const updatedSeller = await updateSellerApproval(
        token,
        sellerProfileId,
        status,
      );

      setSellers((previous) =>
        previous.map((seller) =>
          seller.sellerProfileId === sellerProfileId
            ? { ...seller, ...updatedSeller }
            : seller,
        ),
      );

      setMessage(
        `Seller successfully ${status === "APPROVED" ? "approved" : "rejected"}.`,
      );
    } catch (err) {
      if (err.message?.includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to update seller status.");
    } finally {
      setUpdatingSellerId(null);
    }
  }

  const filteredSellers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      const matchesSearch = [
        seller.name,
        seller.email,
        seller.shopName,
        String(seller.sellerProfileId ?? ""),
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        seller.approvalStatus?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sellers, search, statusFilter]);

  const pendingCount = sellers.filter(
    (seller) => seller.approvalStatus?.toUpperCase() === "PENDING",
  ).length;

  const approvedCount = sellers.filter(
    (seller) => seller.approvalStatus?.toUpperCase() === "APPROVED",
  ).length;

  const rejectedCount = sellers.filter(
    (seller) => seller.approvalStatus?.toUpperCase() === "REJECTED",
  ).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Seller Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#77796F]">
            Review seller applications and manage marketplace onboarding.
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadSellers}
          disabled={loading || updatingSellerId !== null}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total sellers", value: sellers.length },
          { label: "Pending review", value: pendingCount },
          { label: "Approved", value: approvedCount },
          { label: "Rejected", value: rejectedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="border border-[#E7E0D1] bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77796F]">
              {item.label}
            </p>
            <p className="mt-3 font-editorial text-4xl">{item.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <Alert severity="error" className="mt-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          className="mt-6"
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      <div className="mt-8 flex flex-col gap-4 border border-[#E7E0D1] bg-[#F7F3E9] p-4 md:flex-row">
        <TextField
          size="small"
          fullWidth
          placeholder="Search seller, email, shop, or ID..."
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

        <div className="flex shrink-0 flex-wrap gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "contained" : "outlined"}
              onClick={() => setStatusFilter(status)}
              sx={{
                borderRadius: "3px",
                textTransform: "none",
                fontSize: "12px",
                backgroundColor:
                  statusFilter === status ? "#233636" : "transparent",
                color: statusFilter === status ? "#FFFFFF" : "#52605A",
                borderColor: "#D8D0BD",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    statusFilter === status ? "#2D4945" : "#EEE8DC",
                  boxShadow: "none",
                },
              }}
            >
              {status === "ALL" ? "All" : status}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-[#77796F]">
          Showing {filteredSellers.length} of {sellers.length} sellers
        </p>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="flex min-h-52 items-center justify-center border border-[#E7E0D1] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#77796F]">
              <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
              Loading sellers...
            </div>
          </div>
        ) : (
          <SellerTable
            sellers={filteredSellers}
            updatingSellerId={updatingSellerId}
            onUpdateApproval={handleUpdateApproval}
          />
        )}
      </div>
    </div>
  );
}
