import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// Body: { questTitle, questDescription, rewards: [{type, value}], statGains: [{stat, amount}] }
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
  const { questTitle, questDescription, rewards, statGains } = await req.json();
  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Update stats
  if (Array.isArray(statGains)) {
    for (const gain of statGains) {
      if (user.stats[gain.stat] !== undefined) {
        const oldValue = user.stats[gain.stat];
        user.stats[gain.stat] += gain.amount;
        const newValue = user.stats[gain.stat];
        user.logs.unshift({
          stat: gain.stat,
          oldValue,
          newValue,
          changedAt: new Date(),
        });
      }
    }
  }
  // Process XP, passives, titles, badges from rewards
  if (Array.isArray(rewards)) {
    for (const reward of rewards) {
      if (reward.type === "XP") {
        user.xp = (user.xp || 0) + parseInt(reward.value, 10);

        // Progressive XP requirement system
        function getXPRequiredForLevel(level: number): number {
          if (level === 1) return 100;
          if (level === 2) return 300;
          if (level === 3) return 600;
          if (level === 4) return 1000;
          // For levels 5+, use formula: level * 300 + (level - 4) * 200
          return level * 300 + (level - 4) * 200;
        }

        // Check for level ups
        let currentLevel = user.level || 1;
        let currentXP = user.xp;

        while (currentXP >= getXPRequiredForLevel(currentLevel + 1)) {
          currentXP -= getXPRequiredForLevel(currentLevel + 1);
          currentLevel++;
        }

        user.level = currentLevel;
        user.xp = currentXP;
      } else if (reward.type === "Passive") {
        if (!user.passives) user.passives = [];
        if (!user.passives.some((p) => p.title === reward.value)) {
          user.passives.push({
            title: reward.value,
            description: reward.value,
            awardedAt: new Date(),
          });
        }
      } else if (reward.type === "Title") {
        if (!user.titles) user.titles = [];
        if (!user.titles.some((t) => t.title === reward.value)) {
          user.titles.push({
            title: reward.value,
            description: reward.value,
            awardedAt: new Date(),
          });
        }
      } else if (reward.type === "Badge") {
        if (!user.badges) user.badges = [];
        if (!user.badges.some((b) => b.title === reward.value)) {
          user.badges.push({
            title: reward.value,
            description: reward.value,
            icon: "🏅",
            color: "#FFD700",
            awardedAt: new Date(),
          });
        }
      }
    }
  }
  // Add to completedQuests (now with description)
  user.completedQuests.unshift({
    questTitle,
    questDescription: questDescription || "",
    completedAt: new Date(),
    rewards: Array.isArray(rewards) ? rewards : [],
  });

  await user.save();
  return NextResponse.json({
    success: true,
    stats: user.stats,
    xp: user.xp,
    level: user.level,
    completedQuests: user.completedQuests,
    passives: user.passives,
    titles: user.titles,
    badges: user.badges,
  });
}
