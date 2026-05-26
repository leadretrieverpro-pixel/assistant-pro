"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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

  // ✅ LOAD CLIENTS FROM SUPABASE
  useEffect(() => {
    async function loadClients() {
      const { data, error } = await supabase.from("clients").select("*");

      if (error) {
        console.error("Error loading clients:", error);
        return;
      }

      setClients(data || []);
    }

    loadClients();
  }, []);

  const selectedClient = clients.find(
    (c) => String(c.id) === String(selectedClientId)
  );

  // ✅ LOAD CLIENT DETAILS INTO FORM
  useEffect(() => {
  if (selectedClient) {
    setPhone((prev) => prev || selectedClient.phone || "");
    setEmail((prev) => prev || selectedClient.email || "");
    setUsername((prev) => prev || selectedClient.username || "");
    setPassword((prev) => prev || selectedClient.password || "");
  }
}, [selectedClient]);


  const clientLeads = leads.filter(
    (l) => selectedClient && l.clientId === selectedClient.id
  );

  // ✅ ADD CLIENT (SUPABASE)
  async function addClient() {
    if (!clientName.trim()) return;

    const { data, error } = await supabase
      .from("clients")
      .insert([
        {
          name: clientName,
          username: "",
          password: "",
          phone: "",
          email: "",
        },
      ])
      .select();

    if (error) {
      console.error("Error adding client:", error);
      alert("Error saving client");
      return;
    }

    setClients([...(clients || []), ...(data || [])]);
    setClientName("");
  }

  // ✅ COPY LINK
  function copyChatLink(clientId: string) {
    const link = window.location.origin + "/chat?client=" + clientId;
    navigator.clipboard.writeText(link);
    alert("Copied ✅");
  }

  // ✅ SAVE CONTACT (SUPABASE)
  async function saveContact() {
    if (!selectedClientId) return;

    const { error } = await supabase
      .from("clients")
      .update({ phone, email })
      .eq("id", String(selectedClientId));
``

    if (error) {
      console.error(error);
      alert("Error saving contact");
      return;
    }

    const { data } = await supabase.from("clients").select("*");
setClients(data || []);

alert("Saved ✅");
  }

  // ✅ SAVE LOGIN (SUPABASE)
  async function saveLogin() {
    if (!selectedClientId) return;

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      alert("Enter username and password");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({
        username: cleanUsername,
        password: cleanPassword,
      })
      .eq("id", String(selectedClientId));
``

    if (error) {
      console.error("Error saving login:", error);
      alert("Error saving login");
      return;
    }

    const { data } = await supabase.from("clients").select("*");
setClients(data || []);

alert("Saved ✅");

  }

  // ✅ DELETE LEAD (TEMP LOCAL ONLY)
  function deleteLead(lead: any) {
    const updated = leads.filter(
      (l) =>
        !(
          l.name === lead.name &&
          l.phone === lead.phone &&
          l.clientId === lead.clientId &&
          l.timestamp === lead.timestamp
        )
    );

    setLeads(updated);
  }

  // ✅ FAQ ADD (TEMP LOCAL ONLY)
  function addFAQ() {
    if (!faqQuestion || !faqAnswer || !selectedClient) return;

    const updated = clients.map((c) =>
      c.id === selectedClient.id
        ? {
            ...c,
            faqs: [...(c.faqs || []), { question: faqQuestion, answer: faqAnswer }],
          }
        : c
    );

    setClients(updated);

    setFaqQuestion("");
    setFaqAnswer("");
  }

  // ✅ FAQ DELETE (TEMP LOCAL ONLY)
  function deleteFAQ(index: number) {
    const updated = clients.map((c) => {
      if (c.id === selectedClientId) {
        const newFaqs = [...(c.faqs || [])];
        newFaqs.splice(index, 1);
        return { ...c, faqs: newFaqs };
      }
      return c;
    });

    setClients(updated);
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
            color: "white",
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
          }}
        >
          Add Client
        </button>

        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 8,
              background: selectedClientId === client.id ? "#3b82f6" : "#1f2937",
              cursor: "pointer",
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
                border: "2px solid black",
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

            <div style={{ marginBottom: 20 }}>
              {["leads", "info", "contact", "login"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    marginRight: 10,
                    padding: "8px 14px",
                    borderRadius: 20,
                    background: activeTab === tab ? "#3b82f6" : "#d1d5db",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ background: "white", padding: 20, borderRadius: 12 }}>
              {activeTab === "contact" && (
                <>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button onClick={saveContact}>Save</button>
                </>
              )}

              {activeTab === "login" && (
                <>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} />
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