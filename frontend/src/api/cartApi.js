import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/cart`;

export const addToCart = (data, token, userId) =>
  axios.post(`${API_URL}/items`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
  });

export const getCart = (token, userId) =>
  axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
  });

export const getCartDetails = (token, userId) =>
  axios.get(`${API_URL}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
  });

export const updateCartItem = (itemId, quantity, token, userId) =>
  axios.put(
    `${API_URL}/items/${itemId}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    },
  );

export const removeCartItem = (itemId, token, userId) =>
  axios.delete(`${API_URL}/items/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
  });
