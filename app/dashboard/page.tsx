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

  // ✅ LOAD CLIENTS
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

  // ✅ LOAD LEADS
  useEffect(() => {
    async function loadLeads() {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("ADMIN LEADS:", data, error);

      if (error) {
        console.error("Error loading leads:", error);
        return;
      }

      setLeads(data || []);
    }

    loadLeads();
  }, []);

  const selectedClient = clients.find(
    (c) => String(c.id) === String(selectedClientId)
  );

  // ✅ LOAD CLIENT DATA INTO FORM
  useEffect(() => {
    if (selectedClient) {
      setPhone(selectedClient.phone || "");
      setEmail(selectedClient.email || "");
      setUsername(selectedClient.username || "");
      setPassword(selectedClient.password || "");
    }
  }, [selectedClient]);

  // ✅ FILTER LEADS
  const clientLeads = leads.filter(
    (l) => selectedClient && String(l.client_id) === String(selectedClient.id)
  );

  // ✅ ADD CLIENT
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

  // ✅ SAVE CONTACT
  async function saveContact() {
    if (!selectedClientId) return;

    const { error } = await supabase
      .from("clients")
      .update({ phone, email })
      .eq("id", String(selectedClientId));

    if (error) {
      console.error(error);
      return;
    }

    alert("Saved ✅");
  }

  // ✅ SAVE LOGIN
  async function saveLogin() {
    if (!selectedClientId) return;

    if (!username.trim() || !password.trim()) {
      alert("Enter username and password");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({
        username,
        password,
      })
      .eq("id", String(selectedClientId));

    if (error) {
      console.error(error);
      return;
    }

    alert("Saved ✅");
  }

  // ✅ DELETE LEAD
  async function deleteLead(id: string) {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting lead:", error);
      return;
    }

    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  // ✅ DELETE FAQ
  async function deleteFAQ(index: number) {
  if (!selectedClient) return;

  const updatedFaqs = [...(selectedClient.faqs || [])];
  updatedFaqs.splice(index, 1);

  const { error } = await supabase
    .from("clients")
    .update({ faqs: updatedFaqs })
    .eq("id", selectedClient.id);

  if (error) {
    console.error("Error deleting FAQ:", error);
    return;
  }

  const { data } = await supabase.from("clients").select("*");
  setClients(data || []);
}


  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial", color: "#111" }}>

      {/* ✅ SIDEBAR */}
      <div style={{ width: 260, background: "#111", color: "white", padding: 20 }}>
        <h2>Clients</h2>

        <input
          placeholder="New client"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button onClick={addClient} style={{ width: "100%", marginBottom: 10 }}>
          Add Client
        </button>

        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            style={{
              marginTop: 10,
              padding: 10,
              background: selectedClientId === client.id ? "#3b82f6" : "#222",
              cursor: "pointer",
            }}
          >
            {client.name}

            <button
              onClick={(e) => {
                e.stopPropagation();
                copyChatLink(client.id);
              }}
              style={{ width: "100%", marginTop: 5 }}
            >
              Copy Link
            </button>
          </div>
        ))}
      </div>

      {/* ✅ MAIN */}
      <div style={{ flex: 1, padding: 30, background: "#f3f4f6" }}>
        {!selectedClient ? (
          <h2>Select a client</h2>
        ) : (
          <>
            <h2>{selectedClient.name}</h2>

            {/* ✅ TABS */}
            <div style={{ marginBottom: 20 }}>
              {["leads", "info", "contact", "login"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ marginRight: 10 }}>
                  {tab === "leads"
                  ? "Leads"
          : tab === "info"
                  ? "Company Info"
          : tab === "contact"
                  ? "Contact"
                  : "Login"}
                </button>
              ))}
            </div>

            {/* ✅ CONTENT */}
            <div style={{ background: "white", padding: 20, borderRadius: 12 }}>

              {/* ✅ LEADS */}
              {activeTab === "leads" && (
                clientLeads.length === 0 ? (
                  <p>No leads yet</p>
                ) : (
                  clientLeads.map((lead, i) => (
                    <div key={i} style={{
                      border: "2px solid #3b82f6",
                      marginBottom: 10,
                      padding: 10,
                      borderRadius: 8
                    }}>
                      <strong>{lead.name}</strong>
                      <div>{lead.phone}</div>
                      <div>{lead.email}</div>
                      <div>{new Date(lead.created_at).toLocaleString()}</div>

                      <button onClick={() => deleteLead(lead.id)}>
                        Delete
                      </button>
                    </div>
                  ))
                )
              )}
              {/* ✅ COMPANY INFO / FAQ */}
{activeTab === "info" && (
  <>
    {/* ✅ ADD FAQ */}
    <div style={{
      border: "2px solid #3b82f6",
      padding: 12,
      borderRadius: 10,
      marginBottom: 15
    }}>
      <input
        placeholder="Question"
        value={faqQuestion}
        onChange={(e) => setFaqQuestion(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <input
        placeholder="Answer"
        value={faqAnswer}
        onChange={(e) => setFaqAnswer(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <button
       onClick={async () => {
  if (!faqQuestion.trim() || !faqAnswer.trim() || !selectedClientId) return;

  const updatedFaqs = [
    ...(selectedClient?.faqs || []),
    { question: faqQuestion, answer: faqAnswer },
  ];

  const { error } = await supabase
    .from("clients")
    .update({ faqs: updatedFaqs })
    .eq("id", selectedClientId);

  if (error) {
    console.error("Error saving FAQ:", error);
    return;
  }

  // ✅ reload clients so UI updates
  const { data } = await supabase.from("clients").select("*");
  setClients(data || []);
  setFaqQuestion("");
  setFaqAnswer("");
}}
        style={{
          background: "#3b82f6",
          color: "white",
          padding: "8px 14px",
          borderRadius: 6,
          border: "none"
        }}
      >
        Add FAQ
      </button>
    </div>

    {/* ✅ FAQ LIST */}
    {(selectedClient?.faqs || []).map((faq: any, i: number) => (
      <div key={i} style={{
        border: "2px solid #3b82f6",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10
      }}>
        <strong>{faq.question}</strong>
        <div>{faq.answer}</div>

        <button
          onClick={() => deleteFAQ(i)}
          style={{
            marginTop: 8,
            background: "#ef4444",
            color: "white",
            padding: "6px 10px",
            borderRadius: 6,
            border: "none"
          }}
        >
          Delete
        </button>
      </div>
    ))}
  </>
)}

              {/* ✅ CONTACT */}
              {activeTab === "contact" && (
                <>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button onClick={saveContact}>Save</button>
                </>
              )}

              {/* ✅ LOGIN */}
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