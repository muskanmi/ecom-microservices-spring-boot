import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:8081/api/auth",
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

export default authApi;
