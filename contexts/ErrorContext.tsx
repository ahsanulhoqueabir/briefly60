"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";

interface AppError {
  id: string;
  message: string;
  type: "error" | "warning" | "info";
  timestamp: Date;
  context?: string;
  details?: any;
}

interface ErrorState {
  errors: AppError[];
  isOnline: boolean;
}

type ErrorAction =
  | { type: "ADD_ERROR"; payload: Omit<AppError, "id" | "timestamp"> }
  | { type: "REMOVE_ERROR"; payload: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_ONLINE_STATUS"; payload: boolean };

interface ErrorContextType {
  errors: AppError[];
  isOnline: boolean;
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  handleError: (error: Error | string, context?: string) => void;
  handleApiError: (error: any, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case "ADD_ERROR":
      const newError: AppError = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      return {
        ...state,
        errors: [...state.errors, newError].slice(-10), // Keep only last 10 errors
      };
    case "REMOVE_ERROR":
      return {
        ...state,
        errors: state.errors.filter((error) => error.id !== action.payload),
      };
    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: [],
      };
    case "SET_ONLINE_STATUS":
      return {
        ...state,
        isOnline: action.payload,
      };
    default:
      return state;
  }
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, {
    errors: [],
    isOnline: true,
  });

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () =>
      dispatch({ type: "SET_ONLINE_STATUS", payload: true });
    const handleOffline = () =>
      dispatch({ type: "SET_ONLINE_STATUS", payload: false });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addError = useCallback((error: Omit<AppError, "id" | "timestamp">) => {
    dispatch({ type: "ADD_ERROR", payload: error });

    // Show toast notification only in browser environment
    if (typeof window !== "undefined") {
      try {
        // Dynamic import of sonner to avoid SSR issues
        import("sonner").then(({ toast }) => {
          if (error.type === "error") {
            toast.error(error.message);
          } else if (error.type === "warning") {
            toast.warning(error.message);
          } else {
            toast.info(error.message);
          }
        });
      } catch (toastError) {
        console.warn("Toast notification failed:", toastError);
      }
    }
  }, []);

  const removeError = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ERROR", payload: id });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
  }, []);

  const handleError = useCallback(
    (error: Error | string, context?: string) => {
      const message = typeof error === "string" ? error : error.message;
      const details =
        typeof error === "object"
          ? {
              stack: error.stack,
              name: error.name,
            }
          : undefined;

      addError({
        message,
        type: "error",
        context,
        details,
      });

      // Log to console for debugging
      console.error(`[${context || "Unknown"}] Error:`, error);
    },
    [addError],
  );

  const handleApiError = useCallback(
    (error: any, context?: string) => {
      let message = "An unexpected error occurred";
      let type: "error" | "warning" = "error";

      if (error?.message) {
        message = error.message;
      } else if (error?.status) {
        switch (error.status) {
          case 400:
            message = "Invalid request. Please check your input.";
            type = "warning";
            break;
          case 401:
            message = "Please log in to continue.";
            type = "warning";
            break;
          case 403:
            message = "You don't have permission to perform this action.";
            type = "warning";
            break;
          case 404:
            message = "The requested resource was not found.";
            type = "warning";
            break;
          case 429:
            message = "Too many requests. Please try again later.";
            type = "warning";
            break;
          case 500:
            message = "Server error. Please try again later.";
            break;
          default:
            message = `Request failed with status ${error.status}`;
        }
      }

      if (!state.isOnline) {
        message = "No internet connection. Please check your network.";
        type = "warning";
      }

      addError({
        message,
        type,
        context: context || "API Error",
        details: error,
      });
    },
    [addError, state.isOnline],
  );

  const value: ErrorContextType = {
    errors: state.errors,
    isOnline: state.isOnline,
    addError,
    removeError,
    clearErrors,
    handleError,
    handleApiError,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
