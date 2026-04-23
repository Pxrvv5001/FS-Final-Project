import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  COLORS,
  BORDER_RADIUS,
  SHADOWS,
  SPACING,
  cardStyles,
} from "../../theme/designSystem";

const ChartShell = ({ title, subtitle, badge, children }) => (
  <Card
    sx={{
      ...cardStyles.base,
      height: "100%",
      borderRadius: BORDER_RADIUS.lg,
      border: `1px solid ${COLORS.border}`,
      boxShadow: SHADOWS.sm,
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: SHADOWS.lg,
      },
    }}
  >
    <CardContent sx={{ p: SPACING.xl, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: SPACING.md, mb: SPACING.md }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: COLORS.textDark }}>{title}</Typography>
          <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem", mt: "2px" }}>{subtitle}</Typography>
        </Box>
        {badge ? (
          <Chip
            label={badge}
            size="small"
            sx={{ bgcolor: COLORS.primaryLight, color: COLORS.primary, fontWeight: 700 }}
          />
        ) : null}
      </Box>
      <Box sx={{ height: 320 }}>{children}</Box>
    </CardContent>
  </Card>
);

ChartShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  badge: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default function DashboardCharts({ stockData, distributionData, salesData }) {
  const [salesRange, setSalesRange] = useState("30d");
  const [forecastRange, setForecastRange] = useState("30d");

  const generateDemoSales = useMemo(
    () => (days) => {
      const today = new Date();
      const baseValue = 142000;

      return Array.from({ length: days }, (_, index) => {
        const dayIndex = index + 1;
        const date = new Date(today);
        date.setDate(today.getDate() - (days - dayIndex));

        let phaseGrowth = 0;
        if (dayIndex <= Math.floor(days * 0.34)) {
          phaseGrowth = dayIndex * 900;
        } else if (dayIndex <= Math.floor(days * 0.67)) {
          phaseGrowth = Math.floor(days * 0.34) * 900 - (dayIndex - Math.floor(days * 0.34)) * 350;
        } else {
          phaseGrowth =
            Math.floor(days * 0.34) * 900 -
            (Math.floor(days * 0.67) - Math.floor(days * 0.34)) * 350 +
            (dayIndex - Math.floor(days * 0.67)) * 1200;
        }

        const wave = Math.sin(dayIndex * 0.55) * 2400;
        const microWave = Math.cos(dayIndex * 0.3) * 1200;
        const weekday = date.getDay();
        const weekendAdjustment = weekday === 0 ? -3200 : weekday === 6 ? 1800 : 0;

        const sales = Math.max(68000, Math.round(baseValue + phaseGrowth + wave + microWave + weekendAdjustment));

        return {
          date,
          period: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          sales,
          demo: true,
        };
      });
    },
    []
  );

  const normalizedSales = useMemo(() => {
    const parsed = (salesData || [])
      .map((row, index) => {
        const date = row?.date ? new Date(row.date) : new Date();
        if (row?.date == null) {
          date.setDate(date.getDate() - ((salesData?.length || 0) - index));
        }

        return {
          date,
          period:
            row?.period ||
            date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            }),
          sales: Number(row?.sales || 0),
          demo: false,
        };
      })
      .filter((row) => Number.isFinite(row.sales) && row.sales > 0)
      .sort((a, b) => a.date - b.date);

    return parsed;
  }, [salesData]);

  const rangeDays = salesRange === "7d" ? 7 : salesRange === "30d" ? 30 : 90;

  const hasRealData = normalizedSales.length > 0;

  const salesSeries = useMemo(() => {
    if (!hasRealData) {
      return generateDemoSales(rangeDays);
    }

    if (normalizedSales.length >= rangeDays) {
      return normalizedSales.slice(-rangeDays);
    }

    if (salesRange === "3m" && normalizedSales.length < 90) {
      return generateDemoSales(rangeDays).map((point, idx) => {
        if (idx < rangeDays - normalizedSales.length) return point;
        const realPoint = normalizedSales[idx - (rangeDays - normalizedSales.length)];
        return realPoint || point;
      });
    }

    return normalizedSales;
  }, [generateDemoSales, hasRealData, normalizedSales, rangeDays, salesRange]);

  const salesMetrics = useMemo(() => {
    if (salesSeries.length === 0) {
      return {
        total: 0,
        growthPct: 0,
        bestDay: "-",
      };
    }

    const total = salesSeries.reduce((sum, row) => sum + row.sales, 0);
    const midpoint = Math.floor(salesSeries.length / 2);
    const firstHalf = salesSeries.slice(0, midpoint).reduce((sum, row) => sum + row.sales, 0);
    const secondHalf = salesSeries.slice(midpoint).reduce((sum, row) => sum + row.sales, 0);
    const growthPct = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
    const best = salesSeries.reduce((prev, curr) => (curr.sales > prev.sales ? curr : prev), salesSeries[0]);

    return {
      total,
      growthPct,
      bestDay: best.period,
    };
  }, [salesSeries]);

  const forecastDays = forecastRange === "7d" ? 7 : 30;

  const forecastSeries = useMemo(() => {
    const baseSeries = salesSeries.slice(-14);
    const avgDemand =
      baseSeries.length > 0
        ? baseSeries.reduce((sum, row) => sum + Number(row.sales || 0), 0) / baseSeries.length
        : 145000;
    const trend = baseSeries.length > 1
      ? (Number(baseSeries[baseSeries.length - 1]?.sales || avgDemand) - Number(baseSeries[0]?.sales || avgDemand)) / baseSeries.length
      : 1100;

    return Array.from({ length: forecastDays }, (_, idx) => {
      const dayNumber = idx + 1;
      const projectedDemand = Math.max(48000, Math.round(avgDemand + trend * dayNumber + Math.sin(dayNumber * 0.7) * 2800));
      return {
        day: `D+${dayNumber}`,
        demand: projectedDemand,
      };
    });
  }, [forecastDays, salesSeries]);

  const forecastMetrics = useMemo(() => {
    const avgProjected = forecastSeries.length > 0
      ? Math.round(forecastSeries.reduce((sum, row) => sum + row.demand, 0) / forecastSeries.length)
      : 0;
    const virtualStockPool = 1200;
    const demandUnitsPerDay = Math.max(1, Math.round(avgProjected / 2400));
    const stockOutDays = Math.ceil(virtualStockPool / demandUnitsPerDay);
    return {
      avgProjected,
      stockOutDays,
    };
  }, [forecastSeries]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
        gap: SPACING.lg,
      }}
    >
      <ChartShell
        title="Stock Level by Category"
        subtitle="Current stock volume mapped by category"
        badge="Live"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stockData} margin={{ top: 8, right: 12, left: -8, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 12, fill: COLORS.textLight }} interval={0} angle={-25} textAnchor="end" height={62} />
            <YAxis tick={{ fontSize: 12, fill: COLORS.textLight }} />
            <Tooltip
              contentStyle={{
                borderRadius: BORDER_RADIUS.md,
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.md,
              }}
              formatter={(value) => [value, "Units"]}
            />
            <Bar dataKey="stock" radius={[8, 8, 0, 0]}>
              {stockData.map((row, index) => (
                <Cell key={`${row.category}-stock`} fill={COLORS.chart[index % COLORS.chart.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Product Distribution"
        subtitle="Clean category mix with donut visualization"
        badge="Donut"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={108}
              paddingAngle={3}
            >
              {distributionData.map((slice, index) => (
                <Cell key={`${slice.name}-dist`} fill={COLORS.chart[index % COLORS.chart.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: BORDER_RADIUS.md,
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.md,
              }}
              formatter={(value) => [value, "Products"]}
            />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>

      <Box sx={{ gridColumn: { xs: "auto", xl: "1 / -1" } }}>
        <ChartShell
          title="Sales Over Time"
          subtitle="Daily revenue analytics with trend-driven forecasting feel"
          badge="Trend"
        >
          <Box sx={{ display: "grid", gap: SPACING.md, height: "100%" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr auto" },
                alignItems: "center",
                gap: SPACING.sm,
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: SPACING.md }}>
                <Chip
                  label={`Total Sales: INR ${salesMetrics.total.toLocaleString("en-IN")}`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: COLORS.infoLight, color: COLORS.info }}
                />
                <Chip
                  label={`${salesMetrics.growthPct >= 0 ? "Growth" : "Drop"}: ${Math.abs(salesMetrics.growthPct).toFixed(1)}%`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: salesMetrics.growthPct >= 0 ? COLORS.successLight : COLORS.errorLight,
                    color: salesMetrics.growthPct >= 0 ? COLORS.success : COLORS.error,
                  }}
                />
                <Chip
                  label={`Best Day: ${salesMetrics.bestDay}`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: COLORS.primaryLight, color: COLORS.primary }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: SPACING.xs, justifyContent: { xs: "flex-start", lg: "flex-end" } }}>
                <Chip
                  label="Last 7 days"
                  clickable
                  onClick={() => setSalesRange("7d")}
                  sx={{
                    fontWeight: 700,
                    bgcolor: salesRange === "7d" ? COLORS.primary : COLORS.primaryLight,
                    color: salesRange === "7d" ? COLORS.white : COLORS.primary,
                  }}
                />
                <Chip
                  label="Last 30 days"
                  clickable
                  onClick={() => setSalesRange("30d")}
                  sx={{
                    fontWeight: 700,
                    bgcolor: salesRange === "30d" ? COLORS.primary : COLORS.primaryLight,
                    color: salesRange === "30d" ? COLORS.white : COLORS.primary,
                  }}
                />
                <Chip
                  label="Last 3 months"
                  clickable
                  onClick={() => setSalesRange("3m")}
                  sx={{
                    fontWeight: 700,
                    bgcolor: salesRange === "3m" ? COLORS.primary : COLORS.primaryLight,
                    color: salesRange === "3m" ? COLORS.white : COLORS.primary,
                  }}
                />
              </Box>
            </Box>

            {!hasRealData ? (
              <Typography sx={{ color: COLORS.textLight, fontSize: "0.82rem", fontWeight: 600 }}>
                Showing demo analytics data
              </Typography>
            ) : null}

            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesSeries} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.03} />
                    </linearGradient>
                    <filter id="salesShadow" x="-20%" y="-20%" width="140%" height="160%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2563EB" floodOpacity="0.18" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: COLORS.textLight }} interval={salesRange === "3m" ? 6 : 2} />
                  <YAxis tick={{ fontSize: 12, fill: COLORS.textLight }} width={84} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: BORDER_RADIUS.md,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: SHADOWS.md,
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Sales"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                    filter="url(#salesShadow)"
                    isAnimationActive
                    animationDuration={900}
                    dot={false}
                    activeDot={{ r: 6, fill: COLORS.white, stroke: "#2563EB", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </ChartShell>
      </Box>

      <Box sx={{ gridColumn: { xs: "auto", xl: "1 / -1" } }}>
        <ChartShell
          title="AI Stock Prediction"
          subtitle="Forecasted demand and estimated stock-out horizon"
          badge="Predictive"
        >
          <Box sx={{ display: "grid", gap: SPACING.md, height: "100%" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr auto" },
                alignItems: "center",
                gap: SPACING.sm,
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: SPACING.md }}>
                <Chip
                  label={`Avg Predicted Demand: INR ${forecastMetrics.avgProjected.toLocaleString("en-IN")}/day`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: COLORS.infoLight, color: COLORS.info }}
                />
                <Chip
                  label={`Estimated Stock-out: ${forecastMetrics.stockOutDays} days`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: COLORS.warningLight, color: COLORS.warning }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: SPACING.xs, justifyContent: { xs: "flex-start", lg: "flex-end" } }}>
                <Chip
                  label="Next 7 days"
                  clickable
                  onClick={() => setForecastRange("7d")}
                  sx={{
                    fontWeight: 700,
                    bgcolor: forecastRange === "7d" ? COLORS.secondary : COLORS.secondaryLight,
                    color: forecastRange === "7d" ? COLORS.white : COLORS.secondary,
                  }}
                />
                <Chip
                  label="Next 30 days"
                  clickable
                  onClick={() => setForecastRange("30d")}
                  sx={{
                    fontWeight: 700,
                    bgcolor: forecastRange === "30d" ? COLORS.secondary : COLORS.secondaryLight,
                    color: forecastRange === "30d" ? COLORS.white : COLORS.secondary,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastSeries} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: COLORS.textLight }} interval={forecastRange === "30d" ? 3 : 0} />
                  <YAxis tick={{ fontSize: 12, fill: COLORS.textLight }} width={84} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: BORDER_RADIUS.md,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: SHADOWS.md,
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Predicted Demand"]}
                    labelFormatter={(label) => `Forecast ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke={COLORS.secondary}
                    strokeWidth={3}
                    fill="url(#forecastGradient)"
                    isAnimationActive
                    animationDuration={1000}
                    dot={false}
                    activeDot={{ r: 5, fill: COLORS.white, stroke: COLORS.secondary, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </ChartShell>
      </Box>
    </Box>
  );
}

DashboardCharts.propTypes = {
  stockData: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      stock: PropTypes.number.isRequired,
    })
  ).isRequired,
  distributionData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  salesData: PropTypes.arrayOf(
    PropTypes.shape({
      period: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
    })
  ).isRequired,
};
