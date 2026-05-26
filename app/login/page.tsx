"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase"; // ✅ IMPORTANT

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ ✅ CLEAN GLOBAL LOGIN FUNCTION
  async function handleLogin() {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("username", cleanUsername)
      .eq("password", cleanPassword)
      .limit(1);

    console.log("LOGIN RESULT:", data, error);

    if (error || !data || data.length === 0) {
      console.log("LOGIN FAILED:", error, data);
      alert("Invalid username or password");
      return;
    }

    // ✅ redirect to their dashboard
    window.location.href = "/company?client=" + data[0].id;
    
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
        color: "#111",
      }}
    >
      {/* ✅ MAIN CARD */}
      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 12,
          width: 350,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>
          Company Login
        </h2>

        {/* ✅ USERNAME FIELD */}
        <div
          style={{
            border: "2px solid #3b82f6",
            borderRadius: 10,
            padding: 12,
            marginBottom: 15,
          }}
        >
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            Username
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            style={{
              width: "100%",
              padding: 8,
              border: "none",
              outline: "none",
              color: "#111",
              background: "white",
            }}
          />
        </div>

        {/* ✅ PASSWORD FIELD */}
        <div
          style={{
            border: "2px solid #3b82f6",
            borderRadius: 10,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            Password
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: 8,
              border: "none",
              outline: "none",
              color: "#111",
              background: "white",
            }}
          />
        </div>

        {/* ✅ LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}