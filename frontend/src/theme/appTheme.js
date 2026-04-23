import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode) => {
  const isDark = mode === "dark";

  return createTheme({
    typography: {
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
    },
    palette: {
      mode,
      primary: { main: "#0B5FFF" },
      secondary: { main: "#00A76F" },
      background: {
        default: isDark ? "#0D1117" : "#F4F7FB",
        paper: isDark ? "#151B23" : "#FFFFFF",
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? "0 12px 30px rgba(0,0,0,0.35)"
              : "0 12px 30px rgba(15,23,42,0.08)",
            transition: "all 0.25s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
    },
  });
};
