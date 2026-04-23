import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
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
  Alert,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { api } from "../api/client";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS } from "../theme/designSystem";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", state: "", contactEmail: "", phone: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = () => api.get("/suppliers").then((res) => setSuppliers(res.data));

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.name || !form.city || !form.state || !form.contactEmail || !form.phone) {
      setError("All fields are required");
      return;
    }
    try {
      setError("");
      await api.post("/suppliers", form);
      setSuccess("Supplier added successfully!");
      setForm({ name: "", city: "", state: "", contactEmail: "", phone: "" });
      load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add supplier");
    }
  };

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
          🚚 Supplier Management
        </Typography>
        <Typography sx={{ color: COLORS.textLight, fontSize: "1rem" }}>
          Manage suppliers and maintain contact information
        </Typography>
      </Box>

      {/* Success/Error Alerts */}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: SPACING.lg,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: COLORS.successLight,
            color: COLORS.success,
            border: `1px solid ${COLORS.success}30`,
            "& .MuiAlert-icon": {
              color: COLORS.success,
            },
          }}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: SPACING.lg,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: COLORS.errorLight,
            color: COLORS.error,
            border: `1px solid ${COLORS.error}30`,
            "& .MuiAlert-icon": {
              color: COLORS.error,
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Main Grid - 2 columns */}
      <Grid container spacing={SPACING.lg}>
        {/* Left Column - Add Supplier Form */}
        <Grid item xs={12} md={5} lg={4}>
          <Card
            sx={{
              borderRadius: BORDER_RADIUS.md,
              boxShadow: SHADOWS.sm,
              transition: TRANSITIONS.normal,
              position: "sticky",
              top: 100,
              border: `1px solid ${COLORS.border}`,
              "&:hover": {
                boxShadow: SHADOWS.md,
              },
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
                  New Supplier
                </Typography>
              </Box>

              <Stack spacing={SPACING.lg}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: COLORS.textDark,
                      mb: SPACING.xs,
                    }}
                  >
                    Supplier Name
                  </Typography>
                  <TextField
                    placeholder="Enter supplier name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: BORDER_RADIUS.md,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: COLORS.textDark,
                      mb: SPACING.xs,
                    }}
                  >
                    City
                  </Typography>
                  <TextField
                    placeholder="e.g., Mumbai"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: BORDER_RADIUS.md,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: COLORS.textDark,
                      mb: SPACING.xs,
                    }}
                  >
                    State
                  </Typography>
                  <TextField
                    placeholder="e.g., Maharashtra"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: BORDER_RADIUS.md,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: COLORS.textDark,
                      mb: SPACING.xs,
                    }}
                  >
                    Email Address
                  </Typography>
                  <TextField
                    placeholder="supplier@example.com"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                    fullWidth
                    variant="outlined"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: COLORS.primary, mr: SPACING.sm, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: BORDER_RADIUS.md,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: COLORS.textDark,
                      mb: SPACING.xs,
                    }}
                  >
                    Phone Number
                  </Typography>
                  <TextField
                    placeholder="+91 XXXXXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    fullWidth
                    variant="outlined"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: COLORS.secondary, mr: SPACING.sm, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: BORDER_RADIUS.md,
                      },
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={save}
                  sx={{
                    borderRadius: BORDER_RADIUS.md,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.5,
                    mt: SPACING.lg,
                  }}
                >
                  Add Supplier
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Supplier List Table */}
        <Grid item xs={12} md={7} lg={8}>
          <Card
            sx={{
              borderRadius: BORDER_RADIUS.md,
              boxShadow: SHADOWS.sm,
              transition: TRANSITIONS.normal,
              border: `1px solid ${COLORS.border}`,
              "&:hover": {
                boxShadow: SHADOWS.md,
              },
            }}
          >
            <CardContent sx={{ p: SPACING.xl, pb: 0 }}>
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
                  <AssignmentIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: COLORS.textDark,
                  }}
                >
                  Suppliers List
                </Typography>
              </Box>

              {suppliers.length === 0 ? (
                <Box sx={{ py: SPACING.xxxl, textAlign: "center" }}>
                  <Typography sx={{ color: COLORS.textLight, mb: SPACING.lg, fontSize: "1rem" }}>
                    No suppliers yet. Add one using the form on the left.
                  </Typography>
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    boxShadow: "none",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: BORDER_RADIUS.md,
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primaryLight }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: COLORS.primary,
                            backgroundColor: COLORS.primaryLight,
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: COLORS.primary,
                            backgroundColor: COLORS.primaryLight,
                          }}
                        >
                          Location
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: COLORS.primary,
                            backgroundColor: COLORS.primaryLight,
                          }}
                        >
                          Contact
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow
                          key={supplier.id}
                          sx={{
                            transition: TRANSITIONS.fast,
                            "&:hover": {
                              backgroundColor: COLORS.primaryLight,
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              py: SPACING.lg,
                              color: COLORS.textDark,
                            }}
                          >
                            {supplier.name}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                              <LocationOnIcon
                                sx={{
                                  fontSize: 18,
                                  color: COLORS.secondary,
                                }}
                              />
                              <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                                {supplier.city}, {supplier.state}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={SPACING.xs}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                                <EmailIcon
                                  sx={{
                                    fontSize: 16,
                                    color: COLORS.primary,
                                  }}
                                />
                                <Typography sx={{ fontSize: "0.85rem", color: COLORS.primary, fontWeight: 500 }}>
                                  {supplier.contactEmail}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
                                <PhoneIcon
                                  sx={{
                                    fontSize: 16,
                                    color: COLORS.secondary,
                                  }}
                                />
                                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                                  {supplier.phone}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
