export interface AppError {
  id: string;
  message: string;
  type: "error" | "warning" | "info";
  timestamp: Date;
  context?: string;
  details?: any;
}

export interface ErrorState {
  errors: AppError[];
  isOnline: boolean;
}

export type ErrorAction =
  | { type: "ADD_ERROR"; payload: Omit<AppError, "id" | "timestamp"> }
  | { type: "REMOVE_ERROR"; payload: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_ONLINE_STATUS"; payload: boolean };

export interface ErrorContextType {
  errors: AppError[];
  isOnline: boolean;
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  handleError: (error: Error | string, context?: string) => void;
  handleApiError: (error: any, context?: string) => void;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}
