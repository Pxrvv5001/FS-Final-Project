import { useCallback, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "../theme/appTheme";
import { ThemeModeContext } from "./ThemeModeContextObject";

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("sip_theme") || "light");

  const toggleMode = useCallback(() => {
    setMode((prevMode) => {
      const next = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("sip_theme", next);
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
