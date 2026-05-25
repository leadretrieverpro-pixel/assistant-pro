"use client";

import React, { useState, useEffect } from "react";

export default function DashboardPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState<any[]>([]);

  const [clientName, setClientName] = useState("");

  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem("clients") || "[]"));
    setLeads(JSON.parse(localStorage.getItem("leads") || "[]"));
  }, []);

  const selectedClient = clients.find(
    c => String(c.id) === String(selectedClientId)
  );

  useEffect(() => {
    if (selectedClient) {
      setPhone(selectedClient.contact?.phone || "");
      setEmail(selectedClient.contact?.email || "");
      setUsername(selectedClient.login?.username || "");
      setPassword(selectedClient.login?.password || "");
    }
  }, [selectedClient]);

  const clientLeads = leads.filter(
    l => selectedClient && l.clientId === selectedClient.id
  );

  function addClient() {
    if (!clientName.trim()) return;

    const newClient = {
      id: Date.now().toString(),
      name: clientName,
      faqs: [],
      contact: { phone: "", email: "" },
      login: { username: "", password: "" }
    };

    const updated = [...clients, newClient];
    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
    setClientName("");
  }

  function saveContact() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, contact: { phone, email } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
    alert("Saved ✅");
  }

  function saveLogin() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, login: { username, password } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
    alert("Saved ✅");
  }

  function addFAQ() {
    if (!faqQuestion || !faqAnswer || !selectedClient) return;

    const updated = clients.map(c =>
      c.id === selectedClient.id
        ? {
            ...c,
            faqs: [...(c.faqs || []), { question: faqQuestion, answer: faqAnswer }]
          }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));

    setFaqQuestion("");
    setFaqAnswer("");
  }

  function deleteFAQ(index: number) {
    const updated = clients.map(c => {
      if (c.id === selectedClientId) {
        const newFaqs = [...(c.faqs || [])];
        newFaqs.splice(index, 1);
        return { ...c, faqs: newFaqs };
      }
      return c;
    });

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial", color: "#111" }}>

      {/* SIDEBAR */}
      <div style={{ width: 260, background: "#111", color: "white", padding: 20 }}>
        <h2>Clients</h2>

        <input
          placeholder="New client"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={addClient}
          style={{
            width: "100%",
            background: "#3b82f6",
            color: "white",
            padding: 10,
            borderRadius: 6,
            border: "none"
          }}
        >
          Add Client
        </button>

        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 8,
              background: selectedClientId === client.id ? "#3b82f6" : "#1f2937",
              cursor: "pointer"
            }}
          >
            {client.name}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 30, background: "#f3f4f6" }}>
        {!selectedClient ? (
          <h2>Select a client</h2>
        ) : (
          <>
            <h2>{selectedClient.name}</h2>

            {/* TABS */}
            <div style={{ marginBottom: 20 }}>
              {["leads", "info", "contact", "login"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    marginRight: 10,
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: "none",
                    background:
                      activeTab === tab ? "#3b82f6" : "#d1d5db",
                    color:
                      activeTab === tab ? "white" : "#111"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT CARD */}
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #ddd"
            }}>

              {/* ✅ INFO */}
              {activeTab === "info" && (
                <>
                  <h3>Add FAQ</h3>

                  <input
                    placeholder="Question"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6
                    }}
                  />

                  <input
                    placeholder="Answer"
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6
                    }}
                  />

                  <button
                    onClick={addFAQ}
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      padding: 10,
                      borderRadius: 6
                    }}
                  >
                    Add FAQ
                  </button>
                </>
              )}

              {/* ✅ CONTACT */}
              {activeTab === "contact" && (
                <>
                  <h3>Contact Info</h3>

                  <label>Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6
                    }}
                  />

                  <label>Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6
                    }}
                  />

                  <button
                    onClick={saveContact}
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      padding: 10,
                      borderRadius: 6
                    }}
                  >
                    Save Contact
                  </button>
                </>
              )}

              {/* ✅ LOGIN */}
              {activeTab === "login" && (
                <>
                  <h3>Client Login</h3>

                  <label>Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6
                    }}
                  />

                  <label>Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6
                    }}
                  />

                  <button
                    onClick={saveLogin}
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      padding: 10,
                      borderRadius: 6
                    }}
                  >
                    Save Login
                  </button>
                </>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
``