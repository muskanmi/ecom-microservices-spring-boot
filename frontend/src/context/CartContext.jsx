import { createContext, useContext, useEffect, useState } from "react";
import { getCart, getCartDetails } from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState({
    cartId: null,
    userId: null,
    items: [],
  });

  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user?.id) {
      setCart({
        cartId: null,
        userId: null,
        items: [],
      });

      return;
    }

    try {
      setCartLoading(true);

      const token = localStorage.getItem("token");

      const response = await getCartDetails(token, user.id);

      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.id]);

  const cartItemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        cartItemCount,
        cartLoading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
