import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// This route is for testing purposes only - allows resetting setup status
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = auth.replace("Bearer ", "");
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectToDB();

  try {
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset setup status for testing
    user.setupCompleted = false;

    // Reset stats to default
    user.stats = {
      strength: 1,
      vitality: 1,
      agility: 1,
      intelligence: 1,
      perception: 1,
    };

    // Clear quest cache
    user.questCache = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Setup status reset successfully. User will see setup modal on next login.",
    });
  } catch (error) {
    console.error("Reset setup error:", error);
    return NextResponse.json(
      { error: "Failed to reset setup" },
      { status: 500 }
    );
  }
}
