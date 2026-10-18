import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function statusColor(status) {
  switch (String(status || "").toUpperCase()) {
    case "CONFIRMED":
    case "DELIVERED":
    case "PAID":
      return "success";

    case "CANCELLED":
    case "FAILED":
    case "REFUNDED":
      return "error";

    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "info";

    default:
      return "default";
  }
}

export default function OrderTable({ orders = [], onViewOrder }) {
  if (!orders.length) {
    return (
      <div className="border border-[#E7E0D1] bg-white px-5 py-12 text-center">
        <h2 className="font-editorial text-2xl">No orders found</h2>

        <p className="mt-2 text-sm text-[#77796F]">
          Try another search or refresh the order list.
        </p>
      </div>
    );
  }

  return (
    <TableContainer className="border border-[#E7E0D1] bg-white">
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#F5F0E5" }}>
            {[
              "Order",
              "Customer",
              "Order Date",
              "Total",
              "Order Status",
              "Payment",
            ].map((heading) => (
              <TableCell
                key={heading}
                sx={{
                  borderBottomColor: "#E7E0D1",
                  color: "#77796F",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              hover
              sx={{
                "& td": {
                  borderBottomColor: "#EEE8DC",
                },
                "&:last-child td": {
                  borderBottom: 0,
                },
              }}
            >
              <TableCell>
                <button
                  type="button"
                  onClick={() => onViewOrder?.(order)}
                  disabled={!onViewOrder}
                  className="text-left font-medium text-[#2D5B4C] underline-offset-4 hover:underline disabled:cursor-default disabled:text-[#2D3A3A] disabled:no-underline"
                  title={
                    onViewOrder
                      ? "View order details"
                      : "Order details unavailable"
                  }
                >
                  {order.orderNumber || `Order #${order.id}`}
                </button>

                <div className="mt-1 text-xs text-[#77796F]">
                  ID: {order.id}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-[#2D3A3A]">
                  {order.customerEmail || "—"}
                </div>

                <div className="mt-1 text-xs text-[#77796F]">
                  Customer ID: {order.userId ?? "—"}
                </div>
              </TableCell>

              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  color: "#77796F",
                }}
              >
                {formatDate(order.createdAt)}
              </TableCell>

              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {formatAmount(order.totalAmount)}
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={String(order.status || "UNKNOWN").replaceAll("_", " ")}
                  color={statusColor(order.status)}
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={String(order.paymentStatus || "UNKNOWN").replaceAll(
                    "_",
                    " ",
                  )}
                  color={statusColor(order.paymentStatus)}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
