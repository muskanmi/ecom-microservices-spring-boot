import api from "./api";

// ============================================================
// PRODUCTS
// ============================================================

export const getProducts = () => api.get("/api/seller/products");

export const getProduct = (productId) =>
  api.get(`/api/seller/products/${productId}`);

export const createProduct = (product) =>
  api.post("/api/seller/products", product);

export const updateProduct = (productId, product) =>
  api.put(`/api/seller/products/${productId}`, product);

export const deleteProduct = (productId) =>
  api.delete(`/api/seller/products/${productId}`);

// ============================================================
// PRODUCT IMAGES
// ============================================================

export const uploadProductImages = (productId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post(`/api/seller/products/${productId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============================================================
// REPLACE / UPDATE EXISTING IMAGE
// ============================================================

export const updateProductImage = (productId, imageId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.put(
    `/api/seller/products/${productId}/images/${imageId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

// ============================================================
// DELETE EXISTING IMAGE
// ============================================================

export const deleteProductImage = (productId, imageId) =>
  api.delete(`/api/seller/products/${productId}/images/${imageId}`);
