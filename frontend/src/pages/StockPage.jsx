import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import InventoryIcon from "@mui/icons-material/Inventory2";
import DownloadIcon from "@mui/icons-material/Download";
import WarningIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { api } from "../api/client";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS } from "../theme/designSystem";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getTransactionChipColor = (transactionType) => {
  if (transactionType === "PURCHASE") return "primary";
  if (transactionType === "SALE") return "secondary";
  return "info";
};

export default function StockPage() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ productId: "", type: "OPENING", quantity: 1 });
  const [latestInvoice, setLatestInvoice] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(() => {
    api.get("/products", { params: { page: 0, size: 200, sortBy: "id", direction: "asc" } }).then((res) => {
      setProducts(res.data.content || []);
      setForm((prev) => {
        if (!prev.productId && res.data.content?.[0]?.id) {
          return { ...prev, productId: String(res.data.content[0].id) };
        }
        return prev;
      });
    });
    api.get("/stock/history").then((res) => setHistory(res.data));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitEntry = async () => {
    try {
      setError("");
      const response = await api.post("/stock/entry", {
        productId: form.productId,
        type: form.type,
        quantity: form.quantity,
      });
      const invoiceResponse = await api.get(`/stock/invoice/${response.data.invoiceNumber}`);
      setLatestInvoice(invoiceResponse.data);
      loadData();
      setForm({ ...form, quantity: 1 });
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to process stock entry");
    }
  };

  const lowStockRows = useMemo(
    () => products.filter((p) => p.stockQuantity <= p.reorderLevel),
    [products]
  );

  const invoiceSummary = useMemo(() => {
    if (!latestInvoice) {
      return null;
    }

    const entries = (latestInvoice.entries || []).map((entry, index) => {
      const qty = Number(entry?.quantity || 0);
      const rate = Number(entry?.unitPrice || entry?.price || entry?.product?.finalPrice || 0);
      const taxable = qty * rate;
      const gstPercent = Number(entry?.gstPercent || entry?.product?.gstPercent || 18);
      const gstAmount = (taxable * gstPercent) / 100;
      const lineTotal = taxable + gstAmount;
      return {
        id: entry?.id || index + 1,
        name: entry?.product?.name || entry?.productName || `Item ${index + 1}`,
        qty,
        rate,
        gstPercent,
        gstAmount,
        taxable,
        lineTotal,
      };
    });

    const taxableTotal = entries.reduce((sum, row) => sum + row.taxable, 0);
    const gstTotal = entries.reduce((sum, row) => sum + row.gstAmount, 0);
    const grandTotal = Number(latestInvoice.grandTotal || taxableTotal + gstTotal);

    return {
      entries,
      taxableTotal,
      gstTotal,
      grandTotal,
    };
  }, [latestInvoice]);

  const downloadInvoicePdf = useCallback(() => {
    if (!latestInvoice || !invoiceSummary) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Smart Inventory Pro India", 40, 45);
    doc.setFontSize(11);
    doc.text(`Invoice: ${latestInvoice.invoiceNumber}`, 40, 68);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 40, 86);

    autoTable(doc, {
      startY: 105,
      head: [["Product", "Qty", "Rate", "Taxable", "GST%", "GST Amount", "Line Total"]],
      body: invoiceSummary.entries.map((row) => [
        row.name,
        row.qty,
        `₹${row.rate.toLocaleString("en-IN")}`,
        `₹${row.taxable.toLocaleString("en-IN")}`,
        `${row.gstPercent}%`,
        `₹${row.gstAmount.toLocaleString("en-IN")}`,
        `₹${row.lineTotal.toLocaleString("en-IN")}`,
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const finalY = doc.lastAutoTable?.finalY || 500;
    doc.setFontSize(11);
    doc.text(`Taxable Total: ₹${invoiceSummary.taxableTotal.toLocaleString("en-IN")}`, 40, finalY + 24);
    doc.text(`GST Total: ₹${invoiceSummary.gstTotal.toLocaleString("en-IN")}`, 40, finalY + 42);
    doc.setFontSize(13);
    doc.text(`Grand Total: ₹${invoiceSummary.grandTotal.toLocaleString("en-IN")}`, 40, finalY + 66);

    doc.save(`${latestInvoice.invoiceNumber || "invoice"}.pdf`);
  }, [invoiceSummary, latestInvoice]);

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
          📊 Stock Management
        </Typography>
        <Typography sx={{ color: COLORS.textLight, fontSize: "1rem" }}>
          Manage inventory entries, track history, and monitor stock alerts
        </Typography>
      </Box>

      {/* Entry Form Card - Full Width */}
      <Card
        sx={{
          borderRadius: BORDER_RADIUS.md,
          boxShadow: SHADOWS.sm,
          mb: SPACING.xxxl,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <CardContent sx={{ p: SPACING.xl }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.md, mb: SPACING.lg }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: BORDER_RADIUS.md,
                bgcolor: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.primary,
              }}
            >
              <AddIcon />
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.2rem",
                color: COLORS.textDark,
              }}
            >
              New Stock Entry
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: SPACING.lg,
                borderRadius: BORDER_RADIUS.md,
                backgroundColor: COLORS.errorLight,
                border: `1px solid ${COLORS.error}30`,
                color: COLORS.error,
                "& .MuiAlert-icon": {
                  color: COLORS.error,
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Stack direction={{ xs: "column", md: "row" }} spacing={SPACING.lg} alignItems="flex-end">
            <TextField
              select
              label="Product"
              value={form.productId}
              onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: BORDER_RADIUS.md },
              }}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.itemCode})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Transaction Type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                "& .MuiOutlinedInput-root": { borderRadius: BORDER_RADIUS.md },
              }}
            >
              <MenuItem value="PURCHASE">
                <AddIcon sx={{ mr: 1, fontSize: 18 }} />
                Purchase
              </MenuItem>
              <MenuItem value="SALE">
                <RemoveIcon sx={{ mr: 1, fontSize: 18 }} />
                Sale
              </MenuItem>
              <MenuItem value="OPENING">
                <InventoryIcon sx={{ mr: 1, fontSize: 18 }} />
                Opening Stock
              </MenuItem>
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": { borderRadius: BORDER_RADIUS.md },
              }}
              slotProps={{ htmlInput: { min: 1 } }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={submitEntry}
              sx={{
                borderRadius: BORDER_RADIUS.md,
                textTransform: "none",
                fontWeight: 700,
                px: SPACING.xl,
                minWidth: { xs: "100%", sm: "auto" },
              }}
            >
              Submit Entry
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Content - 2 Columns */}
      <Grid container spacing={SPACING.lg} sx={{ mb: SPACING.xxxl }}>
        {/* Left Column - Stock History */}
        <Grid item xs={12} lg={7}>
          <Card
            sx={{
              borderRadius: BORDER_RADIUS.md,
              boxShadow: SHADOWS.sm,
              transition: TRANSITIONS.normal,
              border: `1px solid ${COLORS.border}`,
              "&:hover": { boxShadow: SHADOWS.md },
            }}
          >
            <CardContent sx={{ p: SPACING.xl }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.md, mb: SPACING.lg }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: BORDER_RADIUS.md,
                    bgcolor: COLORS.secondaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.secondary,
                  }}
                >
                  <AssignmentIcon />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: COLORS.textDark,
                  }}
                >
                  Stock History
                </Typography>
              </Box>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: BORDER_RADIUS.md,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: COLORS.primaryLight }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: COLORS.primary,
                          backgroundColor: COLORS.primaryLight,
                        }}
                      >
                        Invoice
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.primary, backgroundColor: COLORS.primaryLight }}>
                        Product
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.primary, backgroundColor: COLORS.primaryLight }}>
                        Type
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: COLORS.primary, backgroundColor: COLORS.primaryLight }}>
                        Qty
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: COLORS.primary,
                          backgroundColor: COLORS.primaryLight,
                        }}
                      >
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.slice(0, 10).map((h) => (
                      <TableRow
                        key={h.id}
                        sx={{
                          transition: TRANSITIONS.fast,
                          "&:hover": {
                            backgroundColor: COLORS.primaryLight,
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{h.invoiceNumber}</TableCell>
                        <TableCell>{h.product?.name}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={h.transactionType}
                            color={getTransactionChipColor(h.transactionType)}
                            variant="outlined"
                            sx={{
                              borderRadius: BORDER_RADIUS.sm,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {h.quantity}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          ₹{Number(h.totalAmount).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Alerts & Invoice */}
        <Grid item xs={12} lg={5}>
          {/* Low Stock Alerts */}
          <Card
            sx={{
              borderRadius: BORDER_RADIUS.md,
              boxShadow: SHADOWS.sm,
              mb: SPACING.lg,
              transition: TRANSITIONS.normal,
              "&:hover": { boxShadow: SHADOWS.md },
            }}
          >
            <CardContent sx={{ p: SPACING.xl }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.md, mb: SPACING.lg }}>
                <WarningIcon sx={{ color: COLORS.warning, fontSize: 24 }} />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "text.primary",
                  }}
                >
                  Low Stock Alerts
                </Typography>
              </Box>

              <Stack spacing={SPACING.md}>
                {lowStockRows.length === 0 ? (
                  <Typography sx={{ color: "text.secondary", py: SPACING.lg }}>
                    ✅ All products are well stocked!
                  </Typography>
                ) : (
                  lowStockRows.slice(0, 6).map((p) => (
                    <Alert
                      key={p.id}
                      severity="warning"
                      sx={{
                        borderRadius: BORDER_RADIUS.md,
                        backgroundColor: COLORS.warning + "15",
                        color: COLORS.textDark,
                        "& .MuiAlert-icon": {
                          color: COLORS.warning,
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {p.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", mt: SPACING.xs }}>
                        {p.stockQuantity} remaining (reorder at {p.reorderLevel})
                      </Typography>
                    </Alert>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Invoice Preview */}
          <Card
            sx={{
              borderRadius: BORDER_RADIUS.md,
              boxShadow: SHADOWS.sm,
              transition: TRANSITIONS.normal,
              "&:hover": { boxShadow: SHADOWS.md },
            }}
          >
            <CardContent sx={{ p: SPACING.xl }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.md, mb: SPACING.lg }}>
                <DownloadIcon sx={{ color: COLORS.primary, fontSize: 24 }} />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "text.primary",
                  }}
                >
                  Latest Invoice
                </Typography>
              </Box>

              {latestInvoice == null ? (
                <Typography sx={{ color: "text.secondary", py: SPACING.lg }}>
                  No invoice generated yet. Submit a stock entry to create one.
                </Typography>
              ) : (
                <Stack spacing={SPACING.md}>
                  <Box
                    sx={{
                      p: SPACING.lg,
                      backgroundColor: COLORS.primaryLight,
                      borderRadius: BORDER_RADIUS.md,
                    }}
                  >
                    <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem", mb: SPACING.xs }}>
                      Invoice Number
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: COLORS.primary }}>
                      {latestInvoice.invoiceNumber}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: SPACING.lg,
                      backgroundColor: COLORS.success + "15",
                      borderRadius: BORDER_RADIUS.md,
                    }}
                  >
                    <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem", mb: SPACING.xs }}>
                      Grand Total
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: COLORS.success }}>
                      ₹{Number(invoiceSummary?.grandTotal || latestInvoice.grandTotal).toLocaleString("en-IN")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: SPACING.lg,
                      backgroundColor: COLORS.warningLight,
                      borderRadius: BORDER_RADIUS.md,
                      border: `1px solid ${COLORS.warning}30`,
                    }}
                  >
                    <Typography sx={{ color: COLORS.textLight, fontSize: "0.85rem", mb: SPACING.xs }}>
                      GST Breakdown
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: COLORS.warning }}>
                      GST Total: ₹{Number(invoiceSummary?.gstTotal || 0).toLocaleString("en-IN")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: COLORS.textLight }}>
                      Taxable Amount: ₹{Number(invoiceSummary?.taxableTotal || 0).toLocaleString("en-IN")}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                    Entries: <strong>{latestInvoice.entries?.length || 0}</strong>
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={downloadInvoicePdf}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: BORDER_RADIUS.md }}
                  >
                    Download Invoice PDF
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
