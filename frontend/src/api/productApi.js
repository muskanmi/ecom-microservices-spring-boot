import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

// Get all products
export const getProducts = () => axios.get(API_URL);

// Get product by ID
export const getProductById = (id) => axios.get(`${API_URL}/${id}`);

// Create product
export const createProduct = (data, token) =>
  axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update product
export const updateProduct = (id, data, token) =>
  axios.put(`${API_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Delete product
export const deleteProduct = (id, token) =>
  axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Upload product images
export const uploadProductImages = (id, files, token) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return axios.post(`${API_URL}/${id}/images`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete product image
export const deleteProductImage = (productId, imageId, token) =>
  axios.delete(`${API_URL}/${productId}/images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
