import { Avatar, Button } from "@mui/material";
import { Link } from "react-router-dom";

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

export default function CustomerTable({ customers }) {
  if (customers.length === 0) {
    return (
      <div className="border border-[#E7E0D1] bg-white px-5 py-12 text-center">
        <h2 className="font-editorial text-2xl">No customers found</h2>
        <p className="mt-2 text-sm text-[#77796F]">
          Try another search, or check whether any customer accounts exist.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#E7E0D1] bg-white">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead className="bg-[#F5F0E5]">
          <tr>
            {["Customer", "Customer ID", "Registered", "Action"].map(
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
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="border-b border-[#EEE8DC] last:border-b-0 hover:bg-[#FFFCF7]"
            >
              <td className="px-5 py-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={customer.avatarUrl || undefined}
                    alt={customer.name || "Customer"}
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "#F3EFE3",
                      color: "#233636",
                    }}
                  >
                    {customer.name?.charAt(0)?.toUpperCase() || "C"}
                  </Avatar>

                  <div>
                    <p className="font-medium text-[#2D3A3A]">
                      {customer.name || "Unnamed customer"}
                    </p>
                    <p className="mt-1 text-xs text-[#77796F]">
                      {customer.email || "—"}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-5 text-sm text-[#77796F]">
                {customer.id}
              </td>

              <td className="px-5 py-5 text-sm text-[#77796F]">
                {formatDate(customer.createdAt)}
              </td>

              <td className="px-5 py-5">
                <Button
                  component={Link}
                  to={`/customers/${customer.id}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "#233636",
                    borderColor: "#BEB7A6",
                    borderRadius: "3px",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "#2D5B4C",
                      backgroundColor: "#F7F3E9",
                    },
                  }}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
