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

  const [faqs, setFaqs] = useState<any[]>([]);
  const [contact, setContact] = useState({ phone: "", email: "" });

  const [lastQuestion, setLastQuestion] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");
      const client = storedClients.find(
        (c: any) => String(c.id) === String(clientId)
      );

      if (client) {
        setFaqs(client.faqs || []);
        setContact(client.contact || {});
      }
    } catch {}
  }, [clientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function sendMessage() {
    if (!message.trim()) return;

    const userText = message.trim();

    setLastQuestion(userText);
    setChat(prev => [...prev, { role: "user", text: userText }]);
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
      { role: "bot", text: "Thanks! We'll take care of that for you 👍" },
    ]);
  }

  function submitLead() {
    const storedLeads = JSON.parse(localStorage.getItem("leads") || "[]");

    const newLead = {
      ...lead,
      clientId,
      timestamp: Date.now(),
    };

    localStorage.setItem("leads", JSON.stringify([...storedLeads, newLead]));

    setLeadCaptured(true);
    setCollectingLead(false);

    setChat(prev => [
      ...prev,
      {
        role: "bot",
        text: `Thanks ${lead.name}! 👍 Let me help you with that.`,
      },
    ]);

    setLead({ name: "", phone: "", email: "" });
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        height: "80vh",
        background: "white",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
      }}>

        {/* HEADER */}
        <div style={{
          padding: 15,
          borderBottom: "1px solid #eee",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: 18
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
                color:
                  c.role === "user" ? "white" : "#111",
                padding: "10px 14px",
                borderRadius: 12,
                maxWidth: "75%",
                fontSize: 14
              }}
            >
              {c.text}
            </div>
          ))}

          {/* LEAD FORM */}
          {collectingLead && (
            <div style={{
              background: "#f9fafb",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd"
            }}>
              <input
                placeholder="Name"
                value={lead.name}
                onChange={(e) =>
                  setLead({ ...lead, name: e.target.value })
                }
                style={{ width: "100%", marginBottom: 6, padding: 8 }}
              />

              <input
                placeholder="Phone"
                value={lead.phone}
                onChange={(e) =>
                  setLead({ ...lead, phone: e.target.value })
                }
                style={{ width: "100%", marginBottom: 6, padding: 8 }}
              />

              <input
                placeholder="Email (optional)"
                value={lead.email}
                onChange={(e) =>
                  setLead({ ...lead, email: e.target.value })
                }
                style={{ width: "100%", marginBottom: 6, padding: 8 }}
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
          borderTop: "1px solid #eee",
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
              border: "1px solid #ccc"
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
