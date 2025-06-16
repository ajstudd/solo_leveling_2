import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// Body: { questTitle, rewards: [{type, value}], statGains: [{stat, amount}] }
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
  const { questTitle, rewards, statGains } = await req.json();
  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Update stats
  if (Array.isArray(statGains)) {
    for (const gain of statGains) {
      if (user.stats[gain.stat] !== undefined) {
        user.stats[gain.stat] += gain.amount;
      }
    }
  }
  // Add to completedQuests
  user.completedQuests.unshift({
    questTitle,
    completedAt: new Date(),
    rewards,
  });
  await user.save();
  return NextResponse.json({ success: true, stats: user.stats });
}
