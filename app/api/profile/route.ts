import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

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
  const user = await User.findById(payload.userId).select(
    "profile badges xp level passives titles setupCompleted"
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    profile: user.profile || {},
    badges: user.badges || [],
    xp: user.xp || 0,
    level: user.level || 1,
    passives: user.passives || [],
    titles: user.titles || [],
    setupCompleted: user.setupCompleted || false,
  });
}

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
  const body = await req.json();
  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  user.profile = { ...user.profile, ...body };
  // Clear questCache to force quest regeneration on next fetch
  user.questCache = undefined;
  await user.save();
  return NextResponse.json({ success: true });
}
