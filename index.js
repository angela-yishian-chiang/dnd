// index.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const worldState = {
  currentLocation: null,
  visited: [],
  environment: null,
  items: [],
  companions: [],
  currentScene: null,
  activeCharacters: [],
  exitStatus: "The exit door is currently open behind the player."
};

const systemPrompt = `
You are a Dungeon Master guiding a single player through a rich and mysterious fantasy world.
You must remain in character and never refer to yourself as an AI.
The world has rules, lore, and consistency—you are the keeper of those.
Narrate events in the second person (“you”), never referring to the player as "the player."
Introduce characters, history, legends, and secrets organically.
Do not let the player dictate the world—respond naturally as if you are in control of the world, not them.
Be immersive, descriptive, and challenge the player’s assumptions.
Maintain continuity and remember what has happened in previous turns.
Maintain strict physical continuity. Locations and transitions must follow logical, spatial rules.
Do not change the environment or characters unless clearly triggered by the player’s actions.
You must remain consistent with the current scene. Do not change rooms or introduce new characters unless the player moves or the world justifies it.
The same enemies or characters must remain unless they are defeated, flee, or explicitly replaced.
Begin the story by setting the world context, the character's identity, and their reason for beginning the journey.
`;

const messageHistory = [
  { role: "system", content: systemPrompt },
  {
    role: "assistant",
    content:
      "Welcome to the world of Eldara, a realm of ancient ruins, restless spirits, and buried magic. You are Kaelen, a lone traveler and former scout of the northern reaches, now wandering in search of purpose after your homeland's fall. As the crimson sun dips below the horizon, you stand before a looming tower shrouded in mist. Your journey begins now. What do you do?",
  },
];

app.get("/ping", (req, res) => res.send("pong"));

app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;
  console.log("📨 Incoming message from player:", message);

  messageHistory.push({ role: "user", content: message });

  const worldStateContext = `
World State:
- Current location: ${worldState.currentLocation || "unknown"}
- Environment: ${worldState.environment || "not yet defined"}
- Scene: ${worldState.currentScene || "undefined"}
- Characters present: ${worldState.activeCharacters.length > 0 ? worldState.activeCharacters.join(", ") : "none"}
- Exit status: ${worldState.exitStatus}
- Visited locations: ${worldState.visited.length > 0 ? worldState.visited.join(", ") : "none"}
- Inventory: ${worldState.items.length > 0 ? worldState.items.join(", ") : "none"}
- Companions: ${worldState.companions.length > 0 ? worldState.companions.join(", ") : "none"}
Ensure consistency. Do not alter the current scene or introduce new characters without logical transition or reason. Maintain continuity with all elements above.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: worldStateContext },
          ...messageHistory,
        ],
      }),
    });

    const data = await response.json();
    console.log("🤖 OpenRouter reply:", data);

    const reply = data.choices?.[0]?.message?.content || "⚠️ No response from the Dungeon Master.";
    messageHistory.push({ role: "assistant", content: reply });

    // Auto-update logic (basic keyword-based guess for now)
    const locationKeywords = ["cave", "dungeon", "clearing", "forest", "tavern", "corridor", "ruins", "temple", "camp", "village", "tower", "mist"];
    const matchedLocation = locationKeywords.find((kw) => reply.toLowerCase().includes(kw));

    if (matchedLocation && matchedLocation !== worldState.currentLocation) {
      worldState.currentLocation = matchedLocation;
      if (!worldState.visited.includes(matchedLocation)) {
        worldState.visited.push(matchedLocation);
      }
      worldState.environment = `This area appears to be a ${matchedLocation}.`;
      worldState.currentScene = `You are in the ${matchedLocation}`;
      console.log("📍 Updated world location to:", matchedLocation);
    }

    // Extract known characters (very basic for now)
    const knownEnemies = ["dark knight", "evil wizard", "skeleton king", "beast"];
    knownEnemies.forEach((enemy) => {
      if (reply.toLowerCase().includes(enemy) && !worldState.activeCharacters.includes(enemy)) {
        worldState.activeCharacters.push(enemy);
        console.log("👤 Added character to scene:", enemy);
      }
    });

    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenRouter API error:", error);
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🧙‍♂️ Server running on port ${PORT}`);
});