import { Box, Button, Typography } from "@mui/material";

const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  iconBackground = "#f5efe4",
}) => {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          maxWidth: 450,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            bgcolor: iconBackground,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 700,
            color: "#263f3f",
            mb: 1,
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: 15,
            color: "#6b7280",
            lineHeight: 1.7,
            mb: 4,
          }}
        >
          {description}
        </Typography>

        {/* Button */}
        <Button
          variant="contained"
          onClick={onButtonClick}
          className="!normal-case"
          sx={{
            bgcolor: "#f0a500",
            color: "#263f3f",
            fontWeight: 700,
            px: 4,
            py: 1.3,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#e09a00",
              boxShadow: "none",
            },
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyState;
