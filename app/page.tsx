export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial",
      background: "#e5e7eb"
    }}>
      <div style={{
        background: "white",
        padding: 40,
        borderRadius: 12,
        textAlign: "center",
        maxWidth: 500
      }}>
        <h1 style={{ marginBottom: 10 }}>
          AI Chat Assistant
        </h1>

        <p style={{ marginBottom: 20 }}>
          Automate your customer conversations and capture leads instantly.
        </p>

        <a href="/login">
          <button style={{
            padding: "12px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer"
          }}>
            Login
          </button>
        </a>
      </div>
    </div>
  );
}