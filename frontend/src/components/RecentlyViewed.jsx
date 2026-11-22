import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";

import { getImageUrl } from "../utils/imageUrl";
import {
  clearRecentlyViewed,
  getRecentlyViewed,
} from "../utils/recentlyViewed";

const formatPrice = (value) =>
  value == null ? "" : `₹${Number(value).toLocaleString("en-IN")}`;

// Horizontal strip of products the shopper viewed recently.
// Renders nothing when there is no history.
const RecentlyViewed = ({ excludeId }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getRecentlyViewed(excludeId));

  if (items.length === 0) return null;

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  return (
    <Box
      component="section"
      aria-label="Recently viewed products"
      sx={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8DFD0",
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
        mb: 3,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#233636" }}>
          Recently Viewed
        </Typography>

        <Button
          size="small"
          onClick={handleClear}
          sx={{ textTransform: "none", color: "#68706B", fontWeight: 700 }}
        >
          Clear
        </Button>
      </Stack>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => navigate(`/products/${item.id}`)}
            sx={{
              flex: "0 0 148px",
              textAlign: "left",
              cursor: "pointer",
              background: "none",
              border: "1px solid #EFE7D8",
              borderRadius: 1.5,
              p: 1,
              font: "inherit",
              "&:hover": { borderColor: "#243D3D" },
            }}
          >
            <Box
              sx={{
                height: 110,
                borderRadius: 1,
                backgroundColor: "#F3EFE7",
                overflow: "hidden",
                mb: 1,
              }}
            >
              <Box
                component="img"
                src={getImageUrl(item.imageUrl)}
                alt={item.name}
                loading="lazy"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#273A3A",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 32,
              }}
            >
              {item.name}
            </Typography>

            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#233636" }}>
              {formatPrice(item.price)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RecentlyViewed;
