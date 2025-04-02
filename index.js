import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

console.log("🔑 Loaded OpenRouter key:", process.env.OPENROUTER_API_KEY?.slice(0, 10) + "...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🧪 Debug route
app.get("/ping", (req, res) => res.send("pong"));

// 🧙‍♂️ AI endpoint using OpenRouter
app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;
  console.log("📨 Incoming message from player:", message);

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
          { role: "system", content: "You are a Dungeon Master guiding the player through an adventure." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();
    console.log("🤖 OpenRouter reply:", data);

    if (data.choices && data.choices[0].message.content) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: "⚠️ No response from the Dungeon Master." });
    }
  } catch (error) {
    console.error("❌ OpenRouter API error:", error);
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🧙‍♂️ Server running on port ${PORT}`);
});
