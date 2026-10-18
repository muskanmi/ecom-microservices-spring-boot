import { Link } from "react-router-dom";
import { Button } from "@mui/material";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs font-bold tracking-[0.22em] text-[#8B7850]">
        ERROR 404
      </p>

      <h1 className="mt-4 font-editorial text-5xl">Page not found</h1>

      <p className="mt-4 text-sm text-[#77796F]">
        The page you requested doesn't exist.
      </p>

      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        sx={{
          mt: 4,
          backgroundColor: "#233636",
          textTransform: "none",
          boxShadow: "none",
        }}
      >
        Back to dashboard
      </Button>
    </div>
  );
}
