import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global response error handling
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (!error.response) {
      error.userMessage =
        "Unable to connect to the server. Please check if the service is running.";
    } else {
      const status = error.response.status;

      switch (status) {
        case 400:
          error.userMessage =
            "Invalid request. Please check the entered details.";
          break;

        case 401:
          error.userMessage = "You are not authorized to perform this action.";
          break;

        case 403:
          error.userMessage =
            "You do not have permission to perform this action.";
          break;

        case 404:
          error.userMessage = "The requested resource was not found.";
          break;

        case 409:
          error.userMessage =
            "This operation could not be completed because of a conflict.";
          break;

        case 500:
          error.userMessage =
            "Something went wrong on the server. Please try again.";
          break;

        default:
          error.userMessage = "Something went wrong. Please try again.";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
