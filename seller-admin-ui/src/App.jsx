import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Settings from "./pages/Settings";

import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import ProductDetails from "./pages/ProductDetails";

import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import NotFound from "./pages/NotFound";

function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#FFFCF4] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#263331]">Access Denied</h1>

        <p className="mt-3 text-[#7A817B]">
          Seller access is required to use this area.
        </p>

        <a
          href="/login"
          className="inline-block mt-6 px-5 py-3 bg-[#164E4A] text-white rounded"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================
            PUBLIC AUTH ROUTES
        ======================================== */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ========================================
            PROTECTED SELLER ADMIN
        ======================================== */}

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* DASHBOARD */}
            <Route index element={<Dashboard />} />

            {/* SELLER ACCOUNT */}
            <Route path="account" element={<Account />} />

            {/* SETTINGS */}
            <Route path="settings" element={<Settings />} />

            {/* PRODUCTS */}
            <Route path="products" element={<Products />} />

            {/* PRODUCT DETAILS */}
            <Route path="products/:productId" element={<ProductDetails />} />

            {/* EDIT PRODUCT */}
            <Route path="products/:productId/edit" element={<ProductEdit />} />

            {/* CREATE PRODUCT */}
            <Route path="products/new" element={<ProductForm />} />

            {/* ORDERS */}
            <Route path="orders" element={<Orders />} />

            {/* ORDER DETAILS */}
            <Route path="orders/:orderId" element={<OrderDetails />} />

            {/* ADMIN 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* ========================================
            UNKNOWN URL
        ======================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
