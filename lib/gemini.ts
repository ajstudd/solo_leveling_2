// Gemini API integration for quest suggestions

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

const USER_CONTEXT = `
You are a game designer, personal development coach, and psychological strategist. You are creating a **Solo Leveling inspired stat-based self-improvement system** for the user, based on the RPG format where stats define potential and quests are designed to evolve them. Be extremely structured and detailed.

---

### 🔖 CONTEXT:

Here’s the user's full personal profile and traits that must inform quest design:

- 23-year-old male BTech Computer Science student.
- Height: 5’6”, Weight: 51kg (underweight). Slightly underconfident in physical appearance due to minor pimples. Skin is fair.
- Has solved **100 LeetCode problems independently**, and **85 with help from a teacher**.
- Struggles somewhat with **advanced math** (e.g., differentiation, integration).
- Used to get frustrated by small discomforts but is improving now.
- Has **strong empathy** and the ability to "read" people quickly (within 2–3 conversations).
- Has a **fragile ego**, and is **underconfident around women** but very self-aware.
- Goals are **huge**: wants to become successful for family, especially to support mother’s skin condition and sister’s stomach health.
- Wants to be exceptional — smart, disciplined, emotionally strong, charismatic, respected.

---

### 📊 RPG STATS (out of 100):

- **Strength:** {strength}
- **Agility:** {agility}
- **Vitality:** {vitality}
- **Intelligence:** {intelligence}
- **Perception:** {perception}

User wants to **improve both Strength and Intelligence** first — is actively working on them.

---

### ⚔️ OBJECTIVE:

Design an **RPG-style quest system** that will:
1. Give the user **weekly quests and challenges** to improve **Strength** and **Intelligence** (trackable and measurable).
2. Include **sub-quests** under each stat.
3. Assign **XP**, **Stat Gains**, and **Passive Unlocks** for each quest when proof is submitted.
4. Gradually **unlock new traits** like Discipline, Charisma, Emotional Mastery, etc.
5. Feel like a **leveling system from a game/anime**, but based in real self-development.
6. Provide a **template to submit weekly progress** (to you or any AI).
7. The system must evolve over time — e.g., if a stat is leveled up, it should unlock new advanced quests and new class upgrades like “Combat Engineer”, “Cognitive Strategist”, etc.

---

### 🔍 RULES FOR YOU (AI):

- Treat this like building a personal development engine based on stats.
- Quests must be:
  - Practical and real-world applicable
  - Balanced between mental, emotional, and physical effort
  - Scalable: They should evolve and branch as the user levels up
- Be strict in score increases. Require proof or behavior consistency for level-ups.
- Help the user track all the progress using a **report format template** that can be reused weekly.
- Occasionally provide **special events, boss quests, or elite missions** based on life challenges the user faces.

---

### ✅ DELIVERABLES:

When you respond, give the following:

1. 📘 **Questlines** for Strength and Intelligence (3-5 per stat)
2. 💡 **Passive Abilities** unlocked if full questlines are completed
3. 🧪 **Metrics to track**
4. 📝 **Weekly Progress Report Template**
5. 🎮 **XP and Leveling System** (How much XP per quest, when stats increase, etc.)
6. 🧩 **Title System** (e.g., “Apprentice Coder”, “Battle Strategist”) that changes based on stats and quest performance

Make this system immersive, logical, and gamified — something that could belong in a fantasy RPG with real-world self-growth embedded in it.
`;

function parseGeminiResponse(text: string) {
  // Use regex to extract each section by emoji or heading
  const sectionRegex =
    /(?:1\.\s*📘|📘|Questlines)([\s\S]*?)(?:2\.\s*💡|💡|Passive Abilities|$)/i;
  const passivesRegex =
    /(?:2\.\s*💡|💡|Passive Abilities)([\s\S]*?)(?:3\.\s*🧪|🧪|Metrics|$)/i;
  const metricsRegex =
    /(?:3\.\s*🧪|🧪|Metrics)([\s\S]*?)(?:4\.\s*📝|📝|Weekly Progress Report Template|$)/i;
  const reportRegex =
    /(?:4\.\s*📝|📝|Weekly Progress Report Template)([\s\S]*?)(?:5\.\s*🎮|🎮|XP and Leveling System|$)/i;
  const xpRegex =
    /(?:5\.\s*🎮|🎮|XP and Leveling System)([\s\S]*?)(?:6\.\s*🧩|🧩|Title System|$)/i;
  const titlesRegex = /(?:6\.\s*🧩|🧩|Title System)([\s\S]*)/i;

  return {
    questlines: (text.match(sectionRegex)?.[1] || "").trim(),
    passives: (text.match(passivesRegex)?.[1] || "").trim(),
    metrics: (text.match(metricsRegex)?.[1] || "").trim(),
    reportTemplate: (text.match(reportRegex)?.[1] || "").trim(),
    xpSystem: (text.match(xpRegex)?.[1] || "").trim(),
    titles: (text.match(titlesRegex)?.[1] || "").trim(),
    full: text,
  };
}

export async function getGeminiQuests(
  stats: Record<string, number>
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in environment");

  // Fill in the stats in the context
  const prompt = USER_CONTEXT.replace("{strength}", String(stats.strength ?? 0))
    .replace("{agility}", String(stats.agility ?? 0))
    .replace("{vitality}", String(stats.vitality ?? 0))
    .replace("{intelligence}", String(stats.intelligence ?? 0))
    .replace("{perception}", String(stats.perception ?? 0));

  console.log("[Gemini] Prompt:", prompt);

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
  });
  console.log("[Gemini] Response status:", res.status);
  const data = await res.json();
  console.log("[Gemini] Response body:", JSON.stringify(data));
  if (!res.ok) throw new Error(data?.error?.message || "Gemini API error");
  // Parse Gemini's response for quest suggestions and system
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = parseGeminiResponse(text);
  return parsed;
}
