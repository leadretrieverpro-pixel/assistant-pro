"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function sendMessage() {
    if (!message.trim()) return;

    setChat(prev => [...prev, { role: "user", text: message }]);
    setMessage("");

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

    setChat(prev => [
      ...prev,
      { role: "bot", text: "Thanks! We'll take care of that 👍" },
    ]);
  }

  function submitLead() {
    const storedLeads = JSON.parse(localStorage.getItem("leads") || "[]");

    localStorage.setItem(
      "leads",
      JSON.stringify([...storedLeads, { ...lead, clientId }])
    );

    setLeadCaptured(true);
    setCollectingLead(false);

    setChat(prev => [
      ...prev,
      { role: "bot", text: `Thanks ${lead.name}! 👍` },
    ]);

    setLead({ name: "", phone: "", email: "" });
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#7c3aed", // ✅ PURPLE BACKGROUND
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial",
      color: "#111" // ✅ ALL TEXT DARK
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        height: "80vh",
        background: "white",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 5px 20px rgba(0,0,0,0.2)"
      }}>

        {/* HEADER */}
        <div style={{
          padding: 15,
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: 18,
          color: "#111"
        }}>
          💬 Chat Support
        </div>

        {/* CHAT AREA */}
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
                background:
                  c.role === "user" ? "#3b82f6" : "#e5e7eb",
                color: "#111",
                padding: "10px 14px",
                borderRadius: 12,
                maxWidth: "75%",
                fontSize: 14
              }}
            >
              {c.text}
            </div>
          ))}

          {/* ✅ LEAD FORM FIXED */}
          {collectingLead && (
            <div style={{
              background: "white",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #ccc"
            }}>
              <input
                placeholder="Name"
                value={lead.name}
                onChange={(e) =>
                  setLead({ ...lead, name: e.target.value })
                }
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 10,
                  border: "1px solid #ccc",
                  color: "#111"
                }}
              />

              <input
                placeholder="Phone"
                value={lead.phone}
                onChange={(e) =>
                  setLead({ ...lead, phone: e.target.value })
                }
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 10,
                  border: "1px solid #ccc",
                  color: "#111"
                }}
              />

              <input
                placeholder="Email (optional)"
                value={lead.email}
                onChange={(e) =>
                  setLead({ ...lead, email: e.target.value })
                }
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 10,
                  border: "1px solid #ccc",
                  color: "#111"
                }}
              />

              <button
                onClick={submitLead}
                style={{
                  width: "100%",
                  background: "#3b82f6",
                  color: "white",
                  padding: 10,
                  border: "none",
                  borderRadius: 6
                }}
              >
                Submit
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR */}
        <div style={{
          display: "flex",
          borderTop: "1px solid #ddd",
          padding: 10
        }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              color: "#111"
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              marginLeft: 8,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "10px 16px"
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
