import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// GET: Get user stats and logs
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
  const user = await User.findById(payload.userId).select("stats logs");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ stats: user.stats, logs: user.logs });
}

// PATCH: Update user stats
export async function PATCH(req: NextRequest) {
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
  const { stat, value } = await req.json();
  const allowedStats = [
    "strength",
    "vitality",
    "agility",
    "intelligence",
    "perception",
  ];
  if (!allowedStats.includes(stat) || typeof value !== "number") {
    return NextResponse.json(
      { error: "Invalid stat or value" },
      { status: 400 }
    );
  }
  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const oldValue = user.stats[stat];
  user.stats[stat] = value;
  user.logs.unshift({ stat, oldValue, newValue: value, changedAt: new Date() });
  await user.save();
  return NextResponse.json({ stats: user.stats, logs: user.logs });
}
