// routes/Chat.js
const express = require("express");
const Product = require("../models/Product");
const { segregateProducts } = require("../controller/cartService");
const { translateText } = require("../controller/translateText");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// -------------------
// Helper: clean JSON text from Gemini
// -------------------
function cleanGeminiJson(text) {
  if (!text) return null;
  return text
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();
}

// -------------------
// Predefined FAQ (lightweight)
// -------------------
const FAQ = [
  {
    keywords: ["hello", "hi", "hey"],
    reply: "👋 Hello! I’m AgriBot. How can I help you today?",
  },
  {
    keywords: ["help", "what can you do", "features"],
    reply:
      "🤖 I can: \n1️⃣ Search for products \n2️⃣ Recommend items \n3️⃣ Segregate your cart \n4️⃣ Answer general farming queries.",
  },
  {
    keywords: ["cart", "segregate"],
    reply: "🛒 I can group your cart into 🌾 Seeds, 🧪 Pesticides, and 🧤 PPE.",
  },
  {
    keywords: ["recommend", "suggest"],
    reply: "💡 I can recommend some popular products to you.",
  },
  {
    keywords: ["bye", "goodbye"],
    reply: "👋 Goodbye! Come back anytime.",
  },
];

// -------------------
// Gemini Helper (intent classification)
// -------------------
async function classifyIntent(message) {
  const prompt = `
  You are AgriBuddy, a safe farming assistant.
  Classify the user query into valid JSON only:
  { "intent": "search|recommend|segregate|general", "query": "..." }

  User message: "${message}"
  `;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.2,
      maxOutputTokens: 200,
    });

    const rawText =
      res?.candidates?.[0]?.content?.parts?.[0]?.text ||
      res?.outputText ||
      null;

    if (rawText) {
      try {
        const clean = cleanGeminiJson(rawText);
        return JSON.parse(clean);
      } catch (err) {
        return { intent: "general", query: message };
      }
    }
    return { intent: "general", query: message };
  } catch (err) {
    return { intent: "general", query: message };
  }
}

// -------------------
// Local FAQ matcher (only match at word boundaries)
// -------------------
function getFAQReply(query) {
  const q = query.toLowerCase().trim();
  
  // Only match very short queries (greetings should be short)
  if (q.length > 20) return null;
  
  for (const f of FAQ) {
    // Check if any keyword matches at the start of the query
    if (f.keywords.some((k) => {
      const regex = new RegExp(`^${k}\\b`, 'i');
      return regex.test(q) || q === k;
    })) {
      return f.reply;
    }
  }
  return null;
}

// -------------------
// Main Chat Route
// -------------------
router.post("/", async (req, res) => {
  try {
    let { message = "", cart = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Detect + Translate
    let lang = "en";
    let translatedInput = message;
    try {
      const translated = await translateText(message, "en");
      if (translated.toLowerCase() !== message.toLowerCase()) {
        lang = "mizo";
        translatedInput = translated;
      }
    } catch (err) {
      console.error("Translate error:", err.message);
    }

    // Step 1: Classify intent
    const { intent, query } = await classifyIntent(translatedInput);
    console.log("Gemini classified:", { intent, query });

    let reply = "";
    let products, grouped;

    // Step 2: Route logic
    if (intent === "segregate") {
      grouped = segregateProducts(cart);
      reply = "I segregated your cart";
    } else if (intent === "recommend") {
      products = await Product.find().limit(10);
      reply = "Here are some recommended products";
    } else if (intent === "search") {
      products = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tag: { $regex: query, $options: "i" } },
        ],
      }).limit(20);

      reply =
        products.length > 0
          ? `I found ${products.length} product(s) for "${query}"`
          : `Sorry, I couldn't find products for "${query}"`;
    } else {
      // General intent → check FAQ first (only for simple greetings)
      const faqReply = getFAQReply(translatedInput); // Check original input, not query
      if (faqReply) {
        reply = faqReply;
      } else {
        // Fallback: call Gemini only if no FAQ match
        try {
          const generalRes = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: [{ role: "user", parts: [{ text: translatedInput }] }],
            temperature: 0.3,
            maxOutputTokens: 200,
          });

          reply =
            generalRes?.candidates?.[0]?.content?.parts?.[0]?.text ||
            generalRes?.outputText ||
            "I'm not sure, please try again.";
        } catch (err) {
          reply = "I'm not sure, please try again.";
        }
      }
    }

    // Step 3: Translate back if Mizo
    if (lang === "mizo") {
      try {
        reply = await translateText(reply, "lus", "en");
      } catch (err) {
        console.error("Back-translate error:", err.message);
      }
    }

    // Step 4: Respond
    return res.json({
      text: reply,
      products: products,
      grouped: grouped,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
