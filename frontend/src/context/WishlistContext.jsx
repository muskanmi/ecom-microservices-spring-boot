import { createContext, useContext, useEffect, useState } from "react";

import { getWishlist } from "../api/wishlistApi";

import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState({
    wishlistId: null,
    userId: null,
    items: [],
  });

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user?.id) {
      setWishlist({
        wishlistId: null,
        userId: null,
        items: [],
      });

      return;
    }

    try {
      setWishlistLoading(true);

      const token = localStorage.getItem("token");

      const response = await getWishlist(token, user.id);

      console.log(response, "response");

      setWishlist(response.data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  const wishlistItemCount = wishlist.items.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        setWishlist,
        wishlistItemCount,
        wishlistLoading,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
};
