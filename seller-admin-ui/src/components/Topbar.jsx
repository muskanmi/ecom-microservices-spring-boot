import { Avatar, Badge, IconButton, InputBase, Tooltip } from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#E4DDCF] bg-[#FFFCF4] px-6 lg:px-8">
      {/* Search */}
      <div className="flex w-full max-w-[560px] items-center gap-3 rounded-[6px] bg-[#F3EEE4] px-4 py-2.5">
        <SearchOutlinedIcon fontSize="small" className="text-[#6F766F]" />

        <InputBase
          placeholder="Search products, orders..."
          className="flex-1 text-sm"
          sx={{
            "& input": {
              color: "#263331",
              fontSize: "14px",
            },
            "& input::placeholder": {
              color: "#8A8F89",
              opacity: 1,
            },
          }}
        />
      </div>

      {/* Right side */}
      <div className="ml-6 flex shrink-0 items-center gap-5">
        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            size="small"
            sx={{
              color: "#164E4A",
            }}
          >
            <Badge
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#E9B12C",
                  minWidth: 7,
                  height: 7,
                  padding: 0,
                  top: 3,
                  right: 3,
                },
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <div className="h-8 w-px bg-[#E4DDCF]" />

        <div className="flex items-center gap-3">
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#E9B12C",
              color: "#164E4A",
              fontFamily: "Georgia, serif",
              fontWeight: 700,
            }}
          >
            S
          </Avatar>

          <div>
            <p className="font-serif text-sm font-semibold text-[#263331]">
              Seller
            </p>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8A8F89]">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
