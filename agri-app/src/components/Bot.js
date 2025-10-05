import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  Animated,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "http://192.168.0.103:4000/api/v1";

// FAQ Database
const FAQ = [
  {
    keywords: ["hello", "hi", "hey", "chibai", "hei"],
    reply_en: "👋 Hello! I'm AgriBot. How can I help you today?",
    reply_mizo: "👋 Chibai! Ka hming AgriBot. Engtin nge ka chhanna i neih ang?",
  },
  {
    keywords: ["help", "features", "ti ang che", "help duh"],
    reply_en:
      "🤖 I can:\n1️⃣ Search for products\n2️⃣ Recommend items\n3️⃣ Segregate your cart\n4️⃣ Answer general farming queries.",
    reply_mizo:
      "🤖 Ka tih theih ang hi:\n1️⃣ Product ziah zawng\n2️⃣ Hman theih ang chi a sawichhuah\n3️⃣ I cart ka thlanchhuah vek\n4️⃣ Ramri leh lo tarlan dan chungchang ka lo chhanna",
  },
  {
    keywords: ["cart", "segregate", "cart thlan", "segregate duh"],
    reply_en: "🛒 I can group your cart into 🌾 Seeds, 🧪 Pesticides, and 🧤 PPE.",
    reply_mizo: "🛒 I cart ka thlanchhuah vek ang: 🌾 Seeds, 🧪 Pesticides leh 🧤 PPE.",
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

function matchFAQ(message) {
  const q = message.toLowerCase();
  for (const f of FAQ) {
    if (f.keywords.some((k) => q.includes(k))) {
      if (/chibai|ti ang che|duh|zawng|thei|ang che|ka kal|engtin|hming/i.test(q)) {
        return f.reply_mizo || f.reply_en;
      }
      return f.reply_en;
    }
  }
  return null;
}

export default function Bot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]); // ✅ NEW: Store conversation
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMessages([
      { sender: "bot", text: "👋 Hi! I'm AgriBot. Ask me in English or Mizo." },
    ]);
  }, []);

  const toggleChat = () => {
    setOpen(!open);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const toggleShowAll = (index) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, showAll: !msg.showAll } : msg
      )
    );
  };

  // ✅ NEW: Clear conversation history
  const clearHistory = () => {
    setConversationHistory([]);
    setMessages([
      { sender: "bot", text: "👋 Conversation cleared! How can I help you?" },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { sender: "user", text: input };
    const currentInput = input;
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Check FAQ first
    const faqReply = matchFAQ(currentInput);
    if (faqReply) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: faqReply }]);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      // Get cart data
      let cart = [];
      try {
        const cartData = await AsyncStorage.getItem("cart");
        cart = cartData ? JSON.parse(cartData) : [];
      } catch (err) {
        console.error("Error reading cart:", err);
        cart = [];
      }

      // ✅ NEW: Send conversation history with request
      const { data } = await axios.post(`${API_BASE}/appChat`, {
        message: currentInput,
        cart: cart,
        conversationHistory: conversationHistory, // ✅ Include chat history
      });

      console.log("Received response:", data);

      // ✅ NEW: Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: currentInput },
        { role: "assistant", content: data.text },
      ];
      
      // ✅ Keep only last 10 messages (5 exchanges) to avoid token limits
      const trimmedHistory = newHistory.slice(-10);
      setConversationHistory(trimmedHistory);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.text || "I received your message.",
          products: data.products || null,
          grouped: data.grouped || null,
          showAll: false,
        },
      ]);
    } catch (err) {
      console.error("Chat API error:", err);
      
      let errorMessage = "⚠️ Server error. Please try later.";
      
      if (err.response) {
        errorMessage = `⚠️ ${err.response.data?.error || err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "⚠️ Cannot reach server. Check your connection.";
      }
      
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Action Button */}
      {!open && (
        <TouchableOpacity onPress={toggleChat} style={styles.fab}>
          <Text style={{ fontSize: 22 }}>💬</Text>
        </TouchableOpacity>
      )}

      {/* Chat Window */}
      {open && (
        <Animated.View style={styles.chatBox}>
          {/* Header with Clear Button */}
          <View style={styles.header}>
            <Text style={styles.headerText}>AgriBot🌱</Text>
            <View style={styles.headerButtons}>
              {/* ✅ NEW: Clear history button */}
              <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleChat}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Container */}
          <ScrollView
            ref={scrollRef}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
            style={styles.messages}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {messages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.message,
                  m.sender === "user" ? styles.userMsg : styles.botMsg,
                ]}
              >
                <Text style={styles.messageText}>{m.text}</Text>

                {/* Product List */}
                {m.products && m.products.length > 0 && (
                  <View style={styles.productsContainer}>
                    {(m.showAll ? m.products : m.products.slice(0, 3)).map(
                      (p) => (
                        <TouchableOpacity
                          key={p._id}
                          style={styles.productCard}
                          onPress={() => {
                            Linking.openURL(
                              `https://yourappdomain.com/product/item/${p._id}`
                            ).catch(err => console.error("Error opening URL:", err));
                          }}
                        >
                          {p.images?.[0] && (
                            <Image
                              source={{ uri: p.images[0] }}
                              style={styles.productImage}
                              resizeMode="cover"
                            />
                          )}
                          <Text style={styles.productName} numberOfLines={2}>
                            {p.name?.en || p.name}
                          </Text>
                          {p.sellers?.[0]?.price_size?.[0] && (
                            <Text style={styles.price}>
                              ₹{p.sellers[0].price_size[0].discountedPrice ||
                                p.sellers[0].price_size[0].price}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )
                    )}
                    
                    {m.products.length > 3 && (
                      <TouchableOpacity 
                        onPress={() => toggleShowAll(i)}
                        style={styles.showMoreBtn}
                      >
                        <Text style={styles.showMoreText}>
                          {m.showAll 
                            ? "Show Less ▲" 
                            : `Show All (${m.products.length}) ▼`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Cart Segregation Summary */}
                {m.grouped && (
                  <View style={styles.groupedContainer}>
                    <Text style={styles.groupedText}>
                      🌾 Seeds: {m.grouped.seeds?.length || 0}
                    </Text>
                    <Text style={styles.groupedText}>
                      🧪 Pesticides: {m.grouped.pesticides?.length || 0}
                    </Text>
                    <Text style={styles.groupedText}>
                      🧤 PPE: {m.grouped.ppe?.length || 0}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            
            {isLoading && (
              <View style={[styles.message, styles.botMsg]}>
                <Text style={styles.messageText}>Typing...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              style={styles.input}
              editable={!isLoading}
              returnKeyType="send"
            />
            <TouchableOpacity 
              onPress={sendMessage} 
              style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.sendBtnText}>
                {isLoading ? "..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    right: 20,
    zIndex: 999,
  },
  fab: {
    backgroundColor: "#15803d",
    width: 60,
    height: 60,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  chatBox: {
    backgroundColor: "#f0fdf4",
    width: 320,
    height: 450,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  header: {
    backgroundColor: "#166534",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearBtn: { padding: 4 },
  clearBtnText: {color:"white",fontWeight:"bold", fontSize: 17 },
  closeBtn: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
  messages: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0fdf4",
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "85%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#bbf7d0",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1f2937",
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1f2937",
  },
  sendBtn: {
    backgroundColor: "#15803d",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 8,
    minWidth: 65,
  },
  sendBtnDisabled: { backgroundColor: "#9ca3af" },
  sendBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  productsContainer: { marginTop: 10 },
  productCard: {
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  productImage: {
    width: "100%",
    height: 90,
    borderRadius: 6,
    marginBottom: 6,
  },
  productName: {
    fontWeight: "600",
    color: "#166534",
    fontSize: 13,
    marginBottom: 3,
  },
  price: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  showMoreBtn: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 4,
    backgroundColor: "#e0f2fe",
    borderRadius: 6,
  },
  showMoreText: {
    color: "#15803d",
    fontSize: 13,
    fontWeight: "600",
  },
  groupedContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#e7f8ec",
    borderRadius: 6,
  },
  groupedText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "500",
    marginBottom: 2,
  },
});