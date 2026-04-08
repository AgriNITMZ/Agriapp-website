const express = require("express");
const Product = require("../models/Product");
const { segregateProducts } = require("../controller/cartService");
let translateText;
try {
  translateText = require("../controller/translateText").translateText;
} catch (e) {
  console.warn("⚠️ Google Cloud Translation not available:", e.message);
}
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

// Retry helper for Gemini API calls (handles 429 rate limiting)
async function callGeminiWithRetry(options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await ai.models.generateContent(options);
      // Extract text - @google/genai v1.x uses res.text directly
      const text = res?.text ||
        res?.candidates?.[0]?.content?.parts?.[0]?.text ||
        res?.outputText ||
        null;
      return text;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`❌ Gemini API failed after ${attempt + 1} attempts:`, err.status, err.message?.substring(0, 150));
        throw err;
      }
    }
  }
}

// Language code to name mapping (includes code-mixed variants)
const LANG_MAP = {
  en: "English",
  hi: "Hindi",
  lus: "Mizo",
  ne: "Nepali",
  "hi-en": "Hinglish (Hindi-English mix)",
  "ne-en": "Nepali-English mix",
  "lus-en": "Mizo-English mix",
};

// Map mixed language codes to their base language for back-translation
const REPLY_LANG_MAP = {
  en: "en",
  hi: "hi",
  lus: "lus",
  ne: "ne",
  "hi-en": "hi",    // Reply in Hindi for Hinglish users
  "ne-en": "ne",    // Reply in Nepali for Nepenglish users
  "lus-en": "lus",  // Reply in Mizo for Mizo-English users
};

// Detect language using Gemini (supports mixed languages)
async function detectLanguage(text) {
  if (!text) return "en";
  const prompt = `Detect the language of the following text. The text may be in a single language or a MIX of two languages (code-mixing).

Supported codes:
- en = English
- hi = Hindi
- lus = Mizo
- ne = Nepali
- hi-en = Hinglish (Hindi words written in English script, mixed with English)
- ne-en = Nepali mixed with English
- lus-en = Mizo mixed with English

Return ONLY the language code. If unsure, return "en".

Text: "${text}"`;
  try {
    const result = await callGeminiWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0, maxOutputTokens: 15 },
    });
    const raw = result?.trim().toLowerCase().replace(/[^a-z-]/g, "");
    // Check mixed codes first
    if (["hi-en", "ne-en", "lus-en"].includes(raw)) return raw;
    // Check pure codes
    if (["en", "hi", "lus", "ne"].includes(raw)) return raw;
    // Handle full names
    if (raw.includes("hinglish") || raw.includes("hien")) return "hi-en";
    if (raw.includes("hindi")) return "hi";
    if (raw.includes("mizo") && raw.includes("en")) return "lus-en";
    if (raw.includes("mizo")) return "lus";
    if (raw.includes("nepali") && raw.includes("en")) return "ne-en";
    if (raw.includes("nepali")) return "ne";
    return "en";
  } catch (err) {
    console.error("Language detection error:", err.message);
    return "en";
  }
}

// Gemini-based translation fallback (when Google Cloud Translation quota is exhausted)
async function translateWithGemini(text, targetLang = "en") {
  if (!text) return "";
  const langName = LANG_MAP[targetLang] || targetLang;
  const prompt = `Translate the following text to ${langName}. Return ONLY the translated text, nothing else.\n\nText: "${text}"`;
  try {
    const result = await callGeminiWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.1, maxOutputTokens: 500 },
    });
    return result?.trim() || text;
  } catch (err) {
    console.error("Gemini translation error:", err.message);
    return text;
  }
}

// Smart translate: tries Google Cloud first, falls back to Gemini
async function smartTranslate(text, targetLang = "en") {
  if (!text) return "";
  // Try Google Cloud Translation first
  if (translateText) {
    try {
      return await translateText(text, targetLang);
    } catch (err) {
      console.warn("⚠️ Google Cloud Translation failed, using Gemini fallback:", err.code || err.message);
    }
  }
  // Fallback to Gemini
  return await translateWithGemini(text, targetLang);
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
2. If asking for specific product names or expressing intent to buy/purchase (e.g., "show me seeds", "i want to buy tomato", "rice products") → intent: "search"
3. If asking "recommend" or "suggest" products → intent: "recommend"
4. If asking about "cart" or "segregate" → intent: "segregate"
5. If message refers to previous context (like "tell me the steps", "how about that"), use conversation history to understand.
6. Be lenient. Any query relating to crops, equipment, buying, or selling should be categorized as search, recommend, or general.

Return ONLY valid JSON:
{
  "intent": "search|recommend|segregate|general",
  "keywords": ["keyword1", "keyword2"],
  "query": "clarified question with context"
}

Examples:
- First: "how to grow rice" → {"intent":"general", "keywords":["rice"], "query":"how to grow rice"}
- Then: "tell me the steps" → {"intent":"general", "keywords":["rice","steps"], "query":"steps to grow rice"}
- Buy intent: "i want to buy tomato" → {"intent":"search", "keywords":["tomato"], "query":"tomato"}
`;

  try {
    const rawText = await callGeminiWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 300,
      },
    });

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
    console.error("Gemini classifyIntent error:", err.message);
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

// Pre-built reply templates in supported languages
const REPLY_TEMPLATES = {
  search_found: {
    en: (count, kw) => `🔍 I found ${count} product(s) related to "${kw}"`,
    hi: (count, kw) => `🔍 मुझे "${kw}" से संबंधित ${count} उत्पाद मिले`,
    lus: (count, kw) => `🔍 "${kw}" nena inzawm product ${count} ka hmu`,
    ne: (count, kw) => `🔍 "${kw}" सँग सम्बन्धित ${count} उत्पादन भेटियो`,
  },
  search_not_found: {
    en: (kw) => `I couldn't find specific products for "${kw}", but let me help you with information.`,
    hi: (kw) => `"${kw}" के लिए विशेष उत्पाद नहीं मिले, लेकिन मैं जानकारी दे सकता हूँ।`,
    lus: (kw) => `"${kw}" atana product ka hmu lo, mahse information ka pe thei ang.`,
    ne: (kw) => `"${kw}" को लागि उत्पाद भेटिएन, तर म जानकारी दिन सक्छु।`,
  },
  recommend: {
    en: "💡 Here are some recommended products for you:",
    hi: "💡 आपके लिए कुछ सुझाए गए उत्पाद:",
    lus: "💡 Product tha zawng zawng nangmah atana:",
    ne: "💡 तपाईंको लागि केही सिफारिस गरिएका उत्पादनहरू:",
  },
  segregate: {
    en: "✅ I've segregated your cart into categories.",
    hi: "✅ मैंने आपके कार्ट को श्रेणियों में बाँट दिया है।",
    lus: "✅ I cart ka thlanchhuah category tina.",
    ne: "✅ मैले तपाईंको कार्ट श्रेणीहरूमा छुट्टयाएको छु।",
  },
  related_products: {
    en: "\n\n📦 Here are some related products that might help:",
    hi: "\n\n📦 कुछ संबंधित उत्पाद जो मदद कर सकते हैं:",
    lus: "\n\n📦 Product inzawm thenkhat che tanpui thei ang:",
    ne: "\n\n📦 सम्बन्धित उत्पादनहरू जसले मद्दत गर्न सक्छ:",
  },
  also_need: {
    en: "\n\n📦 You might also need these products:",
    hi: "\n\n📦 आपको इन उत्पादों की भी ज़रूरत हो सकती है:",
    lus: "\n\n📦 He product-te hi i mamawh ve thei ang:",
    ne: "\n\n📦 तपाईंलाई यी उत्पादनहरू पनि चाहिन सक्छ:",
  },
};

// Helper to get reply in the right language
function getReply(templateKey, lang, ...args) {
  const baseLang = REPLY_LANG_MAP[lang] || lang;
  const template = REPLY_TEMPLATES[templateKey];
  if (!template) return "";
  const fn = template[baseLang] || template.en;
  return typeof fn === "function" ? fn(...args) : fn;
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

// ✅ UPDATED: Generate farming advice - responds directly in user's language
async function generateFarmingAdvice(message, keywords, conversationHistory = [], replyLang = "en") {
  const context = buildConversationContext(conversationHistory);
  const langName = LANG_MAP[replyLang] || "English";

  const prompt = `
You are AgriBuddy, a friendly and helpful agricultural assistant.

${context ? `Previous conversation:\n${context}\n\n` : ''}

Current user question: "${message}"
Related keywords: ${keywords.join(", ")}

IMPORTANT: You MUST respond in ${langName} language.

Your goal is to be lenient and conversational.
1. If the user wants to buy something, let them know you can help them find it.
2. If it's a farming question, provide a brief, helpful answer (2-3 sentences max) about farming techniques, best practices, or timing. Keep it simple and practical.
3. If asking for steps, provide a numbered step-by-step guide.
4. Do not reject questions related to agriculture, food, or shopping on this app. Just be helpful!
5. Always respond in ${langName}.
`;

  try {
    const reply = await callGeminiWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 400,
      },
    });

    return reply || "I'm sorry, I couldn't generate a response. Please try again in a moment.";
  } catch (err) {
    console.error("Gemini advice error:", err.message);
    if (err.status === 429) {
      return "⏳ I'm a bit busy right now. Please wait a few seconds and try again!";
    }
    return "I'm sorry, I couldn't process your request. Please try again.";
  }
}

// ✅ UPDATED: Main Chat Route with conversation history
router.post("/", async (req, res) => {
  try {
    let { message = "", cart = [], conversationHistory = [] } = req.body; // ✅ Accept history
    if (!message) return res.status(400).json({ error: "Message required" });

    console.log("📩 Received message:", message);
    console.log("📜 Conversation history length:", conversationHistory.length);

    // Detect language + Translate to English
    let lang = "en";
    let translatedInput = message;
    try {
      // Detect the actual language first
      lang = await detectLanguage(message);
      console.log("🌐 Detected language:", lang);

      if (lang !== "en") {
        translatedInput = await smartTranslate(message, "en");
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

    // Determine the reply language (base language for mixed codes)
    const replyLang = REPLY_LANG_MAP[lang] || lang;

    // STEP 2: Route based on intent
    if (intent === "segregate") {
      grouped = segregateProducts(cart);
      reply = getReply("segregate", lang);

    } else if (intent === "recommend") {
      products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10);
      reply = getReply("recommend", lang);

    } else if (intent === "search") {
      products = await searchProducts(keywords, query);

      if (products.length > 0) {
        reply = getReply("search_found", lang, products.length, keywords.join(", "));
      } else {
        reply = getReply("search_not_found", lang, keywords.join(", "));

        const advice = await generateFarmingAdvice(translatedInput, keywords, conversationHistory, replyLang);
        reply += `\n\n${advice}`;

        const broaderProducts = await Product.find({
          $or: [
            { category: { $regex: keywords[0] || "", $options: "i" } },
            { tag: { $regex: keywords[0] || "", $options: "i" } },
          ]
        }).limit(5);

        if (broaderProducts.length > 0) {
          products = broaderProducts;
          reply += getReply("related_products", lang);
        }
      }

    } else {
      // General intent - farming question with context
      const faqReply = getFAQReply(translatedInput);
      if (faqReply) {
        // FAQ replies are in English, translate if needed
        if (replyLang !== "en") {
          try {
            reply = await smartTranslate(faqReply, replyLang);
          } catch (err) {
            reply = faqReply;
          }
        } else {
          reply = faqReply;
        }
      } else {
        // Generate farming advice directly in user's language
        reply = await generateFarmingAdvice(translatedInput, keywords, conversationHistory, replyLang);

        if (keywords.length > 0) {
          const relatedProducts = await searchProducts(keywords, query);
          if (relatedProducts.length > 0) {
            products = relatedProducts.slice(0, 5);
            reply += getReply("also_need", lang);
          }
        }
      }
    }

    // STEP 3: Send response (no separate back-translation needed!)

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