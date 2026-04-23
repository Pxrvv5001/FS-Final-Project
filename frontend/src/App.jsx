import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductsPage from "./pages/ProductsPage";
import StockPage from "./pages/StockPage";
import SuppliersPage from "./pages/SuppliersPage";

function ProtectedShell({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedShell>
                    <DashboardPage />
                  </ProtectedShell>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedShell>
                    <ProductsPage />
                  </ProtectedShell>
                }
              />
              <Route
                path="/stock"
                element={
                  <ProtectedShell>
                    <StockPage />
                  </ProtectedShell>
                }
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route
                path="/suppliers"
                element={
                  <ProtectedShell>
                    <SuppliersPage />
                  </ProtectedShell>
                }
              />
            </Route>

            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
