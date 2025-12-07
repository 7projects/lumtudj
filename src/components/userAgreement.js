import React from "react";

export default function UserAgreement({ onAgree }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        background: "#rgb(26 26 26)",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          background: "#1d1d1dff",
          borderRadius: "12px",
          boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
          padding: "28px",
        }}
      >
        <h1 style={{ marginBottom: "8px", fontSize: "28px" }}>User Agreement</h1>

        <p style={{ color: "#6b7280", marginBottom: "22px" }}>
          Last Updated: <strong>07.12.2025</strong>
        </p>

        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Welcome to <strong>LumtuDJ</strong>. By accessing
          or using this LumtuDJ, you agree to the terms below. If you do not agree,
          please do not use the LumtuDJ.
        </p>

        {/* ============================ */}
        {/* 1. Description */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          1. Description of the LumtuDJ
        </h2>
        <p>
          The LumtuDJ is a free web-based Spotify player designed to offer a simple,
          intuitive interface for browsing, playing, and managing your Spotify
          music.
        </p>
        <p>Features may include:</p>
        <ul style={{ marginLeft: "20px" }}>
          <li>Modifying playlists</li>
          <li>Managing your library</li>
          <li>Playback controls</li>
          <li>Additional user-friendly tools and enhancements</li>
        </ul>
        <p>
          The LumtuDJ uses <strong>LocalStorage</strong> and{" "}
          <strong>IndexedDB</strong> within your browser to store certain
          preferences and data.
        </p>

        {/* ============================ */}
        {/* 2. Spotify */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          2. Spotify Integration
        </h2>
        <p>
          This LumtuDJ uses Spotify’s official APIs and requires you to log in with
          your Spotify account.
        </p>
        <p>You understand and agree that:</p>
        <ul style={{ marginLeft: "20px" }}>
          <li>Spotify controls your playback and music library.</li>
          <li>This LumtuDJ does <strong>not</strong> store your Spotify login information.</li>
          <li>All Spotify content, marks, and trademarks belong to Spotify.</li>
        </ul>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          Use of the LumtuDJ is subject to Spotify’s terms and developer policies.
        </p>

        {/* ============================ */}
        {/* 3. Privacy */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          3. User Data & Privacy
        </h2>
        <ul style={{ marginLeft: "20px" }}>
          <li>
            The LumtuDJ does <strong>not</strong> collect or store your personal
            data on external servers by default.
          </li>
          <li>
            All settings, cached data, or user preferences are stored{" "}
            <strong>locally in your browser</strong> unless you enable server
            features.
          </li>
          <li>You may clear this data through your browser settings.</li>
          <li>No data is sold, shared, or transferred without consent.</li>
        </ul>

        {/* ============================ */}
        {/* 4. Donations */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          4. “Buy Me a Beer” Donations
        </h2>
        <p>The LumtuDJ may include an optional donation link.</p>
        <ul style={{ marginLeft: "20px" }}>
          <li>Donations are voluntary and non-refundable.</li>
          <li>
            Donations do not grant access to premium features or special
            services.
          </li>
        </ul>

        {/* ============================ */}
        {/* 5. Acceptable Use */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          5. Acceptable Use
        </h2>
        <p>You agree NOT to:</p>
        <ul style={{ marginLeft: "20px" }}>
          <li>Use the LumtuDJ for illegal or unauthorized purposes.</li>
          <li>Reverse-engineer, modify, or misuse the LumtuDJ.</li>
          <li>Interfere with the App’s functionality.</li>
          <li>Violate Spotify’s Terms via your usage.</li>
        </ul>

        {/* ============================ */}
        {/* 6. Warranty */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          6. Disclaimer of Warranty
        </h2>
        <p>
          The LumtuDJ is provided <strong>“as is”</strong> without warranties of any
          kind. Spotify may change APIs or permissions at any time, which may
          impact functionality.
        </p>

        {/* ============================ */}
        {/* 7. Liability */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          7. Limitation of Liability
        </h2>
        <p>The creator is not liable for:</p>
        <ul style={{ marginLeft: "20px" }}>
          <li>Loss of data</li>
          <li>Service interruptions</li>
          <li>Spotify API changes</li>
          <li>Any damages from using or not using the LumtuDJ</li>
        </ul>

        {/* ============================ */}
        {/* 8. Changes */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          8. Changes to This Agreement
        </h2>
        <p>
          This Agreement may be updated occasionally. Continued use of the LumtuDJ
          means you accept the updated terms.
        </p>

        {/* ============================ */}
        {/* 9. Contact */}
        {/* ============================ */}
        <h2 style={{ fontSize: "18px", marginTop: "20px" }}>
          9. Contact
        </h2>
        <p>
          You may contact the developer at: <strong>vsprojects007@gmail.com</strong>
        </p>

        {/* ============================ */}
        {/* Accept Button */}
        {/* ============================ */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            onClick={() => {
              localStorage.setItem("userAgreementAccepted", "true");
              window.location.reload();
            }}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              background: "#1db954",
              color: "white",
              cursor: "pointer",
            }}
          >
            I Agree
          </button>
        </div>

        <p style={{ marginTop: "26px", fontSize: "13px", color: "#6b7280" }}>
          Disclaimer: This is not legal advice. Consider consulting an attorney
          to ensure compliance with local laws and Spotify’s developer terms.
        </p>
      </div>
    </div>
  );
}
