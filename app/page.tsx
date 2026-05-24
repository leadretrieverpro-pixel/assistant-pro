export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "Arial",
      background: "#f3f4f6",
      color: "#111"
    }}>

      {/* HERO SECTION */}
      <div style={{
        textAlign: "center",
        padding: "80px 20px",
        maxWidth: 800,
        margin: "0 auto"
      }}>
        <h1 style={{
          fontSize: 42,
          fontWeight: "bold",
          marginBottom: 15
        }}>
          AI Chat Assistant for Your Business
        </h1>

        <p style={{
          fontSize: 18,
          color: "#444",
          marginBottom: 25
        }}>
          Instantly respond to customers, capture leads, and grow your business —
          all with one simple AI-powered chat system.
        </p>

        <a href="/login">
          <button style={{
            padding: "14px 24px",
            fontSize: 16,
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}>
            Client Login
          </button>
        </a>
      </div>

      {/* FEATURES SECTION */}
      <div style={{
        background: "white",
        padding: "60px 20px"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: 28,
            marginBottom: 40
          }}>
            What This Platform Does
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20
          }}>

            <Feature
              title="24/7 AI Chat Support"
              desc="Automatically answer customer questions any time of day."
            />

            <Feature
              title="Lead Capture"
              desc="Collect names, phone numbers, and emails instantly."
            />

            <Feature
              title="Custom Company Responses"
              desc="Each business can add its own FAQs and answers."
            />

            <Feature
              title="Live Dashboard"
              desc="View and manage leads in real time."
            />
          </div>
        </div>
      </div>

      {/* SIMPLE ABOUT SECTION */}
      <div style={{
        padding: "60px 20px",
        maxWidth: 800,
        margin: "0 auto",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: 26, marginBottom: 15 }}>
          Built for Growing Businesses
        </h2>

        <p style={{ color: "#555", fontSize: 16 }}>
          This tool helps businesses capture more leads, respond faster,
          and never miss a potential customer opportunity again.
        </p>
      </div>

    </div>
  );
}

// ✅ SMALL COMPONENT FOR CLEAN LOOK
function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 20,
      textAlign: "center"
    }}>
      <h3 style={{
        fontSize: 18,
        marginBottom: 8
      }}>
        {title}
      </h3>

      <p style={{
        color: "#666",
        fontSize: 14
      }}>
        {desc}
      </p>
    </div>
  );
}