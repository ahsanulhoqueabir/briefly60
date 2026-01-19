// API base URL

import { baseurl } from "@/config/env";
import { LocalStorageService } from "@/services/localstorage.services";

// Get token from localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return LocalStorageService.getAuthToken();
}

// Enhanced error class for better error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Network error class
class NetworkError extends Error {
  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

// Timeout error class
class TimeoutError extends Error {
  constructor(message: string = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

// Retry utility with exponential backoff
const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (
      retries > 0 &&
      (error instanceof NetworkError ||
        (error instanceof ApiError && error.status >= 500))
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// API fetch wrapper with enhanced error handling
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await retry(async () => {
      try {
        return await fetch(`${baseurl}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          if (fetchError.name === "AbortError") {
            throw new TimeoutError();
          }
          if (
            fetchError.message.includes("network") ||
            fetchError.message.includes("fetch")
          ) {
            throw new NetworkError();
          }
        }
        throw fetchError;
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== "undefined") {
          LocalStorageService.removeAuthToken();
          localStorage.removeItem("briefly60_user_data");
          window.location.href = "/auth/login";
        }
      }

      // Parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: "An error occurred" };
      }

      const errorMessage =
        errorData.message || getStatusMessage(response.status);
      const errorCode = errorData.code || response.status.toString();

      throw new ApiError(errorMessage, response.status, errorCode, errorData);
    }

    const json = await response.json();

    // If response has a 'data' property, unwrap it
    if (json && typeof json === "object" && "data" in json && json.success) {
      return json.data as T;
    }

    return json;
  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw known errors
    if (
      error instanceof ApiError ||
      error instanceof NetworkError ||
      error instanceof TimeoutError
    ) {
      throw error;
    }

    // Handle unexpected errors
    console.error("Unexpected API error:", error);
    throw new ApiError(
      "An unexpected error occurred",
      0,
      "UNEXPECTED_ERROR",
      error,
    );
  }
}

// Helper function to get user-friendly status messages
function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication required. Please log in.";
    case 403:
      return "Access denied. You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "Conflict. The resource already exists or is in use.";
    case 422:
      return "Invalid data provided. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Internal server error. Please try again later.";
    case 502:
      return "Service temporarily unavailable. Please try again later.";
    case 503:
      return "Service maintenance in progress. Please try again later.";
    default:
      return `Request failed with status ${status}`;
  }
}

// GET request
export async function get<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET" });
}

// POST request
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request
export async function del<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

// PATCH request
export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}
