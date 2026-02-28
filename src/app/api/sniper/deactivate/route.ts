import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const subscription = await prisma.sniperSubscription.update({
      where: { apiKey },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription paused",
      isActive: subscription.isActive,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to deactivate" }, { status: 500 });
  }
}
