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

  // ✅ LOAD DATA
  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem("clients") || "[]"));
    setLeads(JSON.parse(localStorage.getItem("leads") || "[]"));
  }, []);

  const selectedClient = clients.find(
    c => String(c.id) === String(selectedClientId)
  );

  // ✅ LOAD CLIENT DETAILS
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

  // ✅ CLIENT
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

  // ✅ COPY LINK
  function copyChatLink(clientId: string) {
    const link = window.location.origin + "/chat?client=" + clientId;
    navigator.clipboard.writeText(link);
    alert("Copied ✅");
  }

  // ✅ SAVE CONTACT
  function saveContact() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, contact: { phone, email } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));

    const id = selectedClientId;
    setSelectedClientId(null);
    setTimeout(() => setSelectedClientId(id), 0);

    alert("Saved ✅");
  }

  // ✅ ✅ FIXED SAVE LOGIN (IMPORTANT)
  function saveLogin() {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      alert("Enter username and password");
      return;
    }

    const updated = clients.map(c =>
      c.id === selectedClientId
        ? {
            ...c,
            login: {
              username: cleanUsername,
              password: cleanPassword
            }
          }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));

    const id = selectedClientId;
    setSelectedClientId(null);
    setTimeout(() => setSelectedClientId(id), 0);

    console.log("Saved login:", cleanUsername, cleanPassword);

    alert("Saved ✅");
  }

  // ✅ DELETE LEAD
  function deleteLead(lead: any) {
    const updated = leads.filter(
      l =>
        !(l.name === lead.name &&
          l.phone === lead.phone &&
          l.clientId === lead.clientId &&
          l.timestamp === lead.timestamp)
    );

    setLeads(updated);
    localStorage.setItem("leads", JSON.stringify(updated));
  }

  // ✅ ADD FAQ
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

  // ✅ DELETE FAQ
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
            border: "1px solid #444",
            background: "#222",
            color: "white"
          }}
        />

        <button
          onClick={addClient}
          style={{
            width: "100%",
            background: "#3b82f6",
            color: "white",
            padding: 10,
            borderRadius: 6
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
            <div>{client.name}</div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                copyChatLink(client.id);
              }}
              style={{
                width: "100%",
                marginTop: 6,
                background: "#1d4ed8",
                color: "white",
                padding: 6,
                borderRadius: 6,
                border: "2px solid black"
              }}
            >
              Copy Link
            </button>
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
                    background: activeTab === tab ? "#3b82f6" : "#d1d5db",
                    color: activeTab === tab ? "white" : "#111",
                    border: "none"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CARD */}
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #ddd"
            }}>

              {/* LEADS */}
              {activeTab === "leads" &&
                (clientLeads.length === 0 ? (
                  <p>No leads yet</p>
                ) : (
                  clientLeads.map((lead, i) => (
                    <div key={i} style={{
                      border: "2px solid #3b82f6",
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 10
                    }}>
                      <strong>{lead.name}</strong>
                      <div>{lead.phone}</div>

                      <button
                        onClick={() => deleteLead(lead)}
                        style={{
                          marginTop: 6,
                          background: "#ef4444",
                          color: "white",
                          padding: "6px 10px",
                          borderRadius: 6
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ))}

              {/* INFO */}
              {activeTab === "info" && (
                <>
                  <h3>Add FAQ</h3>
                  <input placeholder="Question" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <input placeholder="Answer" value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <button onClick={addFAQ} style={{ background: "#3b82f6", color: "white", padding: 10, borderRadius: 6 }}>Add FAQ</button>

                  <h3 style={{ marginTop: 20 }}>Saved FAQs</h3>

                  {(selectedClient.faqs || []).map((faq, i) => (
                    <div key={i} style={{ border: "2px solid #3b82f6", padding: 12, borderRadius: 10, marginBottom: 10 }}>
                      <strong>{faq.question}</strong>
                      <div>{faq.answer}</div>
                      <button onClick={() => deleteFAQ(i)} style={{ marginTop: 6, background: "#ef4444", color: "white", padding: "6px 10px", borderRadius: 6 }}>Delete</button>
                    </div>
                  ))}
                </>
              )}

              {/* CONTACT */}
              {activeTab === "contact" && (
                <>
                  <h3>Contact Info</h3>
                  <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <button onClick={saveContact} style={{ background: "#3b82f6", color: "white", padding: 10, borderRadius: 6 }}>Save Contact</button>
                </>
              )}

              {/* LOGIN */}
              {activeTab === "login" && (
                <>
                  <h3>Login Info</h3>
                  <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <button onClick={saveLogin} style={{ background: "#3b82f6", color: "white", padding: 10, borderRadius: 6 }}>Save Login</button>
                </>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}