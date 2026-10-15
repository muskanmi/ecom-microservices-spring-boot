import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import ProductDetails from "./pages/ProductDetails";

import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================
            SELLER ADMIN
        ======================================== */}

        <Route path="/admin" element={<AdminLayout />}>
          {/* ========================================
              DASHBOARD
              URL: /admin
          ======================================== */}

          <Route index element={<Dashboard />} />

          {/* ========================================
              PRODUCTS
              URL: /admin/products
          ======================================== */}

          <Route path="products" element={<Products />} />

          {/* ========================================
              PRODUCT DETAILS
              URL: /admin/products/:productId
          ======================================== */}

          <Route path="products/:productId" element={<ProductDetails />} />

          {/* ========================================
              EDIT PRODUCT
              URL: /admin/products/:productId/edit
          ======================================== */}

          <Route path="products/:productId/edit" element={<ProductEdit />} />

          {/* ========================================
              CREATE PRODUCT
              URL: /admin/products/new
          ======================================== */}

          <Route path="products/new" element={<ProductForm />} />

          {/* ========================================
              ORDERS
              URL: /admin/orders
          ======================================== */}

          <Route path="orders" element={<Orders />} />

          {/* ========================================
              ORDER DETAILS
              URL: /admin/orders/:orderId
          ======================================== */}

          <Route path="orders/:orderId" element={<OrderDetails />} />
        </Route>

        {/* ========================================
            UNKNOWN URL
        ======================================== */}

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
