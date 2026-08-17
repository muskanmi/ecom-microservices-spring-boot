import axios from "axios";

const API_URL = "http://localhost:8081/api/auth";

const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': "application/json"
    }
});

export const registerUser = (data) => {
    return authApi.post("/register", data);
}

export const loginUser = (data) => {
    return authApi.post("/login", data);
}

export const currentUser = (token) => {
    return authApi.get("/me", {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
}

export const updateProfile = (data, token) => {
    return authApi.put("/me", data, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
}

export default authApi;