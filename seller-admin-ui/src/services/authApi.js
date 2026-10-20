import axios from "axios";

const authApi = axios.create({
  baseURL: `${import.meta.env.VITE_ADMIN_API_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerSeller = (data) => {
  return authApi.post("/register", {
    ...data,
    role: "SELLER",
  });
};

export const loginUser = (data) => {
  return authApi.post("/login", data);
};

export const currentUser = (token) => {
  return authApi.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ========================================
   PROFILE
======================================== */

export const updateProfile = (token, data) => {
  return authApi.put("/me", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ========================================
   SELLER PROFILE
======================================== */

export const getSellerProfile = (token) => {
  return authApi.get("/seller-profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createSellerProfile = (token, data) => {
  return authApi.post("/seller-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateSellerProfile = (token, data) => {
  return authApi.put("/seller-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ========================================
   PASSWORD
======================================== */

export const changePassword = (token, data) => {
  return authApi.put("/me/password", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ========================================
   AVATAR
======================================== */

export const uploadAvatar = (token, file) => {
  const formData = new FormData();

  formData.append("file", file);

  return authApi.post("/me/avatar", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export default authApi;
