import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SavingsIcon from "@mui/icons-material/Savings";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import BoltIcon from "@mui/icons-material/Bolt";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { getProductImage, getPlaceholderImage } from "../utils/imageMapper";
import { AnimatedPage } from "../components/AnimationWrapper";
import {
  BORDER_RADIUS,
  COLORS,
  SHADOWS,
  SPACING,
  cardStyles,
} from "../theme/designSystem";

const DashboardCharts = lazy(() => import("../components/dashboard/DashboardCharts"));

const demoSalesTrend = [
  { period: "1 Mar", sales: 120000 },
  { period: "5 Mar", sales: 142000 },
  { period: "10 Mar", sales: 132000 },
  { period: "15 Mar", sales: 166000 },
  { period: "20 Mar", sales: 171000 },
  { period: "25 Mar", sales: 186000 },
  { period: "30 Mar", sales: 201000 },
];

const statusColorMap = {
  critical: COLORS.error,
  warning: COLORS.warning,
  normal: COLORS.success,
};

function toRelativeTime(dateValue) {
  const ts = new Date(dateValue).getTime();
  if (!Number.isFinite(ts)) return "just now";
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function CountUpNumber({ value, prefix = "", suffix = "", duration = 1000, decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let rafId = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(target * progress);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

function GlassCard({ children, sx }) {
  return (
    <Card
      sx={{
        ...cardStyles.base,
        borderRadius: BORDER_RADIUS.lg,
        border: `1px solid ${COLORS.border}`,
        boxShadow: SHADOWS.sm,
        overflow: "hidden",
        ...sx,
      }}
    >
      <CardContent sx={{ p: SPACING.xl }}>{children}</CardContent>
    </Card>
  );
}

function KpiCard({ item, index }) {
  const trendUp = item.trendDirection === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <GlassCard
        sx={{
          height: "100%",
          transition: "all 220ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: SHADOWS.lg,
          },
        }}
      >
        <Stack spacing={SPACING.md}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: BORDER_RADIUS.md,
                bgcolor: `${item.color}20`,
                color: item.color,
                display: "grid",
                placeItems: "center",
              }}
            >
              <item.icon sx={{ fontSize: 24 }} />
            </Box>
            <Chip
              size="small"
              icon={trendUp ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              label={item.trend}
              sx={{
                bgcolor: trendUp ? COLORS.successLight : COLORS.errorLight,
                color: trendUp ? COLORS.success : COLORS.error,
                fontWeight: 700,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.textLight, fontWeight: 600 }}>
            {item.label}
          </Typography>
          <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: COLORS.textDark }}>
            {item.valueLabel || item.value}
          </Typography>
        </Stack>
      </GlassCard>
    </motion.div>
  );
}

function SectionHeader({ title, subtitle, chipLabel }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACING.md, flexWrap: "wrap" }}>
      <Box>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: COLORS.textDark }}>{title}</Typography>
        <Typography sx={{ color: COLORS.textLight, fontSize: "0.88rem" }}>{subtitle}</Typography>
      </Box>
      {chipLabel ? (
        <Chip
          label={chipLabel}
          size="small"
          sx={{ bgcolor: COLORS.primaryLight, color: COLORS.primary, fontWeight: 700 }}
        />
      ) : null}
    </Box>
  );
}

function ChartsSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
        gap: SPACING.lg,
      }}
    >
      {[1, 2, 3].map((i) => (
        <GlassCard key={i} sx={{ minHeight: 360, gridColumn: i === 3 ? { xs: "auto", xl: "1 / -1" } : "auto" }}>
          <Skeleton variant="text" width="42%" height={32} />
          <Skeleton variant="text" width="60%" height={22} sx={{ mb: SPACING.md }} />
          <Skeleton variant="rounded" height={250} />
        </GlassCard>
      ))}
    </Box>
  );
}

function EmptyBlock({ text }) {
  return <Typography sx={{ color: COLORS.textLight, textAlign: "center", py: SPACING.md }}>{text}</Typography>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setTimeTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimeTick((v) => v + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    api
      .get("/dashboard/summary")
      .then((res) => {
        if (mounted) {
          setData(res.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stockByCategory = useMemo(() => {
    const source = data?.stockByCategory || {};
    return Object.entries(source).map(([category, stock]) => ({ category, stock: Number(stock) || 0 }));
  }, [data]);

  const productDistribution = useMemo(() => {
    const source = data?.categoryCounts || {};
    return Object.entries(source).map(([name, value]) => ({ name, value: Number(value) || 0 }));
  }, [data]);

  const salesTrend = useMemo(() => {
    const source = data?.salesTrend;
    if (source && typeof source === "object") {
      return Object.entries(source)
        .map(([date, sales]) => ({
          period: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          sales: Number(sales) || 0,
        }))
        .slice(-30);
    }
    return demoSalesTrend;
  }, [data]);

  const topProducts = useMemo(() => {
    const products = (data?.topSellingProducts || []).slice(0, 5).map((product, index) => {
      const qty = Number(product.qty || 0);
      const revenue = Number(product.revenue || qty * 1200);
      const trendValue = Number(product.trend || (index % 2 === 0 ? 9 + index : -4 - index));
      return {
        id: index + 1,
        name: product.product,
        qty,
        revenue,
        trendValue,
        trendDirection: trendValue >= 0 ? "up" : "down",
        image: getProductImage(product.category || "Electronics", index + 1),
      };
    });
    if (products.length > 0) {
      const maxQty = Math.max(...products.map((item) => item.qty), 1);
      return products.map((item) => ({
        ...item,
        progress: Math.max(8, Math.round((item.qty / maxQty) * 100)),
      }));
    }
    return [
      { id: 1, name: "Sports Item 367", qty: 212, revenue: 254400, trendValue: 12, trendDirection: "up", progress: 96, image: getProductImage("Sports", 1) },
      { id: 2, name: "Campus Runner Shoes", qty: 184, revenue: 220800, trendValue: 9, trendDirection: "up", progress: 84, image: getProductImage("Footwear", 2) },
      { id: 3, name: "LED Study Lamp", qty: 141, revenue: 169200, trendValue: -3, trendDirection: "down", progress: 68, image: getProductImage("Electronics", 3) },
      { id: 4, name: "Steel Water Bottle", qty: 129, revenue: 154800, trendValue: 5, trendDirection: "up", progress: 62, image: getProductImage("Home", 4) },
      { id: 5, name: "Yoga Mat Pro", qty: 102, revenue: 122400, trendValue: -1, trendDirection: "down", progress: 49, image: getProductImage("Sports", 5) },
    ];
  }, [data]);

  const alerts = useMemo(() => {
    return (data?.lowStockSummary || []).map((row) => {
      const currentStock = Number(row.stockQuantity || 0);
      const reorderLevel = Number(row.reorderLevel || 0);
      let status = "normal";
      if (currentStock <= 0 || currentStock < Math.ceil(reorderLevel * 0.5)) {
        status = "critical";
      } else if (currentStock < reorderLevel) {
        status = "warning";
      }
      return {
        name: row.name,
        currentStock,
        status,
      };
    });
  }, [data]);

  const recentTimeline = useMemo(() => {
    const dynamicTimeline = (data?.recentStockEntries || []).slice(0, 8).map((entry, index) => {
      const action = entry.type === "PURCHASE" ? "Stock updated" : "Product sold";
      return {
        id: `${entry.product}-${index}`,
        title: `${action}: ${entry.product}`,
        time: toRelativeTime(entry.createdAt),
        details: entry.type === "PURCHASE" ? "Admin added units to inventory" : "Order fulfillment completed",
        icon: entry.type === "PURCHASE" ? AddShoppingCartIcon : ShoppingBagIcon,
        tone: entry.type === "PURCHASE" ? COLORS.info : COLORS.success,
      };
    });
    if (dynamicTimeline.length > 0) {
      return dynamicTimeline;
    }
    const now = Date.now();
    return [
      {
        id: "demo-a1",
        title: "Admin added 20 units to Sports Item 367",
        details: "Warehouse A updated bin count",
        time: toRelativeTime(now - 2 * 60 * 1000),
        icon: AddShoppingCartIcon,
        tone: COLORS.info,
      },
      {
        id: "demo-a2",
        title: "New supplier registered: Om Traders",
        details: "Vendor onboarding completed",
        time: toRelativeTime(now - 10 * 60 * 1000),
        icon: StorefrontIcon,
        tone: COLORS.primary,
      },
      {
        id: "demo-a3",
        title: "Stock alert triggered for LED Study Lamp",
        details: "Current stock reached reorder threshold",
        time: toRelativeTime(now - 43 * 60 * 1000),
        icon: WarningAmberIcon,
        tone: COLORS.warning,
      },
      {
        id: "demo-a4",
        title: "Product sold: Campus Runner Shoes",
        details: "15 units dispatched across 5 orders",
        time: toRelativeTime(now - 75 * 60 * 1000),
        icon: ShoppingBagIcon,
        tone: COLORS.success,
      },
    ];
  }, [data]);

  const inventoryInsights = useMemo(() => {
    return {
      fast: data?.analytics?.fastMoving || [],
      slow: data?.analytics?.slowMoving || [],
      dead: data?.analytics?.deadStock || [],
    };
  }, [data]);

  const smartInsights = useMemo(() => {
    const lowSoon = alerts.filter((a) => a.status !== "normal").length;
    const deadCount = inventoryInsights.dead.length || 3;
    const suggestionName = alerts.find((a) => a.status === "critical")?.name || "Sports Item 367";
    const categoryGrowth = Number(data?.growthPct || 18);

    return [
      {
        id: "insight-1",
        tone: "warning",
        icon: WarningAmberIcon,
        title: `${lowSoon || 5} products are about to go out of stock`,
        note: "Reorder immediately to avoid missed orders.",
      },
      {
        id: "insight-2",
        tone: "success",
        icon: TrendingUpIcon,
        title: `Footwear category sales increased by ${Math.max(8, Math.round(categoryGrowth))}%`,
        note: "Momentum is strong this week.",
      },
      {
        id: "insight-3",
        tone: "critical",
        icon: TimelineIcon,
        title: `${deadCount} items are dead stock for 30+ days`,
        note: "Create bundles or promotions for clearance.",
      },
      {
        id: "insight-4",
        tone: "info",
        icon: LightbulbIcon,
        title: `Suggestion: Restock '${suggestionName}'`,
        note: "Demand is rising in the last 24 hours.",
      },
    ];
  }, [alerts, inventoryInsights.dead.length, data?.growthPct]);

  const todaySummary = useMemo(() => {
    const revenueToday = Math.max(0, Math.round((Number(data?.monthlyRevenue || 0) || 1800000) / 30));
    const ordersToday = Math.max(12, Math.round(revenueToday / 2400));
    const lowStockCount = Math.max(0, Number(data?.lowStock || alerts.length || 0));
    const alertsTriggered = Math.max(0, alerts.filter((item) => item.status !== "normal").length);

    return [
      { label: "Orders Today", value: ordersToday, prefix: "", suffix: "", color: COLORS.primary },
      { label: "Revenue Today", value: revenueToday, prefix: "INR ", suffix: "", color: COLORS.success },
      { label: "Low Stock Count", value: lowStockCount, prefix: "", suffix: "", color: COLORS.warning },
      { label: "Alerts Triggered", value: alertsTriggered, prefix: "", suffix: "", color: COLORS.error },
    ];
  }, [data?.monthlyRevenue, data?.lowStock, alerts]);

  const restockSuggestions = useMemo(() => {
    const source = alerts.slice(0, 6);
    if (source.length > 0) {
      return source.map((item, index) => {
        const urgencyMultiplier = item.status === "critical" ? 2.2 : item.status === "warning" ? 1.4 : 1;
        const suggestedQty = Math.max(10, Math.round((25 + index * 6) * urgencyMultiplier));
        const movement = index % 3 === 0 ? "Fast-moving" : index % 3 === 1 ? "Slow-moving" : "Dead-stock risk";
        return {
          name: item.name,
          suggestedQty,
          movement,
          reason:
            movement === "Fast-moving"
              ? "Demand trend is strong in last 7 days"
              : movement === "Slow-moving"
                ? "Stable sales but below target velocity"
                : "Low movement for 30+ days",
          color:
            movement === "Fast-moving"
              ? COLORS.success
              : movement === "Slow-moving"
                ? COLORS.warning
                : COLORS.error,
        };
      });
    }
    return [
      {
        name: "Sports Item 367",
        suggestedQty: 48,
        movement: "Fast-moving",
        reason: "Demand trend is strong in last 7 days",
        color: COLORS.success,
      },
      {
        name: "Campus Runner Shoes",
        suggestedQty: 32,
        movement: "Fast-moving",
        reason: "High conversion in footwear segment",
        color: COLORS.success,
      },
      {
        name: "Formal Shirt XL",
        suggestedQty: 14,
        movement: "Slow-moving",
        reason: "Keep lean inventory to avoid overstock",
        color: COLORS.warning,
      },
      {
        name: "Legacy Winter Cap",
        suggestedQty: 0,
        movement: "Dead-stock risk",
        reason: "Run clearance instead of restocking",
        color: COLORS.error,
      },
    ];
  }, [alerts]);

  const profitLens = useMemo(() => {
    const rows = topProducts.map((product, index) => {
      const marginPct = Math.max(8, 28 - index * 3);
      const profit = Math.round((product.revenue * marginPct) / 100);
      return {
        ...product,
        marginPct,
        profit,
      };
    });
    const weeklyRevenue = Math.round((Number(data?.monthlyRevenue || 1820000) || 1820000) / 4.3);
    const monthlyRevenue = Number(data?.monthlyRevenue || rows.reduce((sum, row) => sum + row.revenue, 0) * 2.2);
    const categoryProfit = {
      Footwear: Math.round(monthlyRevenue * 0.31),
      Electronics: Math.round(monthlyRevenue * 0.24),
      Sports: Math.round(monthlyRevenue * 0.19),
      Clothing: Math.round(monthlyRevenue * 0.14),
      Other: Math.round(monthlyRevenue * 0.12),
    };
    const bestCategory = Object.entries(categoryProfit).sort((a, b) => b[1] - a[1])[0]?.[0] || "Footwear";
    return {
      rows,
      weeklyRevenue,
      monthlyRevenue,
      bestCategory,
      categoryProfit,
    };
  }, [data?.monthlyRevenue, topProducts]);

  const assistantSuggestions = useMemo(() => {
    return [
      {
        id: "assistant-1",
        message: `Restock ${restockSuggestions.filter((row) => row.suggestedQty > 0).slice(0, 3).length} items to avoid stock-out this week`,
        tone: COLORS.warning,
      },
      {
        id: "assistant-2",
        message: `Sales increased in ${profitLens.bestCategory}; push cross-sell bundles today`,
        tone: COLORS.success,
      },
      {
        id: "assistant-3",
        message: "Reduce stock in low-movement clothing SKUs to free working capital",
        tone: COLORS.error,
      },
    ];
  }, [profitLens.bestCategory, restockSuggestions]);

  const kpis = useMemo(() => {
    const inventoryValue = Number(data?.inventoryValue || 0);
    const monthlyRevenue = Number(data?.monthlyRevenue || Math.round(inventoryValue * 0.22));
    const growth = Number(data?.growthPct || 12.4);
    return [
      {
        label: "Total Products",
        value: Number(data?.totalProducts || 0).toLocaleString("en-IN"),
        icon: Inventory2Icon,
        color: COLORS.primary,
        trend: "+8.5%",
        trendDirection: "up",
      },
      {
        label: "Low Stock Items",
        value: Number(data?.lowStock || 0).toLocaleString("en-IN"),
        icon: WarningAmberIcon,
        color: COLORS.warning,
        trend: "-3.1%",
        trendDirection: "down",
      },
      {
        label: "Active Suppliers",
        value: Number(data?.suppliers || 0).toLocaleString("en-IN"),
        icon: LocalShippingIcon,
        color: COLORS.info,
        trend: "+2.2%",
        trendDirection: "up",
      },
      {
        label: "Inventory Value",
        value: `INR ${inventoryValue.toLocaleString("en-IN")}`,
        icon: SavingsIcon,
        color: COLORS.secondary,
        trend: "+5.9%",
        trendDirection: "up",
      },
      {
        label: "Monthly Revenue",
        value: `INR ${monthlyRevenue.toLocaleString("en-IN")}`,
        icon: CurrencyRupeeIcon,
        color: COLORS.success,
        trend: "+11.8%",
        trendDirection: "up",
      },
      {
        label: "Growth %",
        value: `${growth.toFixed(1)}%`,
        icon: TrendingUpIcon,
        color: COLORS.primary,
        trend: "+1.7%",
        trendDirection: "up",
      },
    ];
  }, [data]);

  const onQuickAction = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <AnimatedPage>
      <Box
        sx={{
          px: { xs: SPACING.md, md: SPACING.xl, xl: SPACING.xxxl },
          pb: SPACING.xxxl,
          pt: SPACING.md,
          background:
            "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.08), transparent 32%), radial-gradient(circle at 100% 20%, rgba(6,182,212,0.08), transparent 34%)",
        }}
      >
        <Box
          sx={{
            maxWidth: "1480px",
            mx: "auto",
            display: "grid",
            gap: SPACING.xl,
          }}
        >
          <GlassCard
            sx={{
              background: "linear-gradient(130deg, rgba(37,99,235,0.10) 0%, rgba(6,182,212,0.08) 54%, rgba(255,255,255,0.92) 100%)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACING.lg, flexWrap: "wrap" }}>
              <Box>
                <Typography sx={{ fontSize: { xs: "1.45rem", md: "2rem" }, fontWeight: 800, color: COLORS.textDark }}>
                  Smart Inventory Command Center
                </Typography>
                <Typography sx={{ color: COLORS.textLight, mt: "4px" }}>
                  Premium overview of stock health, revenue momentum, and operational signals.
                </Typography>
                <Typography sx={{ color: COLORS.primary, mt: SPACING.xs, fontSize: "0.88rem", fontWeight: 700 }}>
                  Tip: Check Smart Alerts first to prevent stock outages and missed sales.
                </Typography>
              </Box>
              <Chip label="Live Dashboard" sx={{ bgcolor: COLORS.successLight, color: COLORS.success, fontWeight: 700 }} />
            </Box>
          </GlassCard>

          <GlassCard>
            <SectionHeader
              title="Today's Summary"
              subtitle="Real-time operating snapshot for your business"
              chipLabel="KPI Header"
            />
            <Box
              sx={{
                mt: SPACING.lg,
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gap: SPACING.md,
              }}
            >
              {todaySummary.map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    p: SPACING.md,
                    borderRadius: BORDER_RADIUS.md,
                    border: `1px solid ${metric.color}35`,
                    bgcolor: `${metric.color}10`,
                    transition: "all 220ms ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: SHADOWS.md },
                  }}
                >
                  <Typography sx={{ color: COLORS.textLight, fontSize: "0.8rem", fontWeight: 700 }}>{metric.label}</Typography>
                  <Typography sx={{ color: metric.color, fontSize: "1.25rem", fontWeight: 800, mt: "2px" }}>
                    <CountUpNumber value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                  </Typography>
                </Box>
              ))}
            </Box>
          </GlassCard>

          <SectionHeader
            title="Analytics"
            subtitle="KPI signals, inventory distribution, and sales momentum"
            chipLabel="Insight-Driven"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
              gap: SPACING.lg,
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <GlassCard key={`kpi-skeleton-${idx}`}>
                    <Skeleton variant="circular" width={46} height={46} />
                    <Skeleton variant="text" width="55%" height={26} sx={{ mt: SPACING.sm }} />
                    <Skeleton variant="text" width="35%" height={32} />
                  </GlassCard>
                ))
              : kpis.map((item, index) => <KpiCard item={item} key={item.label} index={index} />)}
          </Box>

          <Suspense fallback={<ChartsSkeleton />}>
            <DashboardCharts
              stockData={stockByCategory}
              distributionData={productDistribution}
              salesData={salesTrend}
            />
          </Suspense>

          <SectionHeader
            title="Insights"
            subtitle="AI-style recommendations and pattern highlights"
            chipLabel="Smart Insights"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
              gap: SPACING.lg,
            }}
          >
            {smartInsights.map((insight, idx) => {
              const toneColor =
                insight.tone === "critical"
                  ? COLORS.error
                  : insight.tone === "warning"
                    ? COLORS.warning
                    : insight.tone === "success"
                      ? COLORS.success
                      : COLORS.info;
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                >
                  <GlassCard
                    sx={{
                      height: "100%",
                      border: `1px solid ${toneColor}45`,
                      borderLeft: `5px solid ${toneColor}`,
                      transition: "all 220ms ease",
                      "&:hover": { transform: "translateY(-4px)", boxShadow: SHADOWS.lg },
                    }}
                  >
                    <Stack spacing={SPACING.sm}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                        <Icon sx={{ color: toneColor }} />
                        <Typography sx={{ fontWeight: 700, color: toneColor, fontSize: "0.85rem" }}>
                          Smart Signal
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: COLORS.textDark }}>{insight.title}</Typography>
                      <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem" }}>{insight.note}</Typography>
                    </Stack>
                  </GlassCard>
                </motion.div>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "1.25fr 1fr" },
              gap: SPACING.lg,
            }}
          >
            <GlassCard>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: SPACING.md }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                  <ShowChartIcon sx={{ color: COLORS.secondary }} />
                  <Typography sx={{ fontWeight: 800, fontSize: "1.02rem" }}>Smart Restock Suggestions</Typography>
                </Box>
                <Chip label="Actionable" size="small" sx={{ bgcolor: COLORS.secondaryLight, color: COLORS.secondary, fontWeight: 700 }} />
              </Box>
              <Stack spacing={SPACING.sm}>
                {restockSuggestions.map((row) => (
                  <Box
                    key={`${row.name}-${row.movement}`}
                    sx={{
                      p: SPACING.md,
                      borderRadius: BORDER_RADIUS.md,
                      border: `1px solid ${row.color}45`,
                      borderLeft: `4px solid ${row.color}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACING.md }}>
                      <Typography sx={{ fontWeight: 700, color: COLORS.textDark }}>{row.name}</Typography>
                      <Chip
                        size="small"
                        label={row.movement}
                        sx={{ bgcolor: `${row.color}20`, color: row.color, fontWeight: 700 }}
                      />
                    </Box>
                    <Typography sx={{ color: COLORS.textLight, fontSize: "0.84rem", mt: "2px" }}>{row.reason}</Typography>
                    <Typography sx={{ color: row.color, fontSize: "0.84rem", fontWeight: 800, mt: SPACING.xs }}>
                      Suggested restock: {row.suggestedQty} units
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </GlassCard>

            <GlassCard>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: SPACING.md }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                  <PsychologyAltIcon sx={{ color: COLORS.primary }} />
                  <Typography sx={{ fontWeight: 800, fontSize: "1.02rem" }}>Smart Assistant Panel</Typography>
                </Box>
                <Chip label="AI-like" size="small" sx={{ bgcolor: COLORS.primaryLight, color: COLORS.primary, fontWeight: 700 }} />
              </Box>
              <Stack spacing={SPACING.md}>
                {assistantSuggestions.map((tip, idx) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                  >
                    <Box sx={{ p: SPACING.md, borderRadius: BORDER_RADIUS.md, bgcolor: `${tip.tone}12`, border: `1px solid ${tip.tone}35` }}>
                      <Typography sx={{ fontWeight: 700, color: tip.tone, fontSize: "0.84rem" }}>Suggestion</Typography>
                      <Typography sx={{ color: COLORS.textDark, fontSize: "0.9rem" }}>{tip.message}</Typography>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </GlassCard>
          </Box>

          <GlassCard>
            <SectionHeader
              title="Profit & Loss Dashboard"
              subtitle="Profit intelligence across products, weekly/monthly revenue, and high-performing category"
              chipLabel="Finance Lens"
            />
            <Box
              sx={{
                mt: SPACING.md,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
                gap: SPACING.md,
              }}
            >
              <Box sx={{ p: SPACING.md, borderRadius: BORDER_RADIUS.md, bgcolor: COLORS.successLight, border: `1px solid ${COLORS.success}30` }}>
                <Typography sx={{ color: COLORS.textLight, fontWeight: 700, fontSize: "0.82rem" }}>Weekly Revenue</Typography>
                <Typography sx={{ color: COLORS.success, fontSize: "1.32rem", fontWeight: 800 }}>
                  INR {profitLens.weeklyRevenue.toLocaleString("en-IN")}
                </Typography>
              </Box>
              <Box sx={{ p: SPACING.md, borderRadius: BORDER_RADIUS.md, bgcolor: COLORS.infoLight, border: `1px solid ${COLORS.info}30` }}>
                <Typography sx={{ color: COLORS.textLight, fontWeight: 700, fontSize: "0.82rem" }}>Monthly Revenue</Typography>
                <Typography sx={{ color: COLORS.info, fontSize: "1.32rem", fontWeight: 800 }}>
                  INR {profitLens.monthlyRevenue.toLocaleString("en-IN")}
                </Typography>
              </Box>
              <Box sx={{ p: SPACING.md, borderRadius: BORDER_RADIUS.md, bgcolor: COLORS.accentLight, border: `1px solid ${COLORS.accent}35` }}>
                <Typography sx={{ color: COLORS.textLight, fontWeight: 700, fontSize: "0.82rem" }}>Most Profitable Category</Typography>
                <Typography sx={{ color: COLORS.accent, fontSize: "1.32rem", fontWeight: 800 }}>
                  {profitLens.bestCategory}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={SPACING.sm} sx={{ mt: SPACING.lg }}>
              {profitLens.rows.slice(0, 5).map((row) => (
                <Box key={`profit-${row.id}`} sx={{ p: SPACING.sm, borderRadius: BORDER_RADIUS.md, border: `1px solid ${COLORS.border}` }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
                    <Chip
                      size="small"
                      icon={row.marginPct >= 20 ? <MonetizationOnIcon /> : <TrendingDownIcon />}
                      label={`Profit INR ${row.profit.toLocaleString("en-IN")}`}
                      sx={{
                        bgcolor: row.marginPct >= 20 ? COLORS.successLight : COLORS.warningLight,
                        color: row.marginPct >= 20 ? COLORS.success : COLORS.warning,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <Typography sx={{ color: COLORS.textLight, fontSize: "0.82rem" }}>Margin: {row.marginPct}%</Typography>
                </Box>
              ))}
            </Stack>
          </GlassCard>

          <SectionHeader
            title="Alerts"
            subtitle="Operational exceptions that need action"
            chipLabel="Action-Oriented"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "1.1fr 1fr" },
              gap: SPACING.lg,
            }}
          >
            <GlassCard>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: SPACING.lg }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                  <ErrorOutlineIcon sx={{ color: COLORS.warning }} />
                  <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Smart Alerts</Typography>
                </Box>
                <Button size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
                  View All
                </Button>
              </Box>
              <Stack spacing={SPACING.md}>
                {alerts.slice(0, 5).map((alert) => {
                  const isCritical = alert.status === "critical";
                  const leftBorder = isCritical ? COLORS.error : alert.status === "warning" ? COLORS.warning : COLORS.success;
                  const icon = isCritical ? ReportProblemOutlinedIcon : alert.status === "warning" ? WarningAmberIcon : TaskAltIcon;
                  const Icon = icon;
                  return (
                    <Box
                      key={`${alert.name}-${alert.status}`}
                      sx={{
                        p: SPACING.md,
                        borderRadius: BORDER_RADIUS.md,
                        border: `1px solid ${leftBorder}40`,
                        borderLeft: `5px solid ${leftBorder}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: SPACING.md,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                        <Icon sx={{ color: leftBorder }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{alert.name}</Typography>
                          <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem" }}>
                            Current stock: {alert.currentStock}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        size="small"
                        sx={{
                          bgcolor: `${statusColorMap[alert.status]}20`,
                          color: statusColorMap[alert.status],
                          fontWeight: 700,
                        }}
                      />
                      <Button
                        size="small"
                        variant={isCritical ? "contained" : "outlined"}
                        onClick={() => onQuickAction("/products")}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          minWidth: 116,
                          ...(isCritical
                            ? { bgcolor: COLORS.error, "&:hover": { bgcolor: "#dc2626" } }
                            : { borderColor: leftBorder, color: leftBorder }),
                        }}
                      >
                        {isCritical ? "Restock Now" : "View Product"}
                      </Button>
                    </Box>
                  );
                })}
                {alerts.length === 0 && <EmptyBlock text="No alerts right now. Inventory is healthy." />}
              </Stack>
            </GlassCard>

            <GlassCard>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm, mb: SPACING.lg }}>
                <TimelineIcon sx={{ color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Recent Activity</Typography>
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label="Live Feed"
                  size="small"
                  sx={{ bgcolor: COLORS.successLight, color: COLORS.success, fontWeight: 700, ml: "auto" }}
                />
              </Box>
              <Stack spacing={SPACING.md} sx={{ maxHeight: 390, overflowY: "auto", pr: SPACING.xs }}>
                {recentTimeline.slice(0, 8).map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.06 }}
                  >
                  <Box sx={{ display: "flex", gap: SPACING.md }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: `${activity.tone}20`, color: activity.tone }}>
                        <activity.icon sx={{ fontSize: 18 }} />
                      </Avatar>
                      {idx < recentTimeline.length - 1 ? (
                        <Box sx={{ width: "2px", flex: 1, bgcolor: COLORS.border, mt: "6px", minHeight: 18 }} />
                      ) : null}
                    </Box>
                    <Box sx={{ pb: SPACING.sm }}>
                      <Typography sx={{ fontWeight: 700 }}>{activity.title}</Typography>
                      <Typography sx={{ color: COLORS.textLight, fontSize: "0.82rem" }}>{activity.details}</Typography>
                      <Typography sx={{ color: COLORS.primary, fontSize: "0.78rem", fontWeight: 700 }}>{activity.time}</Typography>
                    </Box>
                  </Box>
                  </motion.div>
                ))}
                {recentTimeline.length === 0 && <EmptyBlock text="No recent activity available." />}
              </Stack>
            </GlassCard>
          </Box>

          <SectionHeader
            title="Actions"
            subtitle="Immediate controls for day-to-day operations"
            chipLabel="Execution"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr 1fr" },
              gap: SPACING.lg,
            }}
          >
            <GlassCard>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm, mb: SPACING.lg }}>
                <ShoppingBagIcon sx={{ color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Top Selling Products</Typography>
              </Box>
              <Stack spacing={SPACING.md}>
                {topProducts.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "48px 1fr",
                      gap: SPACING.md,
                      p: SPACING.sm,
                      borderRadius: BORDER_RADIUS.md,
                      border: `1px solid ${COLORS.border}`,
                      transition: "all 220ms ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: SHADOWS.md },
                    }}
                  >
                    <Avatar
                      src={item.image}
                      alt={item.name}
                      variant="rounded"
                      sx={{ width: 48, height: 48, borderRadius: BORDER_RADIUS.sm }}
                      imgProps={{
                        onError: (evt) => {
                          evt.currentTarget.src = getPlaceholderImage("Product");
                        },
                      }}
                    />
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACING.md }}>
                        <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                        <Chip
                          size="small"
                          icon={item.trendDirection === "up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          label={`${Math.abs(item.trendValue)}%`}
                          sx={{
                            bgcolor: item.trendDirection === "up" ? COLORS.successLight : COLORS.errorLight,
                            color: item.trendDirection === "up" ? COLORS.success : COLORS.error,
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: "2px" }}>
                        <Typography sx={{ color: COLORS.textLight, fontSize: "0.82rem" }}>{item.qty} units sold</Typography>
                        <Typography sx={{ fontWeight: 800, color: COLORS.success, fontSize: "0.88rem" }}>
                          INR {item.revenue.toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          mt: SPACING.sm,
                          height: 8,
                          borderRadius: BORDER_RADIUS.full,
                          bgcolor: COLORS.primaryLight,
                          "& .MuiLinearProgress-bar": {
                            borderRadius: BORDER_RADIUS.full,
                            background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                ))}
                {topProducts.length === 0 && <EmptyBlock text="No top-selling products yet." />}
              </Stack>
            </GlassCard>

            <GlassCard>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm, mb: SPACING.lg }}>
                <BoltIcon sx={{ color: COLORS.warning }} />
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Smart Insights Panel</Typography>
              </Box>
              <Stack spacing={SPACING.md}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: COLORS.success }}>Fast Moving Items</Typography>
                  <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem" }}>
                    {inventoryInsights.fast.join(", ") || "No fast moving items identified"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: COLORS.warning }}>Slow Moving Items</Typography>
                  <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem" }}>
                    {inventoryInsights.slow.join(", ") || "No slow moving items identified"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: COLORS.error }}>Dead Stock</Typography>
                  <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem" }}>
                    {inventoryInsights.dead.join(", ") || "No dead stock detected"}
                  </Typography>
                </Box>
              </Stack>
            </GlassCard>

            <GlassCard>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm, mb: SPACING.lg }}>
                <AddBoxIcon sx={{ color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Quick Actions</Typography>
              </Box>
              <Stack spacing={SPACING.md}>
                <Button
                  variant="contained"
                  startIcon={<AddBoxIcon />}
                  onClick={() => onQuickAction("/products")}
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    py: SPACING.sm,
                    boxShadow: SHADOWS.md,
                    "&:hover": {
                      boxShadow: `0 0 0 4px ${COLORS.primaryLight}, ${SHADOWS.lg}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Add Product
                </Button>
                <Typography sx={{ color: COLORS.textLight, fontSize: "0.78rem", mt: "-6px" }}>
                  Quickly register new inventory item.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => onQuickAction("/stock")}
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    py: SPACING.sm,
                    bgcolor: COLORS.secondary,
                    boxShadow: SHADOWS.md,
                    "&:hover": {
                      bgcolor: COLORS.secondaryDark,
                      boxShadow: `0 0 0 4px ${COLORS.secondaryLight}, ${SHADOWS.lg}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Add Stock
                </Button>
                <Typography sx={{ color: COLORS.textLight, fontSize: "0.78rem", mt: "-6px" }}>
                  Instantly add inbound or adjustment stock.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<StorefrontIcon />}
                  onClick={() => onQuickAction("/suppliers")}
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    py: SPACING.sm,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                      boxShadow: `0 0 0 4px ${COLORS.primaryLight}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Add Supplier
                </Button>
                <Typography sx={{ color: COLORS.textLight, fontSize: "0.78rem", mt: "-6px" }}>
                  Expand your vendor network in seconds.
                </Typography>
              </Stack>
            </GlassCard>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => onQuickAction("/products")}
              endIcon={<ArrowOutwardIcon />}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Open Full Inventory Workspace
            </Button>
          </Box>
        </Box>
      </Box>
    </AnimatedPage>
  );
}
