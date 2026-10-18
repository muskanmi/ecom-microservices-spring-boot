import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllCatalogProducts } from "../api/adminCatalogApi";
import CatalogProductTable from "../components/CatalogProductTable";

export default function CatalogManagementPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("adminToken");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAllCatalogProducts(token);
      setProducts(result);
    } catch (err) {
      if (err.message?.includes("sign in again")) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUserId");
        sessionStorage.removeItem("adminRole");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load catalog products.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () => [
      "ALL",
      ...new Set(
        products
          .map((product) => product.categoryName)
          .filter((category) => Boolean(category)),
      ),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = [
        product.name,
        product.description,
        String(product.id ?? ""),
        String(product.sellerId ?? ""),
        product.categoryName,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );

      const stock = Number(product.stock ?? 0);

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "OUT" && stock <= 0) ||
        (stockFilter === "LOW" && stock > 0 && stock <= 5) ||
        (stockFilter === "IN_STOCK" && stock > 5);

      const matchesCategory =
        categoryFilter === "ALL" || product.categoryName === categoryFilter;

      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const outOfStockCount = products.filter(
    (product) => Number(product.stock ?? 0) <= 0,
  ).length;

  const lowStockCount = products.filter((product) => {
    const stock = Number(product.stock ?? 0);
    return stock > 0 && stock <= 5;
  }).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#8B7850]">
            MARKETPLACE OPERATIONS
          </p>

          <h1 className="font-editorial text-4xl md:text-5xl">
            Catalog Oversight
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#77796F]">
            Review products, categories, seller ownership, pricing, and stock
            across the marketplace.
          </p>
        </div>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadProducts}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total products", value: products.length },
          { label: "Categories", value: categories.length - 1 },
          { label: "Low stock", value: lowStockCount },
          { label: "Out of stock", value: outOfStockCount },
        ].map((card) => (
          <div
            key={card.label}
            className="border border-[#E7E0D1] bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77796F]">
              {card.label}
            </p>
            <p className="mt-3 font-editorial text-4xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border border-[#E7E0D1] bg-[#F7F3E9] p-4">
        <TextField
          size="small"
          fullWidth
          placeholder="Search product name, ID, description, or seller ID..."
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

        <div className="grid gap-3 md:grid-cols-2">
          <TextField
            select
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            sx={{
              backgroundColor: "#FFFFFF",
              "& .MuiOutlinedInput-root": { borderRadius: "3px" },
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category === "ALL" ? "All categories" : category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Stock availability"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            sx={{
              backgroundColor: "#FFFFFF",
              "& .MuiOutlinedInput-root": { borderRadius: "3px" },
            }}
          >
            <MenuItem value="ALL">All stock levels</MenuItem>
            <MenuItem value="IN_STOCK">In stock (more than 5)</MenuItem>
            <MenuItem value="LOW">Low stock (1–5)</MenuItem>
            <MenuItem value="OUT">Out of stock</MenuItem>
          </TextField>
        </div>
      </div>

      <p className="mb-3 mt-5 text-sm text-[#77796F]">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {loading ? (
        <div className="flex min-h-52 items-center justify-center border border-[#E7E0D1] bg-white">
          <div className="flex items-center gap-3 text-sm text-[#77796F]">
            <CircularProgress size={22} sx={{ color: "#2D5B4C" }} />
            Loading catalog...
          </div>
        </div>
      ) : (
        <CatalogProductTable products={filteredProducts} />
      )}
    </div>
  );
}
