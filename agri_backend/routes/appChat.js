const express = require("express");
const Product = require("../models/Product");
const { segregateProducts } = require("../controller/cartService");
const { translateText } = require("../controller/translateText");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

function cleanGeminiJson(text) {
  if (!text) return null;
  return text
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();
}

const FAQ = [
  {
    keywords: ["hello", "hi", "hey"],
    reply: "👋 Hello! I'm AgriBot. How can I help you today?",
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

// ✅ NEW: Build conversation context for Gemini
function buildConversationContext(history) {
  if (!history || history.length === 0) return "";
  
  return history
    .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");
}

// ✅ UPDATED: Intent classification with conversation context
async function classifyIntent(message, conversationHistory = []) {
  const context = buildConversationContext(conversationHistory);
  
  const prompt = `
You are AgriBuddy, a farming assistant. Analyze the user's message considering the conversation history.

${context ? `Previous conversation:\n${context}\n` : ''}

Current user message: "${message}"

RULES:
1. If asking "how to", "when to", "why", "what is" about farming → intent: "general"
2. If asking for specific product names like "show me seeds", "rice products" → intent: "search"
3. If asking "recommend" or "suggest" products → intent: "recommend"
4. If asking about "cart" or "segregate" → intent: "segregate"
5. If message refers to previous context (like "tell me the steps", "how about that"), use conversation history to understand

Return ONLY valid JSON:
{
  "intent": "search|recommend|segregate|general",
  "keywords": ["keyword1", "keyword2"],
  "query": "clarified question with context"
}

Examples:
- First: "how to grow rice" → {"intent":"general", "keywords":["rice"], "query":"how to grow rice"}
- Then: "tell me the steps" → {"intent":"general", "keywords":["rice","steps"], "query":"steps to grow rice"}
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.2,
      maxOutputTokens: 300,
    });

    const rawText =
      res?.candidates?.[0]?.content?.parts?.[0]?.text ||
      res?.outputText ||
      null;

    if (rawText) {
      try {
        const clean = cleanGeminiJson(rawText);
        const parsed = JSON.parse(clean);
        return {
          intent: parsed.intent || "general",
          keywords: parsed.keywords || [],
          query: parsed.query || message,
        };
      } catch (err) {
        console.error("JSON parse error:", err);
        return { intent: "general", keywords: [], query: message };
      }
    }
    return { intent: "general", keywords: [], query: message };
  } catch (err) {
    console.error("Gemini API error:", err);
    return { intent: "general", keywords: [], query: message };
  }
}

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

async function searchProducts(keywords, originalQuery) {
  if (!keywords || keywords.length === 0) {
    keywords = originalQuery.split(" ").filter(w => w.length > 2);
  }

  const searchConditions = keywords.map(keyword => ({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { "name.en": { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { tag: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ]
  }));

  try {
    const products = await Product.find({
      $or: searchConditions
    }).limit(20);
    return products;
  } catch (err) {
    console.error("Product search error:", err);
    return [];
  }
}

// ✅ UPDATED: Generate farming advice with conversation context
async function generateFarmingAdvice(message, keywords, conversationHistory = []) {
  const context = buildConversationContext(conversationHistory);
  
  const prompt = `
You are AgriBuddy, a helpful farming assistant.

${context ? `Previous conversation:\n${context}\n\n` : ''}

Current user question: "${message}"
Related keywords: ${keywords.join(", ")}

Provide a brief, helpful answer (2-3 sentences max) about farming techniques, best practices, or timing.
If the user is asking for "steps" or "process" and there's relevant context above, provide a numbered step-by-step guide.

Keep it simple and practical for farmers.
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.5,
      maxOutputTokens: 400,
    });

    const reply =
      res?.candidates?.[0]?.content?.parts?.[0]?.text ||
      res?.outputText ||
      "I can help with farming questions. Please be more specific.";

    return reply;
  } catch (err) {
    console.error("Gemini advice error:", err);
    return "I can help with farming questions. Please be more specific.";
  }
}

// ✅ UPDATED: Main Chat Route with conversation history
router.post("/", async (req, res) => {
  try {
    let { message = "", cart = [], conversationHistory = [] } = req.body; // ✅ Accept history
    if (!message) return res.status(400).json({ error: "Message required" });

    console.log("📩 Received message:", message);
    console.log("📜 Conversation history length:", conversationHistory.length);

    // Detect + Translate to English
    let lang = "en";
    let translatedInput = message;
    try {
      const translated = await translateText(message, "en");
      if (translated.toLowerCase() !== message.toLowerCase()) {
        lang = "mizo";
        translatedInput = translated;
        console.log("🌐 Translated to English:", translatedInput);
      }
    } catch (err) {
      console.error("Translation error:", err.message);
    }

    // STEP 1: Classify intent with conversation context
    const { intent, keywords, query } = await classifyIntent(translatedInput, conversationHistory);
    console.log("🤖 Gemini classified:", { intent, keywords, query });

    let reply = "";
    let products = null;
    let grouped = null;

    // STEP 2: Route based on intent
    if (intent === "segregate") {
      grouped = segregateProducts(cart);
      reply = "✅ I've segregated your cart into categories.";
      
    } else if (intent === "recommend") {
      products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10);
      reply = "💡 Here are some recommended products for you:";
      
    } else if (intent === "search") {
      products = await searchProducts(keywords, query);

      if (products.length > 0) {
        reply = `🔍 I found ${products.length} product(s) related to "${keywords.join(", ")}"`;
      } else {
        reply = `I couldn't find specific products for "${keywords.join(", ")}", but let me help you with information.`;
        
        const advice = await generateFarmingAdvice(translatedInput, keywords, conversationHistory);
        reply += `\n\n${advice}`;
        
        const broaderProducts = await Product.find({
          $or: [
            { category: { $regex: keywords[0] || "", $options: "i" } },
            { tag: { $regex: keywords[0] || "", $options: "i" } },
          ]
        }).limit(5);
        
        if (broaderProducts.length > 0) {
          products = broaderProducts;
          reply += `\n\n📦 Here are some related products that might help:`;
        }
      }
      
    } else {
      // General intent - farming question with context
      // Only check FAQ for very simple greetings, not farming questions
      const faqReply = getFAQReply(translatedInput); // Check original input, not query
      if (faqReply) {
        reply = faqReply;
      } else {
        // ✅ Generate farming advice with conversation context
        reply = await generateFarmingAdvice(translatedInput, keywords, conversationHistory);
        
        if (keywords.length > 0) {
          const relatedProducts = await searchProducts(keywords, query);
          if (relatedProducts.length > 0) {
            products = relatedProducts.slice(0, 5);
            reply += `\n\n📦 You might also need these products:`;
          }
        }
      }
    }

    // STEP 3: Translate back to Mizo if needed
    if (lang === "mizo") {
      try {
        reply = await translateText(reply, "lus", "en");
        console.log("🌐 Translated back to Mizo");
      } catch (err) {
        console.error("Back-translation error:", err.message);
      }
    }

    // STEP 4: Send response
    console.log("✅ Sending response:", { 
      textLength: reply.length, 
      productsCount: products?.length || 0,
      hasGrouped: !!grouped 
    });

    return res.json({
      text: reply,
      products: products,
      grouped: grouped,
    });
    
  } catch (err) {
    console.error("❌ Chat route error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: err.message 
    });
  }
});

module.exports = router;