"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

function ChatComponent() {
  const params = useSearchParams();
  const clientId = params.get("client");

  const [chat, setChat] = useState([
    { role: "bot", text: "Hi! 👋 How can I help you today?" },
  ]);

  const [message, setMessage] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [collectingLead, setCollectingLead] = useState(false);

  const [lead, setLead] = useState({ name: "", phone: "", email: "" });

  // ✅ NEW: FAQ + CONTACT
  const [faqs, setFaqs] = useState<any[]>([]);
  const [contact, setContact] = useState({ phone: "", email: "" });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ✅ LOAD CLIENT DATA
  // ✅ LOAD CLIENT DATA
useEffect(() => {
  async function loadClientData() {
    if (!clientId) return;

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", String(clientId))
      .maybeSingle();

    console.log("CHAT FETCH:", data, error);

    if (error) {
      console.error("Error loading chat config:", error);
      return;
    }

    if (!data) return;

    setFaqs(data.faqs || []);
    setContact({
      phone: data.phone || "",
      email: data.email || "",
    });
  }

  loadClientData();
}, [clientId]);

// ✅ AUTO SCROLL
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chat, collectingLead]);

  // ✅ FAQ MATCHING FUNCTION
  function getFAQAnswer(text: string) {
    const userWords = text.toLowerCase().split(" ");

    let bestMatch = null;
    let bestScore = 0;

    for (let faq of faqs) {
      const qWords = faq.question.toLowerCase().split(" ");

      let matches = 0;

      for (let word of qWords) {
        if (userWords.includes(word)) {
          matches++;
        }
      }

      const score = matches / qWords.length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    if (bestScore >= 0.4 && bestMatch) {
      return bestMatch.answer;
    }

    return null;
  }

  // ✅ SEND MESSAGE (FIXED)
  function sendMessage() {
    if (!message.trim()) return;

    const userText = message.trim();

    setChat(prev => [...prev, { role: "user", text: userText }]);
    setMessage("");

    // ✅ LEAD GATE
    if (!leadCaptured) {
      setChat(prev => [
        ...prev,
        {
          role: "bot",
          text:
            "Before I answer, can I grab your name and phone number? (email optional)",
        },
      ]);
      setCollectingLead(true);
      return;
    }

    // ✅ FAQ RESPONSE
    const answer = getFAQAnswer(userText);

    if (answer) {
      setChat(prev => [...prev, { role: "bot", text: answer }]);
    } else {
      setChat(prev => [
        ...prev,
        {
          role: "bot",
          text: getFallbackMessage(),
        },
      ]);
    }
  }

  // ✅ FALLBACK MESSAGE
  function getFallbackMessage() {
    let msg =
      "I’m not sure about that, but our team can help you.\n\n";

    if (contact.phone) msg += `📞 ${contact.phone}\n`;
    if (contact.email) msg += `📧 ${contact.email}`;

    return msg;
  }

  async function submitLead() {
    console.log("SUBMIT BUTTON CLICKED");

  if (!lead.name || !lead.phone) return;

  const { error } = await supabase.from("leads").insert([
    {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      client_id: clientId,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Error saving lead:", error);
    alert("Error saving lead");
    return;
  }

  setLeadCaptured(true);
  setCollectingLead(false);

  setChat(prev => [
    ...prev,
    { role: "bot", text: `Thanks ${lead.name}! 👍 Ask me anything.` },
  ]);

  setLead({ name: "", phone: "", email: "" });
}


  return (
    <div style={{
      minHeight: "100vh",
      background: "#7c3aed",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial",
      color: "#111"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        height: "80vh",
        background: "white",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
      }}>

        <div style={{
          padding: 15,
          borderBottom: "1px solid #ddd",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          💬 Chat Support
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 15,
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}>
          {chat.map((c, i) => (
            <div
              key={i}
              style={{
                alignSelf: c.role === "user" ? "flex-end" : "flex-start",
                background: c.role === "user" ? "#3b82f6" : "#e5e7eb",
                color: c.role === "user" ? "white" : "#111",
                padding: "10px 14px",
                borderRadius: 12,
                maxWidth: "75%"
              }} 
            >
              {c.text}
            </div>
          ))}

          {collectingLead && (
            <div style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}>
              <input
                placeholder="Name"
                value={lead.name}
                onChange={(e) =>
                  setLead({ ...lead, name: e.target.value })
                }
              />

              <input
                placeholder="Phone"
                value={lead.phone}
                onChange={(e) =>
                  setLead({ ...lead, phone: e.target.value })
                }
              />

              <input
                placeholder="Email (optional)"
                value={lead.email}
                onChange={(e) =>
                  setLead({ ...lead, email: e.target.value })
                }
              />

              <button onClick={submitLead}>Submit</button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div style={{ display: "flex", padding: 10 }}>
          <input
  placeholder="Type your message here..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  style={{
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "2px solid #3b82f6",   // ✅ BLUE BORDER
    outline: "none",
    marginRight: 8
  }}
/>


          <button
  onClick={sendMessage}
  style={{
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer"
  }}
>
  Send
</button>

        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatComponent />
    </Suspense>
  );
}