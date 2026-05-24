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

  const selectedClient = clients.find(c => c.id === selectedClientId);

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

  function formatDate(timestamp: number) {
    return timestamp ? new Date(timestamp).toLocaleString() : "";
  }

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

  function copyChatLink(clientId: string) {
    const link = window.location.origin + "/chat?client=" + clientId;
    navigator.clipboard.writeText(link);
    alert("Chat link copied ✅");
  }

  function saveContact() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, contact: { phone, email } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
    alert("Contact saved ✅");
  }

  function saveLogin() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, login: { username, password } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
    alert("Login saved ✅");
  }

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
          style={{ width: "100%", padding: 8, marginBottom: 6 }}
        />
        <button onClick={addClient} style={{ width: "100%" }}>Add</button>

        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              padding: 10,
              marginTop: 10,
              cursor: "pointer",
              background:
                selectedClientId === client.id ? "#3b82f6" : "transparent"
            }}
          >
            {client.name}

            <button
              onClick={(e) => {
                e.stopPropagation();
                copyChatLink(client.id);
              }}
              style={{ display: "block", marginTop: 5 }}
            >
              Copy Link
            </button>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 30, background: "#e5e7eb" }}>
        {!selectedClient ? (
          <h2>Select a client</h2>
        ) : (
          <>
            <h2>{selectedClient.name}</h2>

            {/* TABS */}
            <div style={{ marginBottom: 20 }}>
              {["leads", "info", "contact", "login"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div style={{ background: "white", padding: 20, borderRadius: 12 }}>

              {/* ✅ LEADS */}
              {activeTab === "leads" &&
                clientLeads.map((lead, i) => (
                  <div key={i}>
                    <strong>{lead.name}</strong> - {lead.phone}
                  </div>
                ))
              }

              {/* ✅ INFO (FAQs) */}
              {activeTab === "info" && (
                <>
                  <input
                    placeholder="Question"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                  />

                  <input
                    placeholder="Answer"
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                  />

                  <button onClick={addFAQ}>Add FAQ</button>

                  {(selectedClient.faqs || []).map((faq, i) => (
                    <div key={i}>
                      <strong>{faq.question}</strong>
                      <div>{faq.answer}</div>
                      <button onClick={() => deleteFAQ(i)}>Delete</button>
                    </div>
                  ))}
                </>
              )}

              {/* ✅ CONTACT */}
              {activeTab === "contact" && (
                <>
                  <input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <button onClick={saveContact}>Save Contact</button>
                </>
              )}

              {/* ✅ LOGIN */}
              {activeTab === "login" && (
                <>
                  <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <input
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button onClick={saveLogin}>Save Login</button>
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