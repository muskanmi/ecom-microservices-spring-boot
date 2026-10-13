import api from "./api";

// ============================================================
// PRODUCTS
// ============================================================

export const getProducts = () => api.get("/api/admin/products");

export const getProduct = (productId) =>
  api.get(`/api/admin/products/${productId}`);

export const createProduct = (product) =>
  api.post("/api/admin/products", product);

export const updateProduct = (productId, product) =>
  api.put(`/api/admin/products/${productId}`, product);

export const deleteProduct = (productId) =>
  api.delete(`/api/admin/products/${productId}`);

// ============================================================
// PRODUCT IMAGES
// ============================================================

export const uploadProductImages = (productId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post(`/api/admin/products/${productId}/images`, formData, {
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
    `/api/admin/products/${productId}/images/${imageId}`,
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
  api.delete(`/api/admin/products/${productId}/images/${imageId}`);
