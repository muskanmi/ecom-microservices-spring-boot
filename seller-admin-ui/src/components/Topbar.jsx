import { Avatar, Badge, IconButton, InputBase, Tooltip } from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-[78px] items-center justify-between border-b border-[#DED7C9] bg-[#FFFCF4] px-8">
      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-3 border border-[#DED7C9] bg-[#F7F1E5] px-4 py-2.5 transition focus-within:border-[#2D3A3A]">
        <SearchOutlinedIcon fontSize="small" className="text-[#8A8378]" />

        <InputBase
          placeholder="Search products, orders..."
          className="flex-1 text-sm"
          sx={{
            "& input::placeholder": {
              color: "#8A8378",
              opacity: 1,
            },
          }}
        />
      </div>

      {/* Right */}
      <div className="ml-6 flex shrink-0 items-center gap-5">
        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            size="small"
            sx={{
              color: "#2D3A3A",
            }}
          >
            <Badge
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#E9B44C",
                },
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <div className="h-8 w-px bg-[#DED7C9]" />

        <div className="flex items-center gap-3">
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#E9B44C",
              color: "#233636",
              fontFamily: "Georgia, serif",
              fontWeight: 700,
            }}
          >
            S
          </Avatar>

          <div>
            <p className="font-serif text-sm font-semibold text-[#233636]">
              Seller
            </p>

            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[#8A8378]">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
