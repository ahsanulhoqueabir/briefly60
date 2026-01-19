import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkStatusProps {
  isOnline: boolean;
  onRetry?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  onRetry,
}) => {
  if (isOnline) return null;

  return (
    <Card className="border-warning bg-warning/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning">
          <WifiOff className="h-5 w-5" />
          No Internet Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Please check your internet connection and try again.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface MaintenanceModeProps {
  message?: string;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  message = "We're currently performing maintenance. Please try again later.",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-2" />
          <CardTitle>Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};
