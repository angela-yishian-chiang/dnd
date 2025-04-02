import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Logging every request
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Ping endpoint
app.get("/ping", (req, res) => {
  res.send("pong");
});

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to handle player action
app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;
  console.log("📩 Incoming message from player:", message);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if your key allows
      messages: [
        {
          role: "system",
          content: "You are a Dungeon Master guiding the player through an adventure."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = response.choices[0]?.message?.content;
    console.log("🧙‍♂️ DM response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenAI API error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      res.status(500).json({ error: error.response.data });
    } else {
      console.error("Message:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🧙‍♂️ Server listening on port ${PORT}`);
});
