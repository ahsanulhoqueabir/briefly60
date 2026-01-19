import { useCallback } from "react";
import { useError } from "@/contexts/ErrorContext";

interface UseErrorHandlerOptions {
  showToast?: boolean;
  context?: string;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { handleError, handleApiError } = useError();
  const { showToast = true, context } = options;

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      errorMessage?: string,
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        if (showToast) {
          if (error instanceof Error && error.message.includes("API")) {
            handleApiError(error, context);
          } else {
            handleError(error as Error, context);
          }
        } else {
          console.error(`Error in ${context || "component"}:`, error);
        }
        return null;
      }
    },
    [handleError, handleApiError, showToast, context],
  );

  const handleSyncError = useCallback(
    (error: Error | string, customMessage?: string) => {
      const errorToHandle =
        typeof error === "string" ? new Error(error) : error;

      if (showToast) {
        handleError(errorToHandle, context);
      } else {
        console.error(`Error in ${context || "component"}:`, errorToHandle);
      }
    },
    [handleError, showToast, context],
  );

  const withErrorHandling = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends any[], R>(
      fn: (...args: T) => R | Promise<R>,
      errorMessage?: string,
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          const result = fn(...args);
          if (result instanceof Promise) {
            return await result;
          }
          return result;
        } catch (error) {
          handleSyncError(error as Error, errorMessage);
          return null;
        }
      };
    },
    [handleSyncError],
  );

  return {
    handleAsyncError,
    handleSyncError,
    withErrorHandling,
  };
};
