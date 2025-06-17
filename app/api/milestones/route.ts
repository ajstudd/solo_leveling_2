import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// GET: Fetch milestones (internal)
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
  const user = await User.findById(payload.userId).select("milestones");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user.milestones || []);
}

// POST: Update milestones (internal)
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
  user.milestones = body.milestones;
  await user.save();
  return NextResponse.json({ success: true });
}
