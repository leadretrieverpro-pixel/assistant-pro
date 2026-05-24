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
    const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    const storedLeads = JSON.parse(localStorage.getItem("leads") || "[]");

    setClients(storedClients);
    setLeads(storedLeads);
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

  // ✅ FIXED CLIENT CREATION
  function addClient() {
    if (!clientName.trim()) return;

    const newClient = {
      id: Date.now().toString(),
      name: clientName,
      faqs: [],
      contact: { phone: "", email: "" }, // ✅ FIXED
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
    alert("Copied ✅");
  }

  function saveContact() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, contact: { phone, email } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
  }

  function saveLogin() {
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, login: { username, password } }
        : c
    );

    setClients(updated);
    localStorage.setItem("clients", JSON.stringify(updated));
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

  // ✅ FIXED FAQ ADD
  function addFAQ() {
    if (!faqQuestion || !faqAnswer || !selectedClient) return;

    const updatedClients = clients.map(c =>
      c.id === selectedClient.id
        ? {
            ...c,
            faqs: [...(c.faqs || []), { question: faqQuestion, answer: faqAnswer }]
          }
        : c
    );

    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));

    setSelectedClientId(null);
    setTimeout(() => setSelectedClientId(selectedClient.id), 0);

    setFaqQuestion("");
    setFaqAnswer("");
  }

  // ✅ FIXED FAQ DELETE
  function deleteFAQ(index: number) {
    const updatedClients = clients.map(c => {
      if (c.id === selectedClientId) {
        const newFaqs = [...(c.faqs || [])];
        newFaqs.splice(index, 1);
        return { ...c, faqs: newFaqs };
      }
      return c;
    });

    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));

    setSelectedClientId(null);
    setTimeout(() => setSelectedClientId(selectedClientId), 0);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>

      {/* SIDEBAR */}
      <div style={{ width: 260, background: "#111", color: "white", padding: 20 }}>
        <h2>Clients</h2>

        <input
          placeholder="New client"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <button
          onClick={addClient}
          style={{
            width: "100%",
            background: "#3b82f6",
            color: "white",
            padding: 10,
            border: "none",
            borderRadius: 6
          }}
        >
          Add
        </button>

        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 8,
              background: selectedClientId === client.id ? "#3b82f6" : "#1f2937"
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>
              {client.name}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                copyChatLink(client.id);
              }}
              style={{
                width: "100%",
                background: "#3b82f6",
                color: "white",
                padding: 6,
                borderRadius: 6,
                border: "none"
              }}
            >
              Copy Link
            </button>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 30, background: "#f3f4f6", color: "#111" }}>
        {!selectedClient ? (
          <h2>Select a client</h2>
        ) : (
          <>
            <h2 style={{ marginBottom: 20 }}>{selectedClient.name}</h2>

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
                    background: activeTab === tab ? "#3b82f6" : "#d1d5db",
                    color: activeTab === tab ? "white" : "#111"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ background: "white", padding: 20, borderRadius: 12 }}>

              {activeTab === "leads" &&
                clientLeads.map((lead, i) => (
                  <div key={i}>
                    <strong>{lead.name}</strong> - {lead.phone}
                  </div>
                ))
              }

              {activeTab === "info" && (
                <>
                  <input
                    placeholder="Question"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                  />

                  <input
                    placeholder="Answer"
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
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

            </div>
          </>
        )}
      </div>
    </div>
  );
}
