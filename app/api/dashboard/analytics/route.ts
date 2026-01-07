import { NextResponse } from "next/server";
import { analyticsService } from "@/services/analytics.service";

export async function GET() {
  try {
    const analyticsData = await analyticsService.getAnalyticsData();
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
