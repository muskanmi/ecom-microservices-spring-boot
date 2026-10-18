import { Chip } from "@mui/material";
import { CATALOG_URL } from "../api/adminCatalogApi";

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${CATALOG_URL}/${imageUrl.replace(/^\/+/, "")}`;
}

export default function CatalogProductTable({ products }) {
  if (!products.length) {
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
    <div className="overflow-x-auto border border-[#E7E0D1] bg-white">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead className="bg-[#F5F0E5]">
          <tr>
            {[
              "Product",
              "Category",
              "Seller ID",
              "Price",
              "Stock",
              "Created",
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
          {products.map((product) => {
            const image = product.images?.[0]?.imageUrl;
            const stock = Number(product.stock ?? 0);

            return (
              <tr
                key={product.id}
                className="border-b border-[#EEE8DC] last:border-b-0 hover:bg-[#FFFCF7]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {image ? (
                      <img
                        src={getImageUrl(image)}
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
                      stock <= 0 ? "error" : stock <= 5 ? "warning" : "success"
                    }
                    variant="outlined"
                  />
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-[#77796F]">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
