"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-constants";

export function SubscriptionStatusCard() {
  const { subscription_status, is_loading, has_premium } = useSubscription();

  if (is_loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!has_premium) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Crown className="w-5 h-5 mr-2 text-yellow-500" />
            প্রিমিয়াম সাবস্ক্রিপশন
          </CardTitle>
          <CardDescription>
            প্রিমিয়াম সুবিধা পেতে সাবস্ক্রাইব করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/subscription">
            <Button className="w-full">
              সাবস্ক্রিপশন দেখুন
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const plan = SUBSCRIPTION_PLANS.find(
    (p) => p.id === subscription_status?.subscription?.plan,
  );

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-500" />
            সক্রিয় সাবস্ক্রিপশন
          </span>
          <Badge variant="secondary">প্রিমিয়াম</Badge>
        </CardTitle>
        <CardDescription>{plan?.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">মেয়াদ শেষ</span>
          <span className="font-medium">
            {subscription_status?.subscription?.end_date
              ? new Date(
                  subscription_status.subscription.end_date,
                ).toLocaleDateString("bn-BD")
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            অবশিষ্ট
          </span>
          <span className="font-medium text-primary">
            {subscription_status?.subscription?.days_remaining || 0} দিন
          </span>
        </div>
        <Link href="/subscription" className="block">
          <Button variant="outline" className="w-full" size="sm">
            বিস্তারিত দেখুন
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function SubscriptionBadge() {
  const { has_premium, is_loading } = useSubscription();

  if (is_loading) {
    return <Skeleton className="h-6 w-16" />;
  }

  if (!has_premium) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    >
      <Crown className="w-3 h-3 mr-1" />
      প্রিমিয়াম
    </Badge>
  );
}
