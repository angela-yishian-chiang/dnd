import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Env
dotenv.config();

// Path fixes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Logging all requests
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/ping", (req, res) => {
  res.send("pong");
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a Dungeon Master guiding the player through an adventure." },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ OpenAI error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

app.listen(PORT, () => {
  console.log(`🧙‍♂️ Server listening on port ${PORT}`);
});
