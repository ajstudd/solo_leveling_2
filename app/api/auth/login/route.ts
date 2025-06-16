import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import { connectToDB } from "@/lib/mongodb";
import { signJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await connectToDB();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = signJwt({ userId: user._id, email: user.email });
  return NextResponse.json({ token });
}
