// index.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fetch from "node-fetch"; // only needed if you're not using Node 18+

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Game memory (in-memory only for now)
let currentEnvironment = "a dense forest";

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
If the player is in a forest, you cannot describe a sudden change to an indoor environment unless the player explicitly discovers an entrance.
All environmental changes must be explained through player perception.
`;

const messageHistory = [
  { role: "system", content: systemPrompt },
  { role: "assistant", content: "Welcome, traveler. The fire crackles beside you in the damp stone tavern. Outside, a storm rages. Are you ready to begin your adventure?" }
];

app.get("/ping", (req, res) => res.send("pong"));

app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;
  console.log("\u2709\ufe0f Incoming message from player:", message);

  messageHistory.push({ role: "user", content: message });

  try {
    const environmentContext = `The player is currently in: ${currentEnvironment}. 
Do not change the environment unless the player explicitly moves or encounters a transition. 
Describe only what is visible or present in the current environment.`;

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
      { role: "system", content: environmentContext },
      ...messageHistory,
    ],
  }),
});

    const data = await response.json();
    console.log("\ud83e\udd16 OpenRouter reply:", data);

    const reply = data.choices?.[0]?.message?.content || "⚠️ No response from the Dungeon Master.";
    messageHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("\u274c OpenRouter API error:", error);
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\ud83e\uddd9\u200d\u2642\ufe0f Server running on port ${PORT}`);
});