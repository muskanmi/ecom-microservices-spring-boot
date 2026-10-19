import { Button, Chip, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";

function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return {
        backgroundColor: "#E7F2E8",
        color: "#326B43",
      };
    case "REJECTED":
      return {
        backgroundColor: "#FBE9E6",
        color: "#A33B32",
      };
    default:
      return {
        backgroundColor: "#F7EED8",
        color: "#87651C",
      };
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SellerTable({
  sellers,
  updatingSellerId,
  onUpdateApproval,
}) {
  if (sellers.length === 0) {
    return (
      <div className="border border-[#E7E0D1] bg-white px-5 py-12 text-center">
        <h3 className="font-editorial text-2xl">No sellers found</h3>
        <p className="mt-2 text-sm text-[#77796F]">
          Seller accounts will appear here when profiles are registered.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#E7E0D1] bg-white">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead className="bg-[#F5F0E5]">
          <tr>
            {["Seller", "Shop name", "Registered", "Status", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  className="border-b border-[#E7E0D1] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F]"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {sellers.map((seller) => {
            const status = seller.approvalStatus?.toUpperCase();
            const isUpdating = updatingSellerId === seller.sellerProfileId;

            return (
              <tr
                key={seller.sellerProfileId}
                className="border-b border-[#EEE8DC] last:border-b-0 hover:bg-[#FFFCF7]"
              >
                <td className="px-5 py-5">
                  <p className="font-medium text-[#2D3A3A]">
                    {seller.name || "Unnamed seller"}
                  </p>
                  <p className="mt-1 text-xs text-[#77796F]">
                    {seller.email || "—"}
                  </p>
                  <p className="mt-1 text-[10px] text-[#99958A]">
                    ID: {seller.sellerProfileId}
                  </p>
                </td>

                <td className="px-5 py-5 text-sm">{seller.shopName || "—"}</td>

                <td className="px-5 py-5 text-sm text-[#77796F]">
                  {formatDate(seller.createdAt)}
                </td>

                <td className="px-5 py-5">
                  <Chip
                    size="small"
                    label={status || "PENDING"}
                    sx={{
                      ...getStatusColor(status),
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  />
                </td>

                <td className="px-5 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      component={Link}
                      to={`/sellers/${seller.sellerProfileId}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#233636",
                        borderColor: "#BEB7A6",
                        borderRadius: "3px",
                        textTransform: "none",
                      }}
                    >
                      View Details
                    </Button>

                    {status === "PENDING" && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={isUpdating}
                          onClick={() =>
                            onUpdateApproval(seller.sellerProfileId, "APPROVED")
                          }
                          sx={{
                            backgroundColor: "#2D5B4C",
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor: "#23483C",
                              boxShadow: "none",
                            },
                          }}
                        >
                          {isUpdating ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            "Approve"
                          )}
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isUpdating}
                          onClick={() =>
                            onUpdateApproval(seller.sellerProfileId, "REJECTED")
                          }
                          sx={{
                            color: "#A33B32",
                            borderColor: "#D9B8B1",
                            textTransform: "none",
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
