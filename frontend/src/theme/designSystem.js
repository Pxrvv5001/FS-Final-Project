// Design System - Consistent styling across the app
export const COLORS = {
  // Primary - Blue
  primary: "#2563eb", // Professional Blue
  primaryDark: "#1e40af",
  primaryLight: "#eff6ff",
  primaryVeryLight: "#f0f9ff",

  // Secondary - Cyan
  secondary: "#06b6d4", // Light Cyan
  secondaryDark: "#0891b2",
  secondaryLight: "#ecf9fc",
  secondaryVeryLight: "#f0fdf9",

  // Accent
  accent: "#f59e0b", // Amber
  accentLight: "#fef3c7",

  // Neutral
  darkBg: "#0f172a", // Very dark background
  darkBg2: "#1e293b", // Slightly lighter
  lightBg: "#f8fafc", // Light background
  white: "#ffffff",
  textDark: "#1e293b",
  textLight: "#64748b",
  border: "#e2e8f0",
  divider: "#f1f5f9",

  // Status colors
  success: "#10b981",
  successLight: "#ecfdf5",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  error: "#ef4444",
  errorLight: "#fef2f2",
  info: "#3b82f6",
  infoLight: "#eff6ff",

  // Chart colors
  chart: ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"],
};

export const SPACING = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  xxl: "32px",
  xxxl: "40px",
};

export const BORDER_RADIUS = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
};

export const SHADOWS = {
  sm: "0px 2px 4px rgba(0, 0, 0, 0.06)",
  md: "0px 4px 12px rgba(0, 0, 0, 0.08)",
  lg: "0px 12px 24px rgba(0, 0, 0, 0.12)",
  xl: "0px 20px 40px rgba(0, 0, 0, 0.15)",
};

export const TRANSITIONS = {
  fast: "all 0.15s ease-in-out",
  normal: "all 0.3s ease-in-out",
  slow: "all 0.5s ease-in-out",
};

// Animation keyframes for Framer Motion
export const ANIMATIONS = {
  pageVars: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  cardHover: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  buttonHover: {
    scale: 1.04,
    transition: { duration: 0.2 },
  },
  buttonTap: {
    scale: 0.98,
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
};

// Gradient definitions
export const GRADIENTS = {
  loginBg: "linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #8b5cf6 100%)",
  primary: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
  secondary: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  cardHover: "linear-gradient(135deg, #2563eb05 0%, #06b6d405 100%)",
};

export const LAYOUT = {
  sidebarWidth: 240,
  sidebarWidthCollapsed: 80,
  contentPadding: 24,
  contentMaxWidth: "1400px",
  mainMargin: 64, // AppBar height
  headerHeight: 64,
  sidebarTransition: "width 0.3s ease-in-out",
};

// Dark mode colors
export const DARK_COLORS = {
  bg: "#0f172a",
  bg2: "#1e293b",
  bg3: "#334155",
  cardBg: "rgba(30, 41, 59, 0.8)",
  text: "#f1f5f9",
  textSecondary: "#cbd5e1",
  border: "rgba(148, 163, 184, 0.15)",
};

export const cardStyles = {
  base: {
    borderRadius: BORDER_RADIUS.md,
    boxShadow: SHADOWS.sm,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: TRANSITIONS.normal,
  },
  hover: {
    boxShadow: SHADOWS.lg,
    transform: "translateY(-4px)",
  },
  glassmorphism: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
  },
  dark: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(148, 163, 184, 0.15)`,
    transition: TRANSITIONS.normal,
  },
};

export const buttonStyles = {
  contained: {
    borderRadius: BORDER_RADIUS.md,
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 20px",
    transition: TRANSITIONS.normal,
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: SHADOWS.md,
    },
  },
  outlined: {
    borderRadius: BORDER_RADIUS.md,
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 20px",
    transition: TRANSITIONS.normal,
    border: `2px solid currentColor`,
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },
  elevated: {
    borderRadius: BORDER_RADIUS.md,
    textTransform: "none",
    fontWeight: 600,
    padding: "12px 24px",
    background: GRADIENTS.primary,
    color: COLORS.white,
    border: "none",
    transition: TRANSITIONS.normal,
    cursor: "pointer",
    boxShadow: SHADOWS.md,
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: SHADOWS.lg,
    },
  },
};
