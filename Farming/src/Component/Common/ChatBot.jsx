import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";

const API_BASE =import.meta.env.VITE_API_URL || "http://localhost:4000";

// -------------------
// Local FAQ (English + Mizo)
// -------------------
const FAQ = [
  {
    keywords: ["hello", "hi", "hey", "chibai", "hei"],
    reply_en: "👋 Hello! I’m AgriBot. How can I help you today?",
    reply_mizo: "👋 Chibai! Ka hming AgriBot. Engtin nge ka chhanna i neih ang?",
  },
  {
    keywords: ["help", "what can you do", "features", "ti ang che", "help duh"],
    reply_en:
      "🤖 I can:\n1️⃣ Search for products\n2️⃣ Recommend items\n3️⃣ Segregate your cart\n4️⃣ Answer general farming queries.",
    reply_mizo:
      "🤖 Ka tih theih ang hi:\n1️⃣ Product ziah zawng\n2️⃣ Hman theih ang chi a sawichhuah\n3️⃣ I cart ka thlanchhuah vek\n4️⃣ Ramri leh lo tarlan dan chungchang ka lo chhanna",
  },
  {
    keywords: ["cart", "segregate", "cart thlan", "segregate duh"],
    reply_en: "🛒 I can group your cart into 🌾 Seeds, 🧪 Pesticides, and 🧤 PPE.",
    reply_mizo:
      "🛒 I cart ka thlanchhuah vek ang: 🌾 Seeds, 🧪 Pesticides leh 🧤 PPE.",
  },
  {
    keywords: ["recommend", "suggest", "product sawichhuah", "recommend duh"],
    reply_en: "💡 I can recommend some popular products to you.",
    reply_mizo: "💡 Product tha zawng zawng ka lo sawichhuah thei ang che.",
  },
  {
    keywords: ["bye", "goodbye", "ka chhuak", "ka kal", "kal ka"],
    reply_en: "👋 Goodbye! Come back anytime.",
    reply_mizo: "👋 Ka lawm e! Engtikah pawh i lo kal leh thei ang che.",
  },
];

// -------------------
// FAQ matcher (English + Mizo)
// -------------------
function matchFAQ(message) {
  const q = message.toLowerCase();
  for (const f of FAQ) {
    if (f.keywords.some((k) => q.includes(k))) {
      // Simple heuristic: if contains Mizo words, return Mizo reply
      if (/[áâêîôûāēīōū]|chibai|ti ang che|duh|ka/.test(q)) {
        return f.reply_mizo || f.reply_en;
      }
      return f.reply_en;
    }
  }
  return null;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([
      { sender: "bot", text: "👋 Hi! I’m AgriBot. Ask me in English or Mizo." },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 🔹 Step 1: Check FAQ locally (no backend call if matched)
    const faqReply = matchFAQ(input);
    if (faqReply) {
      setMessages((prev) => [...prev, { sender: "bot", text: faqReply }]);
      return;
    }

    // 🔹 Step 2: If not FAQ, call backend
    try {
      const { data } = await axios.post(`${API_BASE}/chat`, {
        message: input,
        cart: JSON.parse(localStorage.getItem("cart") || "[]"),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.text,
          products: data.products,
          grouped: data.grouped,
          showAll: false,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Server error. Please try later." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {/* Chat Window */}
      {open && (
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 w-80 mb-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-mizoram-600 to-mizoram-700 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">AgriBot</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-white hover:text-mizoram-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col h-96">
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-sm"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs ${
                      m.sender === "user" ? "bg-blue-200" : "bg-gray-200"
                    }`}
                  >
                    {m.text}

                    {/* Product suggestions */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-2">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {(m.showAll
                            ? m.products
                            : m.products.slice(0, 3)
                          ).map((p) => (
                            <Link
                              key={p._id}
                              to={`/product/item/${p._id}`}
                              className="block border rounded p-2 bg-white hover:bg-green-100 transition"
                            >
                              {/* Thumbnail */}
                              {p.images && p.images.length > 0 && (
                                <img
                                  src={p.images[0]}
                                  alt={p.name?.en || p.name}
                                  className="w-full h-20 object-cover rounded mb-1"
                                />
                              )}

                              {/* Product info */}
                              <div className="font-bold text-xs text-green-700">
                                {p.name?.en || p.name}
                              </div>

                              {/* Price (first seller) */}
                              {p.sellers?.[0]?.price_size?.[0] && (
                                <div className="text-[12px] text-gray-800 mt-1">
                                  💰{" "}
                                  {p.sellers[0].price_size[0].discountedPrice ||
                                    p.sellers[0].price_size[0].price}{" "}
                                  ₹
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>

                        {/* Expand/Collapse button */}
                        {m.products.length > 3 && (
                          <button
                            className="text-blue-600 text-xs hover:underline block mt-1"
                            onClick={() => {
                              setMessages((prev) =>
                                prev.map((msg, i) =>
                                  i === idx
                                    ? { ...msg, showAll: !msg.showAll }
                                    : msg
                                )
                              );
                            }}
                          >
                            {m.showAll
                              ? "Show less ↑"
                              : `View all ${m.products.length} results →`}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Grouped cart summary */}
                    {m.grouped && (
                      <div className="mt-2 text-[11px]">
                        🌾 Seeds: {m.grouped.seeds.length} | 🧪 Pesticides:{" "}
                        {m.grouped.pesticides.length} | 🧤 PPE:{" "}
                        {m.grouped.ppe.length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex border-t p-3 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="ml-3 bg-mizoram-600 hover:bg-mizoram-700 text-white p-2 rounded-full transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gradient-to-r from-mizoram-600 to-mizoram-700 hover:from-mizoram-700 hover:to-mizoram-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
