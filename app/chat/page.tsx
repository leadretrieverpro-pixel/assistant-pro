"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const params = useSearchParams();
  const clientId = params.get("client");

  const [chat, setChat] = useState([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);

  const [message, setMessage] = useState("");

  const [leadCaptured, setLeadCaptured] = useState(false);
  const [collectingLead, setCollectingLead] = useState(false);

  // ✅ UPDATED: includes email
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });

  const [faqs, setFaqs] = useState<any[]>([]);
  const [contact, setContact] = useState({ phone: "", email: "" });

  const [lastQuestion, setLastQuestion] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ✅ LOAD CLIENT DATA
  useEffect(() => {
    try {
      const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");

      const client = storedClients.find(
        (c: any) => String(c.id) === String(clientId)
      );

      if (client) {
        setFaqs(client.faqs || []);
        setContact(client.contact || { phone: "", email: "" });
      }
    } catch {
      setFaqs([]);
      setContact({ phone: "", email: "" });
    }
  }, [clientId]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

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

      let score = matches / qWords.length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    if (bestScore >= 0.5 && bestMatch) {
      return bestMatch.answer;
    }

    return null;
  }

  function getContactMessage() {
    let message =
      "I’m not able to answer that, but a member of our team would be happy to help.\n\n";

    if (contact.phone) {
      message += `📞 Phone: ${contact.phone}\n`;
    }

    if (contact.email) {
      message += `📧 Email: ${contact.email}`;
    }

    return message;
  }

  function sendMessage() {
    if (!message.trim()) return;

    const userText = message.trim();

    setLastQuestion(userText);

    setChat((prev) => [...prev, { role: "user", text: userText }]);

    setMessage("");

    if (!leadCaptured) {
      setChat((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            "Before I answer, can you provide your name and phone number (email optional)?",
        },
      ]);

      setCollectingLead(true);
      return;
    }

    const answer = getFAQAnswer(userText);

    if (answer) {
      setChat((prev) => [...prev, { role: "bot", text: answer }]);
      return;
    }

    setChat((prev) => [
      ...prev,
      {
        role: "bot",
        text: getContactMessage(),
      },
    ]);
  }

  function answerAfterLead() {
    if (!lastQuestion) return;

    const answer = getFAQAnswer(lastQuestion);

    if (answer) {
      setChat((prev) => [...prev, { role: "bot", text: answer }]);
    } else {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: getContactMessage() },
      ]);
    }
  }

  function submitLead() {
    if (!lead.name.trim() || !lead.phone.trim()) {
      alert("Please fill in name and phone.");
      return;
    }

    const storedLeads = JSON.parse(localStorage.getItem("leads") || "[]");

    const newLead = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email, // ✅ NEW
      clientId,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      "leads",
      JSON.stringify([...storedLeads, newLead])
    );

    setLeadCaptured(true);
    setCollectingLead(false);

    setChat((prev) => [
      ...prev,
      {
        role: "bot",
        text: `Thanks ${lead.name}! Here's the answer to your question:`,
      },
    ]);

    // ✅ RESET ALL FIELDS
    setLead({ name: "", phone: "", email: "" });

    setTimeout(answerAfterLead, 500);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
        color: "#111",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "white",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #ccc",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 10 }}>
          Chat Support
        </h2>

        <div
          style={{
            height: 420,
            overflowY: "auto",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {chat.map((c, i) => (
            <div
              key={i}
              style={{
                alignSelf: c.role === "user" ? "flex-end" : "flex-start",
                background:
                  c.role === "user" ? "#3b82f6" : "#d1d5db",
                color:
                  c.role === "user" ? "white" : "#111",
                padding: "10px 14px",
                borderRadius: 12,
                maxWidth: "75%",
                whiteSpace: "pre-wrap",
              }}
            >
              {c.text}
            </div>
          ))}

          {collectingLead && (
            <div>
              <input
                placeholder="Name"
                value={lead.name}
                onChange={(e) =>
                  setLead({ ...lead, name: e.target.value })
                }
                style={{ width: "100%", marginBottom: 6, padding: 10 }}
              />

              <input
                placeholder="Phone"
                value={lead.phone}
                onChange={(e) =>
                  setLead({ ...lead, phone: e.target.value })
                }
                style={{ width: "100%", marginBottom: 6, padding: 10 }}
              />

              {/* ✅ NEW EMAIL FIELD */}
              <input
                placeholder="Email (optional)"
                value={lead.email}
                onChange={(e) =>
                  setLead({ ...lead, email: e.target.value })
                }
                style={{ width: "100%", marginBottom: 6, padding: 10 }}
              />

              <button onClick={submitLead}>Submit</button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div style={{ display: "flex", marginTop: 10 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: 10 }}
          />

          <button
            onClick={sendMessage}
            style={{
              marginLeft: 8,
              background: "#3b82f6",
              color: "white",
              padding: "10px 16px",
              border: "none",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}