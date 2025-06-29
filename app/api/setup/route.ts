import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import SetupResponse from "@/lib/models/SetupResponse";
import { SETUP_QUESTIONS } from "@/lib/setup-questions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function analyzeResponsesWithAI(
  responses: Record<string, { question: string; answer: string }>
) {
  if (!GEMINI_API_KEY) {
    // Fallback scoring if no API key
    return {
      strength: Math.floor(Math.random() * 5) + 3,
      vitality: Math.floor(Math.random() * 5) + 3,
      agility: Math.floor(Math.random() * 5) + 3,
      intelligence: Math.floor(Math.random() * 5) + 3,
      perception: Math.floor(Math.random() * 5) + 3,
    };
  }

  const prompt = `
You are an RPG character assessment AI. Analyze the user's responses and assign realistic initial stat scores from 1-10 based on their actual abilities and experiences.

User Responses:
${Object.entries(responses)
  .map(
    ([stat, data]) => `
${stat.toUpperCase()}: "${data.answer}"
`
  )
  .join("")}

SCORING GUIDELINES:
Strength (1-10): Physical power, lifting capacity, exercise habits
- 1-2: Sedentary, no exercise, struggles with basic physical tasks
- 3-4: Light exercise occasionally, can handle basic daily tasks
- 5-6: Regular exercise, good general fitness, moderate strength
- 7-8: Strong regular training, impressive lifting/strength feats
- 9-10: Elite athlete level, exceptional physical strength

Vitality (1-10): Health, energy, stamina, recovery
- 1-2: Poor health, chronic fatigue, frequent illness
- 3-4: Below average energy, some health issues
- 5-6: Good general health, normal energy levels
- 7-8: High energy, rarely sick, excellent recovery
- 9-10: Peak health, boundless energy, incredible endurance

Agility (1-10): Coordination, reflexes, flexibility, speed
- 1-2: Poor coordination, slow reflexes, inflexible
- 3-4: Below average movement skills
- 5-6: Normal coordination and reflexes
- 7-8: Quick reflexes, good at sports/dancing
- 9-10: Lightning reflexes, exceptional coordination

Intelligence (1-10): Learning ability, problem-solving, knowledge
- 1-2: Struggles with learning, basic problem-solving
- 3-4: Below average learning ability
- 5-6: Average intelligence, good problem-solving
- 7-8: Quick learner, excellent analytical skills
- 9-10: Genius level, exceptional intellectual abilities

Perception (1-10): Awareness, observation, intuition
- 1-2: Oblivious to surroundings, poor observation
- 3-4: Below average awareness
- 5-6: Normal observation skills
- 7-8: Very observant, good intuition
- 9-10: Exceptional awareness, notices everything

Return ONLY a JSON object with integer scores (1-10):
{
  "strength": 5,
  "vitality": 6,
  "agility": 4,
  "intelligence": 7,
  "perception": 5
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scores = JSON.parse(jsonMatch[0]);

      // Validate scores are within range
      const validatedScores: Record<string, number> = {};
      for (const [stat, score] of Object.entries(scores)) {
        if (typeof score === "number" && score >= 1 && score <= 10) {
          validatedScores[stat] = Math.floor(score);
        } else {
          validatedScores[stat] = 5; // Default fallback
        }
      }

      return validatedScores;
    }
  } catch (error) {
    console.error("Error analyzing responses with AI:", error);
  }

  // Fallback scoring
  return {
    strength: 5,
    vitality: 5,
    agility: 5,
    intelligence: 5,
    perception: 5,
  };
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

  try {
    const { responses } = await req.json();

    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "Invalid responses format" },
        { status: 400 }
      );
    }

    // Validate that all required stats have responses
    const requiredStats = [
      "strength",
      "vitality",
      "agility",
      "intelligence",
      "perception",
    ];
    for (const stat of requiredStats) {
      if (!responses[stat] || !responses[stat].answer) {
        return NextResponse.json(
          { error: `Missing response for ${stat}` },
          { status: 400 }
        );
      }
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.setupCompleted) {
      return NextResponse.json(
        { error: "Setup already completed" },
        { status: 400 }
      );
    }

    // Analyze responses with AI to get initial stats
    const analyzedStats = await analyzeResponsesWithAI(responses);

    // Save setup response to database
    await SetupResponse.create({
      userId: payload.userId,
      responses,
    });

    // Update user with new stats and mark setup as complete
    user.stats = {
      strength: analyzedStats.strength || 5,
      vitality: analyzedStats.vitality || 5,
      agility: analyzedStats.agility || 5,
      intelligence: analyzedStats.intelligence || 5,
      perception: analyzedStats.perception || 5,
    };
    user.setupCompleted = true;

    // Clear quest cache to regenerate with new stats
    user.questCache = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      stats: user.stats,
      message: `Assessment complete! Your starting stats have been assigned:
      
🔥 Strength: ${analyzedStats.strength || 5}
❤️ Vitality: ${analyzedStats.vitality || 5}  
⚡ Agility: ${analyzedStats.agility || 5}
🧠 Intelligence: ${analyzedStats.intelligence || 5}
👁️ Perception: ${analyzedStats.perception || 5}

Your journey as a Hunter begins now!`,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ questions: SETUP_QUESTIONS });
}
