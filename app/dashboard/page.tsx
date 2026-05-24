"use client";

import React, { useState, useEffect } from "react";

export default function DashboardPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState<any[]>([]);

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
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString();
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

        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              padding: 10,
              marginTop: 10,
              borderRadius: 6,
              cursor: "pointer",
              background:
                selectedClientId === client.id ? "#3b82f6" : "transparent"
            }}
          >
            <div>{client.name}</div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                copyChatLink(client.id);
              }}
              style={{
                marginTop: 6,
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12
              }}
            >
              Copy Chat Link
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
                  {tab === "leads"
                    ? "Leads"
                    : tab === "info"
                    ? "Company Info"
                    : tab === "contact"
                    ? "Contact Info"
                    : "Login Info"}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div style={{ background: "white", padding: 20, borderRadius: 12 }}>

              {/* ✅ LEADS (SORTED NEWEST FIRST) */}
              {activeTab === "leads" &&
                clientLeads
                  .slice() // ✅ avoids mutating original array
                  .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                  .map((lead, i) => (
                    <div key={i} style={{
                      border: "2px solid #3b82f6",
                      borderRadius: 10,
                      padding: 15,
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "space-between"
                    }}>
                      <div>
                        <strong>{lead.name}</strong>
                        <div>{lead.phone}</div>

                        {lead.email && (
                          <div style={{ marginTop: 3 }}>
                            📧 {lead.email}
                          </div>
                        )}

                        <div style={{
                          fontSize: 12,
                          marginTop: 5,
                          color: "#555"
                        }}>
                          {formatDate(lead.timestamp)}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteLead(lead)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "none"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
              }

              {/* rest unchanged */}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
