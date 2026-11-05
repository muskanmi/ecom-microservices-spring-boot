import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import CouponsPage from "./pages/CouponsPage";
import ProductsPage from "./pages/ProductsPage";
import DealsPage from "./pages/DealsPage";

import MainLayout from "./components/MainLayout";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Marketplace layout */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Product listing and search */}
                <Route path="/products" element={<ProductsPage />} />

                <Route path="/search" element={<ProductsPage />} />

                {/* Product details */}
                <Route
                  path="/products/:productId"
                  element={<ProductDetailsPage />}
                />

                {/* Today's deals */}
                <Route path="/deals" element={<DealsPage />} />

                {/* Wishlist and cart */}
                <Route path="/wishlist" element={<WishlistPage />} />

                <Route path="/cart" element={<CartPage />} />

                {/* User profile */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* Checkout and orders */}
                <Route path="/checkout" element={<CheckoutPage />} />

                <Route path="/orders" element={<OrdersPage />} />

                <Route path="/orders/:orderId" element={<OrderDetailsPage />} />

                {/* Coupons */}
                <Route path="/coupons" element={<CouponsPage />} />

                {/* Payment */}
                <Route
                  path="/payment/success"
                  element={<PaymentSuccessPage />}
                />

                <Route path="/payment/cancel" element={<PaymentCancelPage />} />
              </Route>

              {/* Default route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Unknown routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
