"use client";

import { useState, useEffect } from "react";

export default function Welcome({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss hint after a delay
    const t = setTimeout(() => {}, 10000);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(() => { setVisible(false); onEnter(); }, 600);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleEnter}
      style={{
        position: "fixed", inset: 0, zIndex: 100000,
        background: "var(--color-bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.6s ease",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes welcomeFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes welcomePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes welcomeGlow {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, var(--color-acc-gs), transparent 70%)",
        animation: "welcomeGlow 4s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{
        animation: "welcomeFadeUp 0.8s ease both",
        display: "flex", alignItems: "center", gap: 14, marginBottom: 32,
      }}>
        <div style={{
          width: 44, height: 44, background: "var(--color-acc)", borderRadius: 11,
          display: "grid", placeItems: "center",
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24,
          color: "var(--color-bg)",
        }}>C</div>
        <div style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 32,
          letterSpacing: -0.5,
        }}>
          CV<span style={{ color: "var(--color-acc)" }}>Forge</span>
        </div>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "Syne, sans-serif", fontSize: 48, fontWeight: 800,
        textAlign: "center", lineHeight: 1.15, letterSpacing: -1,
        maxWidth: 600, marginBottom: 16,
        animation: "welcomeFadeUp 0.8s ease 0.15s both",
      }}>
        Votre CV professionnel
        <br />
        <span style={{
          background: "linear-gradient(135deg, var(--color-acc), #e8cf8a)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>en moins d'une minute</span>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 17, color: "var(--color-tx2)", textAlign: "center",
        maxWidth: 480, lineHeight: 1.7, fontWeight: 300,
        marginBottom: 40,
        animation: "welcomeFadeUp 0.8s ease 0.3s both",
      }}>
        Importez votre CV, choisissez un design premium,
        et adaptez-le a l'offre d'emploi.
        <strong style={{ color: "var(--color-tx)", fontWeight: 500 }}> A partir de 0.99€</strong>
      </p>

      {/* CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); handleEnter(); }}
        style={{
          padding: "16px 40px", borderRadius: 14,
          background: "var(--color-acc)", color: "var(--color-bg)",
          border: "none", cursor: "pointer",
          fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700,
          letterSpacing: 0.5,
          animation: "welcomeFadeUp 0.8s ease 0.45s both",
          transition: "all 0.2s",
          boxShadow: "0 8px 32px var(--color-acc-gs)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px var(--color-acc-gs)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px var(--color-acc-gs)"; }}
      >
        Creer mon CV →
      </button>

      {/* Stats row */}
      <div style={{
        display: "flex", gap: 48, marginTop: 48,
        animation: "welcomeFadeUp 0.8s ease 0.6s both",
      }}>
        {[
          { val: "< 60s", label: "Generation" },
          { val: "11", label: "Templates" },
          { val: "0.99€", label: "Par CV" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: "var(--color-acc)" }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--color-tx3)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <div style={{
        position: "absolute", bottom: 32,
        fontSize: 13, color: "var(--color-tx3)",
        animation: "welcomePulse 3s ease-in-out infinite",
      }}>
        Cliquez n'importe ou pour commencer
      </div>
    </div>
  );
}
