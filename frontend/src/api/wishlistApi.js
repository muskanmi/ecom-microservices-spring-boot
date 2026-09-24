import axios from "axios";

const API_URL = "http://localhost:8082/api/wishlist";

/**
 * Add a product to wishlist
 */
export const addToWishlist = (productId, token, userId) => {
  return axios.post(
    `${API_URL}/items`,
    {
      productId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    }
  );
};

/**
 * Get current user's wishlist
 */
export const getWishlist = (token, userId) => {
  return axios.get(
    API_URL,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    }
  );
};

/**
 * Remove an item from wishlist
 */
export const removeFromWishlist = (
  itemId,
  token,
  userId
) => {
  return axios.delete(
    `${API_URL}/items/${itemId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    }
  );
};