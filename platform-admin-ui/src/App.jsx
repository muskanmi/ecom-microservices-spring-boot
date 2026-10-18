import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SellerManagementPage from "./pages/SellerManagementPage";
import NotFoundPage from "./pages/NotFoundPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import MarketplaceOrdersPage from "./pages/MarketplaceOrdersPage";
import CatalogManagementPage from "./pages/CatalogManagementPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sellers" element={<SellerManagementPage />} />
          <Route path="/customers" element={<CustomerManagementPage />} />
          <Route path="/orders" element={<MarketplaceOrdersPage />} />
          <Route path="/catalog" element={<CatalogManagementPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
