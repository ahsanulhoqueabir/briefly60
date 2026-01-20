"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateInvoicePDF } from "@/lib/invoice";
import { useSubscription, useSubscriptionInit } from "@/hooks/use-subscription";
import { SubscriptionPlan } from "@/types/subscription-plan.types";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Sparkles,
  Calendar,
  CreditCard,
  RefreshCw,
} from "lucide-react";

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    subscription_status,
    is_loading: status_loading,
    refetch,
  } = useSubscription();
  const {
    initializePayment,
    is_loading: payment_loading,
    error: payment_error,
  } = useSubscriptionInit();

  const [selected_plan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plans_loading, setPlansLoading] = useState(true);
  const [auto_renew, setAutoRenew] = useState(false);
  const [alert_message, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [params_processed, setParamsProcessed] = useState(false);

  // Process URL params in useEffect to avoid SSR hydration issues
  useEffect(() => {
    if (!searchParams || params_processed) return;

    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (status) {
      let alert_msg: typeof alert_message = null;

      if (status === "success") {
        alert_msg = {
          type: "success",
          title: "Subscription Successful!",
          message: `Your subscription has been activated successfully.`,
        };
      } else if (status === "failed") {
        alert_msg = {
          type: "error",
          title: "Payment Failed",
          message:
            message || "Payment could not be completed. Please try again.",
        };
      } else if (status === "cancelled") {
        alert_msg = {
          type: "warning",
          title: "Payment Cancelled",
          message: message || "You have cancelled the payment.",
        };
      }

      if (alert_msg) {
        setAlertMessage(alert_msg);
        setParamsProcessed(true);
      }
    }
  }, [searchParams, params_processed]);

  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await fetch("/api/subscription/plans");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.plans && Array.isArray(data.plans)) {
          setPlans(data.plans);
        } else {
          setAlertMessage({
            type: "error",
            title: "Failed to Load Plans",
            message: "Could not fetch subscription plans. Please try again.",
          });
          setPlans([]);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        setAlertMessage({
          type: "error",
          title: "Error",
          message:
            "Failed to load subscription plans. Please refresh the page.",
        });
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const generateInvoice = async () => {
    if (!subscription_status?.subscription) {
      setAlertMessage({
        type: "error",
        title: "No Subscription",
        message: "No active subscription data available for invoice.",
      });
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      await generateInvoicePDF(subscription_status);
    } catch (e) {
      console.error(e);
      setAlertMessage({
        type: "error",
        title: "Invoice Error",
        message: "Could not generate invoice. Please try again.",
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  useEffect(() => {
    if (!searchParams || !params_processed) return;

    const status = searchParams.get("status");
    if (status === "success") {
      // Refetch subscription status
      refetch();
      // Clear URL params after showing message (wait longer to ensure state is updated)
      const timer = setTimeout(() => {
        try {
          router.replace("/subscription");
        } catch (error) {
          console.error("Error clearing URL params:", error);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, params_processed, refetch, router]);

  const handleSubscribe = async (planId: string) => {
    if (subscription_status?.has_active_subscription) {
      setAlertMessage({
        type: "info",
        title: "Active Subscription",
        message: "You already have an active subscription.",
      });
      return;
    }

    setSelectedPlan(planId);
    const result = await initializePayment(planId, auto_renew);

    if (!result.success) {
      setAlertMessage({
        type: "error",
        title: "Failed to Initialize Payment",
        message: result.error || "Please try again.",
      });
      setSelectedPlan(null);
    }
  };

  if (status_loading || plans_loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center ">
          <div className="hidden sm:block p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-4">
            <Crown className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-2xl lg:text-5xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Subscription Plans
          </h1>
        </div>
        <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan to unlock premium features and stay informed
        </p>
      </div>

      {/* Alert Messages */}
      {alert_message && (
        <Alert
          variant={alert_message.type === "error" ? "destructive" : "default"}
          className="mb-8"
        >
          {alert_message.type === "success" && (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {alert_message.type === "error" && <XCircle className="h-4 w-4" />}
          {alert_message.type === "warning" && (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>{alert_message.title}</AlertTitle>
          <AlertDescription>{alert_message.message}</AlertDescription>
          {alert_message.type === "success" && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={generateInvoice}
                disabled={isGeneratingInvoice}
              >
                {isGeneratingInvoice ? "Generating..." : "Download Invoice"}
              </Button>
            </div>
          )}
        </Alert>
      )}

      {/* Current Subscription Status */}
      {subscription_status?.has_active_subscription && (
        <Card className="mb-10 border-2 border-primary bg-linear-to-br from-primary/5 to-purple-500/5 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3">
                <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Current Plan
                </p>
                <p className="text-xl font-bold">
                  {subscription_status.subscription?.plan_name || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Expires On
                </p>
                <p className="text-xl font-bold">
                  {subscription_status.subscription?.end_date
                    ? new Date(
                        subscription_status.subscription.end_date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Days Remaining
                </p>
                <p className="text-xl font-bold text-primary">
                  {subscription_status.subscription?.days_remaining || 0} days
                </p>
              </div>
            </div>
            {subscription_status.subscription?.auto_renew && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Auto-renewal is enabled for this subscription
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <Button
                className="w-full"
                variant="outline"
                onClick={generateInvoice}
                disabled={isGeneratingInvoice}
              >
                {isGeneratingInvoice
                  ? "Generating Invoice..."
                  : "Download Invoice"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Payment Error */}
      {payment_error && !subscription_status?.has_active_subscription && (
        <Alert variant="destructive" className="mb-8">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Payment Issue</AlertTitle>
          <AlertDescription>{payment_error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Plans - Only show if no active subscription */}
      {!subscription_status?.has_active_subscription && (
        <>
          {/* Auto-Renewal Toggle */}
          <Card className="mb-8 border-2 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-renew" className="text-base font-medium">
                    Enable Auto-Renewal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically renew your subscription when it expires
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-renew"
                    checked={auto_renew}
                    onCheckedChange={setAutoRenew}
                  />
                  <RefreshCw
                    className={`w-4 h-4 ${auto_renew ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            {plans && plans.length > 0 ? (
              plans.map((plan) => (
                <Card
                  key={plan._id}
                  className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular
                      ? "border-2 border-primary shadow-xl md:scale-105 bg-linear-to-br from-primary/5 to-purple-500/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-linear-to-r from-primary to-purple-600 text-white px-4 py-1.5 text-sm font-semibold shadow-lg">
                        ⭐ Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          ৳{plan.price}
                        </span>
                        {plan.original_price && (
                          <span className="text-xl line-through text-muted-foreground">
                            ৳{plan.original_price}
                          </span>
                        )}
                      </div>
                      {plan.savings && (
                        <Badge
                          variant="secondary"
                          className="mt-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        >
                          💰 {plan.savings}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="p-0.5 bg-green-100 dark:bg-green-900/30 rounded-full mr-3 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                          </div>
                          <span className="text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center text-sm font-medium text-muted-foreground pt-4 border-t">
                      <Calendar className="w-4 h-4 mr-2" />
                      Valid for {plan.duration_months}{" "}
                      {plan.duration_months === 1 ? "month" : "months"}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      className={`w-full transition-all ${
                        plan.popular
                          ? "bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl"
                          : ""
                      }`}
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.plan_id)}
                      disabled={
                        payment_loading ||
                        subscription_status?.has_active_subscription ||
                        selected_plan === plan.plan_id
                      }
                    >
                      {payment_loading && selected_plan === plan.plan_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : subscription_status?.has_active_subscription ? (
                        "Subscribed"
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Alert>
                  <AlertTitle>No Plans Available</AlertTitle>
                  <AlertDescription>
                    Subscription plans are currently unavailable. Please try
                    again later.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </>
      )}

      {/* Additional Info - Only show if no active subscription */}
      {!subscription_status?.has_active_subscription && (
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto border-2 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="w-6 h-6 text-primary mr-2" />
                <CardTitle className="text-2xl">Payment Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-sm text-muted-foreground">
                      All payments are securely processed through SSLCommerz
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Multiple Options</p>
                    <p className="text-sm text-muted-foreground">
                      Credit card, debit card, and mobile banking supported
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">No Auto-Renewal</p>
                    <p className="text-sm text-muted-foreground">
                      Subscription won&apos;t auto-renew after expiration
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Support Available</p>
                    <p className="text-sm text-muted-foreground">
                      Contact us for any issues or questions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center">
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          </div>
        }
      >
        <SubscriptionContent />
      </Suspense>
    </ErrorBoundary>
  );
}
