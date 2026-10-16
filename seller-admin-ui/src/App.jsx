import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import ProductDetails from "./pages/ProductDetails";

import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================
            PROTECTED SELLER ADMIN
        ======================================== */}

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* DASHBOARD */}
            <Route index element={<Dashboard />} />

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

            {/* SELLER ADMIN 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* ========================================
            UNAUTHORIZED
        ======================================== */}

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen bg-[#FFFCF4] flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-[#263331]">
                  Access Denied
                </h1>

                <p className="mt-3 text-[#7A817B]">
                  Seller access is required to use this area.
                </p>
              </div>
            </div>
          }
        />

        {/* ========================================
            ROOT
        ======================================== */}

        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* ========================================
            UNKNOWN URL
        ======================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
