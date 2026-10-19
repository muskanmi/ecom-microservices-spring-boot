import { useEffect, useState } from "react";
import { Button, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import {
  CATALOG_URL,
  updateCatalogProductActivation,
} from "../api/adminCatalogApi";

function formatPrice(value) {
  const amount = Number(value);

  if (value == null || !Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getImageUrl(image) {
  const value =
    typeof image === "string"
      ? image
      : image?.imageUrl || image?.url || image?.path || "";

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;

  return `${CATALOG_URL}/${value.replace(/^\/+/, "")}`;
}

export default function CatalogProductTable({ products }) {
  const [rows, setRows] = useState(products || []);
  const [busyIds, setBusyIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setRows(products || []);
  }, [products]);

  async function handleActivationToggle(product) {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setError("Admin session not found. Please sign in again.");
      return;
    }

    const currentActive =
      product.active === true ||
      product.active === 1 ||
      product.active === "true";

    const nextActive = !currentActive;

    setError("");
    setBusyIds((previous) => [...previous, product.id]);

    try {
      await updateCatalogProductActivation(product.id, nextActive, token);

      setRows((previous) =>
        previous.map((item) =>
          item.id === product.id ? { ...item, active: nextActive } : item,
        ),
      );
    } catch (err) {
      setError(err.message || "Could not update product status.");
    } finally {
      setBusyIds((previous) => previous.filter((id) => id !== product.id));
    }
  }

  if (!rows.length) {
    return (
      <div className="border border-[#E7E0D1] bg-white px-5 py-12 text-center">
        <h2 className="font-editorial text-2xl">No products found</h2>
        <p className="mt-2 text-sm text-[#77796F]">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto border border-[#E7E0D1] bg-white">
        <table className="w-full min-w-[1350px] border-collapse text-left">
          <thead className="bg-[#F5F0E5]">
            <tr>
              {[
                "Product",
                "Category",
                "Seller ID",
                "Price",
                "Stock",
                "Status",
                "Created",
                "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-[#E7E0D1] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((product) => {
              const images = Array.isArray(product.images)
                ? product.images
                : [];

              const imageUrl = getImageUrl(images[0]);
              const stock = Number(product.stock ?? 0);

              const isActive =
                product.active === true ||
                product.active === 1 ||
                product.active === "true";

              const isBusy = busyIds.includes(product.id);

              return (
                <tr
                  key={product.id}
                  className="border-b border-[#EEE8DC] last:border-b-0 hover:bg-[#FFFCF7]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name || "Product"}
                          loading="lazy"
                          className="h-14 w-14 shrink-0 border border-[#E7E0D1] bg-[#F7F3E9] object-cover"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#E7E0D1] bg-[#F7F3E9] text-xs text-[#77796F]">
                          No image
                        </div>
                      )}

                      <div className="max-w-xs">
                        <p className="font-medium text-[#2D3A3A]">
                          {product.name || "Unnamed product"}
                        </p>

                        <p className="mt-1 text-xs text-[#77796F]">
                          Product ID: {product.id}
                        </p>

                        {product.mrp != null && (
                          <p className="mt-1 text-xs text-[#77796F]">
                            MRP: {formatPrice(product.mrp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#5F6962]">
                    {product.categoryName || "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#5F6962]">
                    {product.sellerId ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-[#2D3A3A]">
                    {formatPrice(product.price)}
                  </td>

                  <td className="px-5 py-4">
                    <Chip
                      size="small"
                      label={stock}
                      color={
                        stock <= 0
                          ? "error"
                          : stock <= 5
                            ? "warning"
                            : "success"
                      }
                      variant="outlined"
                    />
                  </td>

                  <td className="px-5 py-4">
                    <Chip
                      size="small"
                      label={isActive ? "Active" : "Inactive"}
                      color={isActive ? "success" : "default"}
                      variant="outlined"
                    />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#77796F]">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        component={Link}
                        to={`/catalog/${product.id}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: "#233636",
                          borderColor: "#BEB7A6",
                          borderRadius: "3px",
                          textTransform: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        View Details
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        disabled={isBusy}
                        onClick={() => handleActivationToggle(product)}
                        sx={{
                          backgroundColor: isActive ? "#8C4545" : "#23685F",
                          "&:hover": {
                            backgroundColor: isActive ? "#713737" : "#194F48",
                          },
                          borderRadius: "3px",
                          boxShadow: "none",
                          textTransform: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isBusy
                          ? "Updating..."
                          : isActive
                            ? "Deactivate"
                            : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
