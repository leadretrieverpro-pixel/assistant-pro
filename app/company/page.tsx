"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function CompanyPage() {
  const params = useSearchParams();
  const clientId = params.get("client");

  const [client, setClient] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("leads");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // ✅ FORMAT DATE
  function formatDate(timestamp: number) {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString();
  }

  // ✅ LOAD DATA
useEffect(() => {
  async function loadClient() {
    if (!clientId) return;

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", String(clientId)) // ✅ FIX
      .maybeSingle();


    console.log("CLIENT ID:", clientId); // ✅ debug
    console.log("FETCH RESULT:", data, error);

    if (error) {
      console.error("Error loading client:", error);
      setClient({ name: "Error loading client" }); // ✅ prevents infinite loading
      return;
    }

    if (!data) {
      setClient({ name: "No client found" }); // ✅ prevents infinite loading
      return;
    }

    setClient(data);
    setPhone(data.phone || "");
    setEmail(data.email || "");
  }

  loadClient();
}, [clientId]);



// ✅ ✅ ADD THIS NEW BLOCK RIGHT BELOW 👇

useEffect(() => {
  async function loadLeads() {
    if (!clientId) return;

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("client_id", String(clientId))
      .order("created_at", { ascending: false });

    console.log("LEADS:", data, error);

    if (error) {
      console.error("Error loading leads:", error);
      return;
    }

    setLeads(data || []);
  }

  loadLeads();
}, [clientId]);

  // ✅ SAVE CONTACT
  async function saveContact() {
  if (!clientId) return;

  const { error } = await supabase
    .from("clients")
    .update({ phone, email })
    .eq("id", String(clientId));

  if (error) {
    console.error("Error saving contact:", error);
    alert("Error saving contact");
    return;
  }

  // ✅ REFRESH CLIENT DATA
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", String(clientId))
    .maybeSingle();

  if (data) {
    setClient(data);
    setPhone(data.phone || "");
    setEmail(data.email || "");
  }

  alert("Saved ✅");
}

  // ✅ ADD FAQ
  async function addFAQ() {
  if (!faqQuestion.trim() || !faqAnswer.trim() || !clientId) return;

  const updatedFaqs = [
    ...(client.faqs || []),
    { question: faqQuestion, answer: faqAnswer },
  ];

  const { error } = await supabase
    .from("clients")
    .update({ faqs: updatedFaqs })
    .eq("id", String(clientId));

  if (error) {
    console.error("Error saving FAQ:", error);
    return;
  }

  // ✅ refresh client
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", String(clientId))
    .maybeSingle();

  if (data) {
    setClient(data);
  }

  setFaqQuestion("");
  setFaqAnswer("");
}


  // ✅ DELETE FAQ
  async function deleteFAQ(index: number) {
  if (!clientId || !client) return;

  const updatedFaqs = [...(client.faqs || [])];
  updatedFaqs.splice(index, 1);

  const { error } = await supabase
    .from("clients")
    .update({ faqs: updatedFaqs })
    .eq("id", String(clientId));

  if (error) {
    console.error("Error deleting FAQ:", error);
    return;
  }

  // ✅ refresh client data (NO page reload)
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", String(clientId))
    .maybeSingle();

  if (data) {
    setClient(data);
  }
}


  // ✅ DELETE LEAD (FIXED)
  async function deleteLead(id: string) {
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting lead:", error);
    return;
  }

  setLeads(prev => prev.filter(l => l.id !== id));
}
  if (!client) {
    return <h2 style={{ padding: 20 }}>Loading...</h2>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#e5e7eb",
      padding: 30,
      fontFamily: "Arial",
      color: "#111"
    }}>
      <h2>{client.name} Dashboard</h2>

      {/* ✅ TABS */}
      <div style={{ marginBottom: 20 }}>
        {["leads", "info", "contact"].map(tab => (
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
              : "Contact Info"}
          </button>
        ))}
      </div>

      {/* ✅ CONTENT BOX */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12
      }}>

        {/* ✅ LEADS WITH DATE */}
        {activeTab === "leads" && (
          leads.length === 0 ? (
            <p>No leads yet</p>
          ) : (
            leads.map((lead, i) => (
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

                  {/* ✅ NEW DATE DISPLAY */}
                  <div style={{
                    fontSize: 12,
                    marginTop: 5,
                    color: "#555"
                  }}>
                    {formatDate(new Date(lead.created_at).getTime())}

                  </div>
                </div>

                <button
                  onClick={() => deleteLead(lead.id)}
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
          )
        )}

        {/* ✅ COMPANY INFO */}
        {activeTab === "info" && (
          <>
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
                onClick={addFAQ}
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

            {(client.faqs || []).map((faq: any, i: number) => (
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
            <div style={{
              border: "2px solid #3b82f6",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10
            }}>
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{
              border: "2px solid #3b82f6",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10
            }}>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <button
              onClick={saveContact}
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "10px 16px",
                borderRadius: 6,
                border: "none"
              }}
            >
              Save
            </button>
          </>
        )}

      </div>
    </div>
  );
}