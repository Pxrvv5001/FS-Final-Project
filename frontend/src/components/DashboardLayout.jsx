import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StorageIcon from "@mui/icons-material/Storage";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useThemeMode } from "../context/useThemeMode";
import { api } from "../api/client";
import { COLORS, LAYOUT, BORDER_RADIUS, SHADOWS, SPACING, TRANSITIONS } from "../theme/designSystem";

function toRelativeTime(dateValue) {
  const ts = new Date(dateValue).getTime();
  if (!Number.isFinite(ts)) return "just now";
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function DashboardLayout({ children }) { // NOSONAR
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;

    api
      .get("/dashboard/summary")
      .then((res) => {
        if (!mounted) return;
        const summary = res.data || {};
        const lowStockCount = Number(summary?.lowStock || 0);
        const latestEntry = (summary?.recentStockEntries || [])[0];
        const generated = [
          {
            id: "n-low",
            level: "warning",
            title: `${lowStockCount || 3} products are low on stock`,
            time: toRelativeTime(Date.now() - 2 * 60 * 1000),
          },
          {
            id: "n-supplier",
            level: "info",
            title: "New supplier registration completed",
            time: toRelativeTime(Date.now() - 35 * 60 * 1000),
          },
          {
            id: "n-spike",
            level: "success",
            title: `Sales spike detected in ${summary?.topSellingProducts?.[0]?.category || "Footwear"}`,
            time: toRelativeTime(Date.now() - 80 * 60 * 1000),
          },
        ];
        if (latestEntry) {
          generated.unshift({
            id: "n-latest-entry",
            level: "info",
            title: `${latestEntry.type === "PURCHASE" ? "Stock added for" : "Sale recorded for"} ${latestEntry.product}`,
            time: toRelativeTime(latestEntry.createdAt),
          });
        }
        setNotifications(generated);
      })
      .catch(() => {
        if (!mounted) return;
        setNotifications([
          { id: "f-1", level: "warning", title: "Low stock alert: Sports Item 367", time: "2 min ago" },
          { id: "f-2", level: "info", title: "New supplier added: Om Traders", time: "18 min ago" },
          { id: "f-3", level: "success", title: "High sales spike in Footwear", time: "1 hr ago" },
        ]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const navItems = useMemo(() => {
    const common = [
      { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
      { text: "Products", path: "/products", icon: <Inventory2Icon /> },
      { text: "Stock", path: "/stock", icon: <StorageIcon /> },
    ];
    if (isAdmin) {
      common.push({ text: "Suppliers", path: "/suppliers", icon: <LocalShippingIcon /> });
    }
    return common;
  }, [isAdmin]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: mode === "light" ? COLORS.lightBg : COLORS.darkBg }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${sidebarOpen ? LAYOUT.sidebarWidth : LAYOUT.sidebarWidthCollapsed}px)`,
          ml: `${sidebarOpen ? LAYOUT.sidebarWidth : LAYOUT.sidebarWidthCollapsed}px`,
          bgcolor: mode === "light" ? COLORS.white : COLORS.darkBg2,
          color: mode === "light" ? COLORS.textDark : COLORS.white,
          borderBottom: `1px solid ${mode === "light" ? COLORS.border : "rgba(255,255,255,0.1)"}`,
          boxShadow: SHADOWS.sm,
          transition: LAYOUT.sidebarTransition,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: SPACING.lg, py: 0.8 }}>
          {/* Search Bar */}
          <TextField
            placeholder="Search products, suppliers..."
            variant="outlined"
            size="small"
            sx={{
              flex: 1,
              maxWidth: "400px",
              "& .MuiOutlinedInput-root": {
                borderRadius: BORDER_RADIUS.md,
                bgcolor: mode === "light" ? COLORS.lightBg : "rgba(71, 85, 105, 0.2)",
                border: `1px solid ${mode === "light" ? COLORS.border : "rgba(148, 163, 184, 0.2)"}`,
                transition: TRANSITIONS.fast,
                "&:hover": {
                  borderColor: COLORS.primary,
                },
                "&.Mui-focused": {
                  borderColor: COLORS.primary,
                  bgcolor: mode === "light" ? COLORS.white : "rgba(71, 85, 105, 0.3)",
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: COLORS.textLight }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                sx={{
                  color: "inherit",
                  transition: TRANSITIONS.fast,
                  "&:hover": {
                    bgcolor: mode === "light" ? COLORS.primaryLight : "rgba(11,95,255,0.15)",
                    color: COLORS.primary,
                  },
                }}
              >
                <Badge badgeContent={notifications.length || 0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() => setNotificationAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </MenuItem>
              {notifications.map((item) => (
                <MenuItem key={item.id} sx={{ alignItems: "flex-start", py: 1 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: item.level === "warning" ? COLORS.warning : item.level === "success" ? COLORS.success : COLORS.textDark,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textLight }}>
                      {item.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            {/* Dark Mode Toggle */}
            <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}>
              <IconButton
                onClick={toggleMode}
                sx={{
                  color: "inherit",
                  transition: TRANSITIONS.fast,
                  "&:hover": {
                    bgcolor: mode === "light" ? COLORS.primaryLight : "rgba(11,95,255,0.15)",
                    color: COLORS.primary,
                  },
                }}
              >
                {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {/* User Role Chip */}
            <Chip
              label={user?.role}
              size="small"
              color={user?.role === "ADMIN" ? "secondary" : "primary"}
              sx={{
                fontWeight: 600,
                borderRadius: BORDER_RADIUS.sm,
                ml: SPACING.sm,
              }}
            />

            {/* Profile Avatar with Dropdown */}
            <Tooltip title="Profile">
              <Avatar
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: COLORS.primary,
                  color: COLORS.white,
                  cursor: "pointer",
                  transition: TRANSITIONS.fast,
                  "&:hover": {
                    bgcolor: COLORS.primaryDark,
                    transform: "scale(1.08)",
                  },
                }}
              >
                {user?.name?.charAt(0) || "U"}
              </Avatar>
            </Tooltip>

            {/* Profile Menu */}
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textLight }}>
                    {user?.email || user?.role}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); navigate("/dashboard"); }}>
                Profile Settings
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); navigate("/dashboard"); }}>
                Account
              </MenuItem>
              <MenuItem
                onClick={() => {
                  logout();
                  navigate("/");
                  setProfileAnchor(null);
                }}
                sx={{
                  color: COLORS.error,
                  "&:hover": {
                    bgcolor: COLORS.errorLight,
                  },
                }}
              >
                <LogoutIcon sx={{ mr: SPACING.sm, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? LAYOUT.sidebarWidth : LAYOUT.sidebarWidthCollapsed,
          flexShrink: 0,
          transition: LAYOUT.sidebarTransition,
          [`& .MuiDrawer-paper`]: {
            width: sidebarOpen ? LAYOUT.sidebarWidth : LAYOUT.sidebarWidthCollapsed,
            boxSizing: "border-box",
            borderRight: `1px solid ${mode === "light" ? COLORS.border : "rgba(255,255,255,0.1)"}`,
            bgcolor: mode === "light" ? COLORS.white : COLORS.darkBg,
            color: mode === "light" ? COLORS.textDark : COLORS.white,
            boxShadow: SHADOWS.sm,
            transition: LAYOUT.sidebarTransition,
            overflow: "hidden",
          },
        }}
      >
        <Toolbar
          sx={{
            py: 2,
            px: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {sidebarOpen && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: COLORS.primary,
                letterSpacing: "0.5px",
              }}
            >
              SIP India
            </Typography>
          )}
          <Tooltip title={sidebarOpen ? "Collapse" : "Expand"}>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: COLORS.primary,
                transition: TRANSITIONS.normal,
                "&:hover": {
                  bgcolor: mode === "light" ? COLORS.primaryLight : "rgba(11,95,255,0.15)",
                },
              }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>

        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <Tooltip key={item.path} title={sidebarOpen ? "" : item.text} placement="right">
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  my: 0.8,
                  px: sidebarOpen ? 2 : 1.5,
                  py: 1,
                  color: mode === "light" ? COLORS.textDark : COLORS.white,
                  transition: TRANSITIONS.fast,
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  "&:hover": {
                    bgcolor: mode === "light" ? COLORS.primaryLight : "rgba(11,95,255,0.15)",
                    color: COLORS.primary,
                  },
                  "&.Mui-selected": {
                    bgcolor: COLORS.primaryLight,
                    color: COLORS.primary,
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: COLORS.primaryLight,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: sidebarOpen ? 40 : 0,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* Logout Button */}
        <Box sx={{ mt: "auto", p: 1 }}>
          <Tooltip title={sidebarOpen ? "" : "Logout"} placement="right">
            <ListItemButton
              onClick={() => {
                logout();
                navigate("/");
              }}
              sx={{
                borderRadius: BORDER_RADIUS.md,
                px: sidebarOpen ? 2 : 1.5,
                py: 1,
                color: mode === "light" ? COLORS.textDark : COLORS.white,
                transition: TRANSITIONS.fast,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                "&:hover": {
                  bgcolor: mode === "light" ? COLORS.primaryLight : "rgba(11,95,255,0.15)",
                  color: COLORS.error,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: sidebarOpen ? 40 : 0,
                  justifyContent: "center",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="Logout" />}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: LAYOUT.contentPadding,
          mt: `${LAYOUT.mainMargin}px`,
          width: `calc(100% - ${sidebarOpen ? LAYOUT.sidebarWidth : LAYOUT.sidebarWidthCollapsed}px)`,
          transition: LAYOUT.sidebarTransition,
        }}
      >
        <Box
          sx={{
            maxWidth: LAYOUT.contentMaxWidth,
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
