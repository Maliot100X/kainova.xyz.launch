import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key required" },
        { status: 401 }
      );
    }

    const subscription = await prisma.sniperSubscription.findUnique({
      where: { apiKey },
      include: {
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      subscriberId: subscription.subscriberId,
      webhookUrl: subscription.webhookUrl,
      walletAddress: subscription.walletAddress,
      balanceSol: subscription.balanceSol,
      isActive: subscription.isActive,
      notificationsSent: subscription.notificationsSent,
      totalDeposited: subscription.totalDeposited,
      totalCharged: subscription.totalCharged,
      recentNotifications: subscription.notifications.map((n: any) => ({
        id: n.id,
        mintAddress: n.mintAddress,
        chargeAmount: n.chargeAmount,
        delivered: n.delivered,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Sniper status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get status" },
      { status: 500 }
    );
  }
}
