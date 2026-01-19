"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-20 w-20 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong!
              </h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Please try
                again.
              </p>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-4 text-left bg-muted p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {error.message}
                    {error.digest && `\nError ID: ${error.digest}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
