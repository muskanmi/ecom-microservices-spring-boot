import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllCustomers } from "../api/adminCustomerApi";
import CustomerTable from "../components/CustomerTable";

export default function CustomerManagementPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("adminToken");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllCustomers(token);
      setCustomers(data);
    } catch (err) {
      if (err.message?.includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) =>
      [customer.name, customer.email, String(customer.id ?? "")].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [customers, search]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Customer Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#77796F]">
            View registered customers and their account details.
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadCustomers}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="border border-[#E7E0D1] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77796F]">
            Total customers
          </p>
          <p className="mt-3 font-editorial text-4xl">{customers.length}</p>
        </div>

        <div className="border border-[#E7E0D1] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77796F]">
            Matching search
          </p>
          <p className="mt-3 font-editorial text-4xl">
            {filteredCustomers.length}
          </p>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="mt-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="mt-8 border border-[#E7E0D1] bg-[#F7F3E9] p-4">
        <TextField
          size="small"
          fullWidth
          placeholder="Search by customer name, email, or ID..."
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
            "& .MuiOutlinedInput-root": {
              borderRadius: "3px",
            },
          }}
        />
      </div>

      <p className="mb-3 mt-5 text-sm text-[#77796F]">
        Showing {filteredCustomers.length} of {customers.length} customers
      </p>

      {loading ? (
        <div className="flex min-h-52 items-center justify-center border border-[#E7E0D1] bg-white">
          <div className="flex items-center gap-3 text-sm text-[#77796F]">
            <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
            Loading customers...
          </div>
        </div>
      ) : (
        <CustomerTable customers={filteredCustomers} />
      )}
    </div>
  );
}
