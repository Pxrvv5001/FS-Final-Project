import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3">404</Typography>
        <Typography sx={{ mb: 1 }}>Page not found</Typography>
        <Button variant="contained" onClick={() => navigate("/dashboard")}>Go Dashboard</Button>
      </Box>
    </Box>
  );
}
