"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home, Bug } from "lucide-react";
import React from "react";

interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
  showDetails = false,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={retry} className="flex items-center gap-2 flex-1">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2 flex-1"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>

        {showDetails && error && (
          <details className="bg-muted p-3 rounded-lg">
            <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Error Details
            </summary>
            <pre className="mt-2 text-xs overflow-auto text-muted-foreground whitespace-pre-wrap">
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// Compact error fallback for smaller components
export const CompactErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  title = "Error occurred",
}) => {
  return (
    <div className="flex items-center justify-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">{title}</p>
          {error?.message && (
            <p className="text-xs text-muted-foreground mt-1">
              {error.message}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={retry}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Loading error fallback for suspense boundaries
export const SuspenseErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="font-medium">Failed to load content</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Something went wrong while loading this content."}
        </p>
      </div>
      <Button onClick={retry} size="sm" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
};
