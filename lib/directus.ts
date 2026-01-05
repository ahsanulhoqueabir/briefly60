import { directus } from "@/config/env";
import axios from "axios";

const directusApi = axios.create({
  baseURL: directus.url,
  headers: {
    Authorization: `Bearer ${directus.token}`,
    "Content-Type": "application/json",
  },
});

// Add response interceptor for better error handling
directusApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error("Directus API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // Enhance error with more details
    if (error.response) {
      // Server responded with error status
      const errorMessage =
        error.response.data?.errors?.[0]?.message ||
        error.response.data?.message ||
        error.response.statusText ||
        "Server error occurred";

      error.message = `Directus Error (${error.response.status}): ${errorMessage}`;
    } else if (error.request) {
      // Request made but no response received
      error.message =
        "Directus server is not responding. Please check if the server is running and the URL is correct.";
    } else {
      // Something else happened
      error.message = `Request setup error: ${error.message}`;
    }

    return Promise.reject(error);
  }
);

export default directusApi;
