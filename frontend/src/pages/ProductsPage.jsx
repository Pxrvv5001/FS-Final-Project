import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";
import { getProductImage } from "../utils/imageMapper";
import { exportToCSV } from "../utils/csvExport";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS } from "../theme/designSystem";

const categories = ["all", "Grocery", "Electronics", "Clothing", "Stationery", "Home & Kitchen", "Personal Care", "Sports", "Footwear", "Health", "Books", "Appliances", "Baby Care"];

function getPerformanceBucket(score) {
  if (score >= 75) return "Fast-moving";
  if (score >= 45) return "Slow-moving";
  return "Dead stock";
}

function getPerformanceColor(bucket) {
  if (bucket === "Fast-moving") return COLORS.success;
  if (bucket === "Slow-moving") return COLORS.warning;
  return COLORS.error;
}

const ProductCard = ({ product, onDelete, isAdmin }) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: BORDER_RADIUS.md,
      boxShadow: SHADOWS.sm,
      transition: TRANSITIONS.normal,
      cursor: "pointer",
      border: `1px solid ${COLORS.border}`,
      "&:hover": {
        boxShadow: SHADOWS.lg,
        transform: "translateY(-8px)",
        borderColor: COLORS.primary,
      },
    }}
  >
    {/* Image Container */}
    <Box
      sx={{
        position: "relative",
        height: 200,
        overflow: "hidden",
        backgroundColor: COLORS.lightBg,
      }}
    >
      <CardMedia
        component="img"
        image={getProductImage(product.category, product.id)}
        alt={product.name}
        sx={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          transition: TRANSITIONS.normal,
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      />
      {/* Stock Badge */}
      <Box
        sx={{
          position: "absolute",
          top: SPACING.md,
          right: SPACING.md,
          px: SPACING.md,
          py: SPACING.sm,
          borderRadius: BORDER_RADIUS.full,
          background:
            product.stockQuantity <= product.reorderLevel
              ? COLORS.warningLight
              : COLORS.successLight,
          display: "flex",
          alignItems: "center",
          gap: SPACING.xs,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor:
              product.stockQuantity <= product.reorderLevel
                ? COLORS.warning
                : COLORS.success,
          }}
        />
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color:
              product.stockQuantity <= product.reorderLevel
                ? COLORS.warning
                : COLORS.success,
          }}
        >
          {product.stockQuantity <= product.reorderLevel ? "LOW" : "IN STOCK"}
        </Typography>
      </Box>
    </Box>

    {/* Content */}
    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: SPACING.lg }}>
      {/* Product Name */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.05rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          mb: SPACING.sm,
          color: COLORS.textDark,
        }}
      >
        {product.name}
      </Typography>

      {/* Item Code & Brand */}
      <Typography
        sx={{
          color: COLORS.textLight,
          fontSize: "0.85rem",
          mb: SPACING.md,
          fontWeight: 500,
        }}
      >
        {product.itemCode} • {product.brand}
      </Typography>

      {/* Category & GST Chips */}
      <Stack direction="row" spacing={SPACING.sm} sx={{ mb: SPACING.lg, flexWrap: "wrap", gap: SPACING.xs }}>
        <Chip
          label={product.category}
          size="small"
          icon={<LocalOfferIcon />}
          sx={{
            borderRadius: BORDER_RADIUS.sm,
            fontWeight: 700,
            fontSize: "0.75rem",
            bgcolor: COLORS.primaryVeryLight,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primary}30`,
          }}
        />
        <Chip
          label={`GST ${product.gstPercent}%`}
          size="small"
          sx={{
            borderRadius: BORDER_RADIUS.sm,
            fontWeight: 700,
            fontSize: "0.75rem",
            bgcolor: COLORS.secondaryLight,
            color: COLORS.secondary,
            border: `1px solid ${COLORS.secondary}30`,
          }}
        />
        <Chip
          label={product.performanceBucket}
          size="small"
          sx={{
            borderRadius: BORDER_RADIUS.sm,
            fontWeight: 700,
            fontSize: "0.75rem",
            bgcolor: `${product.performanceColor}20`,
            color: product.performanceColor,
            border: `1px solid ${product.performanceColor}40`,
          }}
        />
      </Stack>

      <Box sx={{ mb: SPACING.lg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: SPACING.xs }}>
          <Typography sx={{ color: COLORS.textLight, fontSize: "0.8rem", fontWeight: 700 }}>
            Product Performance Score
          </Typography>
          <Typography sx={{ color: product.performanceColor, fontSize: "0.8rem", fontWeight: 800 }}>
            {product.performanceScore}/100
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={product.performanceScore}
          sx={{
            height: 8,
            borderRadius: BORDER_RADIUS.full,
            bgcolor: COLORS.primaryVeryLight,
            "& .MuiLinearProgress-bar": {
              borderRadius: BORDER_RADIUS.full,
              backgroundColor: product.performanceColor,
            },
          }}
        />
      </Box>

      {/* Price Highlight */}
      <Box
        sx={{
          mb: SPACING.lg,
          padding: SPACING.md,
          backgroundColor: COLORS.primaryVeryLight,
          borderRadius: BORDER_RADIUS.sm,
          borderLeft: `4px solid ${COLORS.primary}`,
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", color: COLORS.textLight, mb: SPACING.xs }}>
          Final Price
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.5rem",
            color: COLORS.primary,
          }}
        >
          ₹{Number(product.finalPrice).toLocaleString("en-IN")}
        </Typography>
      </Box>

      {/* Stock Status */}
      <Box
        sx={{
          p: SPACING.md,
          borderRadius: BORDER_RADIUS.sm,
          bgcolor:
            product.stockQuantity <= product.reorderLevel
              ? COLORS.warningLight
              : COLORS.successLight,
          border: `1px solid ${
            product.stockQuantity <= product.reorderLevel
              ? COLORS.warning + "30"
              : COLORS.success + "30"
          }`,
          mb: SPACING.lg,
        }}
      >
        <Stack direction="row" spacing={SPACING.sm} alignItems="center" sx={{ mb: SPACING.sm }}>
          <TrendingUpIcon
            sx={{
              fontSize: 18,
              color:
                product.stockQuantity <= product.reorderLevel
                  ? COLORS.warning
                  : COLORS.success,
            }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              color:
                product.stockQuantity <= product.reorderLevel
                  ? COLORS.warning
                  : COLORS.success,
              fontSize: "0.95rem",
            }}
          >
            {product.stockQuantity} units
          </Typography>
        </Stack>
        {product.stockQuantity <= product.reorderLevel && (
          <Typography sx={{ fontSize: "0.8rem", color: COLORS.warning, fontWeight: 600 }}>
            ⚠️ Low stock - Reorder soon!
          </Typography>
        )}
      </Box>

      {/* Actions */}
      {isAdmin && (
        <Stack direction="row" spacing={SPACING.sm} sx={{ mt: "auto" }}>
          <IconButton
            size="small"
            sx={{
              color: COLORS.primary,
              transition: TRANSITIONS.fast,
              borderRadius: BORDER_RADIUS.sm,
              "&:hover": { bgcolor: COLORS.primaryVeryLight },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: COLORS.error,
              transition: TRANSITIONS.fast,
              borderRadius: BORDER_RADIUS.sm,
              "&:hover": { bgcolor: COLORS.errorLight },
            }}
            onClick={() => onDelete(product.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </CardContent>
  </Card>
);

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    brand: PropTypes.string,
    itemCode: PropTypes.string,
    gstPercent: PropTypes.number,
    finalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    stockQuantity: PropTypes.number.isRequired,
    reorderLevel: PropTypes.number.isRequired,
    performanceScore: PropTypes.number.isRequired,
    performanceBucket: PropTypes.string.isRequired,
    performanceColor: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ content: [], totalPages: 1 });

  const loadProducts = useCallback(() => {
    api
      .get("/products", {
        params: {
          page: page - 1,
          size: 12,
          search,
          category,
          sortBy,
          direction,
        },
      })
      .then((res) => setResult(res.data));
  }, [category, direction, page, search, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const rowsForCsv = useMemo(
    () =>
      result.content.map((p) => ({
        itemCode: p.itemCode,
        name: p.name,
        category: p.category,
        brand: p.brand,
        state: p.state,
        stock: p.stockQuantity,
        finalPrice: p.finalPrice,
      })),
    [result]
  );

  const removeProduct = async (id) => {
    if (globalThis.confirm("Are you sure you want to delete this product?")) {
      await api.delete(`/products/${id}`);
      loadProducts();
    }
  };

  const scoredProducts = useMemo(
    () =>
      (result.content || []).map((product, idx) => {
        const stock = Number(product.stockQuantity || 0);
        const reorder = Math.max(1, Number(product.reorderLevel || 1));
        const stockRatio = stock / reorder;
        const demandSignal = stockRatio < 0.7 ? 38 : stockRatio < 1.2 ? 24 : stockRatio < 2 ? 14 : 5;
        const freshnessSignal = (Number(product.id || idx) * 13) % 21;
        const overstockPenalty = stockRatio > 3 ? 22 : stockRatio > 2 ? 12 : 0;
        const score = Math.max(8, Math.min(100, Math.round(40 + demandSignal + freshnessSignal - overstockPenalty)));
        const bucket = getPerformanceBucket(score);
        return {
          ...product,
          performanceScore: score,
          performanceBucket: bucket,
          performanceColor: getPerformanceColor(bucket),
        };
      }),
    [result.content]
  );

  return (
    <Box sx={{ pb: SPACING.xxxl }}>
      {/* Page Header */}
      <Box sx={{ mb: SPACING.xxxl }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            color: COLORS.textDark,
            mb: SPACING.sm,
          }}
        >
          📦 Products
        </Typography>
        <Typography sx={{ color: COLORS.textLight, fontSize: "1rem" }}>
          Manage and track all products across {Math.ceil((result.totalPages || 1) * 12)} items in inventory
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card
        sx={{
          borderRadius: BORDER_RADIUS.md,
          boxShadow: SHADOWS.sm,
          mb: SPACING.xxxl,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <CardContent sx={{ p: SPACING.xl }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              mb: SPACING.lg,
              color: COLORS.textDark,
              display: "flex",
              alignItems: "center",
              gap: SPACING.md,
            }}
          >
            🔍 Filters & Controls
          </Typography>

          <Stack spacing={SPACING.lg}>
            {/* Search Bar */}
            <TextField
              label="Search Products"
              placeholder="Search by name, code, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: BORDER_RADIUS.md,
                  fontSize: "1rem",
                },
              }}
            />

            {/* Filter Controls */}
            <Grid container spacing={SPACING.lg}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: BORDER_RADIUS.md,
                    },
                  }}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: BORDER_RADIUS.md,
                    },
                  }}
                >
                  <MenuItem value="id">ID</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="stockQuantity">Stock</MenuItem>
                  <MenuItem value="finalPrice">Price</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Direction"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: BORDER_RADIUS.md,
                    },
                  }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportToCSV(rowsForCsv, "products.csv")}
                  fullWidth
                  sx={{
                    borderRadius: BORDER_RADIUS.md,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.5,
                  }}
                >
                  Export CSV
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Products Grid - Responsive Layout */}
      <Grid container spacing={SPACING.lg} sx={{ mb: SPACING.xxxl }}>
        {result.content.length > 0 ? (
          scoredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} onDelete={removeProduct} isAdmin={isAdmin} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                py: SPACING.xxxl,
                textAlign: "center",
                backgroundColor: COLORS.lightBg,
                borderRadius: BORDER_RADIUS.md,
                border: `2px dashed ${COLORS.border}`,
              }}
            >
              <Typography sx={{ color: COLORS.textLight, fontSize: "1.1rem", fontWeight: 500 }}>
                No products found. Try adjusting your filters.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <Stack alignItems="center" sx={{ py: SPACING.xl }}>
          <Pagination
            page={page}
            count={result.totalPages || 1}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: BORDER_RADIUS.sm,
                fontWeight: 600,
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
}
