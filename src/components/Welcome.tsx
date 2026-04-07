"use client";

import { useState } from "react";

export default function Welcome({ onEnter }: { onEnter: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(() => { setVisible(false); onEnter(); }, 700);
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
        transform: exiting ? "scale(1.02)" : "scale(1)",
        transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes wFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wGlow {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.1; }
        }
        @keyframes steam {
          0% { transform: translateY(0) scaleX(0.8); opacity: 0; }
          10% { opacity: 0.6; }
          40% { transform: translateY(-14px) scaleX(1.2); opacity: 0.4; }
          70% { transform: translateY(-28px) scaleX(0.6); opacity: 0.15; }
          100% { transform: translateY(-38px) scaleX(0.4); opacity: 0; }
        }
        @keyframes cupFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 350, borderRadius: "50%",
        background: "radial-gradient(ellipse, var(--color-acc), transparent 70%)",
        animation: "wGlow 5s ease-in-out infinite",
        pointerEvents: "none", filter: "blur(60px)",
      }} />

      {/* Line 1 — with animated coffee emoji inline */}
      <div style={{
        fontFamily: "Syne, sans-serif", fontSize: 52, fontWeight: 800,
        textAlign: "center", letterSpacing: -1.5, lineHeight: 1.3,
        animation: "wFade 0.8s ease 0.4s both",
      }}>
        Votre{" "}
        <span style={{ display: "inline-block", position: "relative", animation: "cupFloat 3s ease-in-out infinite", fontSize: 48 }}>
          ☕
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              position: "absolute",
              top: -4, left: 10 + i * 9,
              width: 3, height: 18,
              borderRadius: 6,
              background: "rgba(255,255,255,0.5)",
              filter: "blur(2px)",
              opacity: 0,
              animation: `steam 3s ease-out ${i * 0.7}s infinite`,
            }} />
          ))}
        </span>
        {" "}coute plus cher
      </div>

      {/* Line 2 — gold gradient */}
      <div style={{
        fontFamily: "Syne, sans-serif", fontSize: 52, fontWeight: 800,
        textAlign: "center", letterSpacing: -1.5, lineHeight: 1.1,
        background: "linear-gradient(135deg, var(--color-acc), #e8cf8a)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 24,
        animation: "wFade 0.8s ease 0.8s both",
      }}>
        que votre prochain entretien.
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 17, color: "var(--color-tx2)", textAlign: "center",
        fontWeight: 300, lineHeight: 1.6,
        animation: "wFade 0.8s ease 1s both",
      }}>
        Et si votre prochain entretien dependait d'un seul CV ?
      </div>

      {/* CTA — minimal, just text with arrow */}
      <div
        onClick={(e) => { e.stopPropagation(); handleEnter(); }}
        style={{
          marginTop: 48,
          fontSize: 15, fontWeight: 500, color: "var(--color-acc)",
          display: "flex", alignItems: "center", gap: 8,
          animation: "wFade 0.8s ease 1.4s both",
          transition: "gap 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.gap = "14px"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.gap = "8px"; }}
      >
        Commencer
        <span style={{ fontSize: 20 }}>→</span>
      </div>

    </div>
  );
}
