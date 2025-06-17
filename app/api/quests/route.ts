import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getGeminiQuests } from "@/lib/gemini";

export async function GET(req: NextRequest) {
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
  // Fetch stats, focusLogs, completedQuests, questCache, profile
  const user = await User.findById(payload.userId).select(
    "stats focusLogs completedQuests questCache profile"
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Check if quests are cached and updated within 24 hours
  const now = new Date();
  if (
    user.questCache &&
    user.questCache.quests &&
    user.questCache.updatedAt &&
    now.getTime() - new Date(user.questCache.updatedAt).getTime() <
      24 * 60 * 60 * 1000
  ) {
    return NextResponse.json(user.questCache.quests);
  }
  try {
    const parsed = await getGeminiQuests(
      user.stats,
      user.focusLogs,
      user.completedQuests,
      user.profile || {}
    );
    // Cache the quests in db
    user.questCache = {
      quests: parsed,
      updatedAt: new Date(),
    };
    await user.save();
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Gemini API error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
