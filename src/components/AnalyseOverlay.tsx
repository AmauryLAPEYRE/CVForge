"use client";

import { useCVStore } from "@/hooks/useCVStore";

const STEPS = [
  "Lecture du document",
  "Extraction des informations",
  "Structuration des donnees",
  "Analyse des competences",
  "Finalisation",
];

const PARTICLES = [
  { label: "identite...", top: "15%", delay: "0s" },
  { label: "experience...", top: "32%", delay: "0.5s" },
  { label: "competences...", top: "52%", delay: "1s" },
  { label: "formation...", top: "68%", delay: "1.5s" },
];

export default function AnalyseOverlay() {
  const { state } = useCVStore();

  // extractionProgress is a number 0-5 set by StepDeposez
  // isExtracting controls visibility
  if (!state.isExtracting) return null;

  const doneCount = state.extractionProgress ?? 0;
  const progress = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(6,6,10,0.92)", backdropFilter: "blur(30px)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 80,
    }}>
      {/* LEFT — Document scan visual */}
      <div style={{ position: "relative", width: 280, height: 280 }}>
        <div style={{
          position: "absolute", left: 20, top: 20, width: 180, height: 240,
          background: "#fff", borderRadius: 10, boxShadow: "0 8px 40px rgba(0,0,0,0.6)", overflow: "hidden",
        }}>
          {[
            { top: 24, width: "60%", height: 10, opacity: 0.7 },
            { top: 44, width: "40%", height: 7, opacity: 0.4 },
            { top: 68, width: "80%", height: 7, opacity: 0.35 },
            { top: 80, width: "70%", height: 7, opacity: 0.35 },
            { top: 92, width: "75%", height: 7, opacity: 0.35 },
            { top: 116, width: "85%", height: 7, opacity: 0.3 },
            { top: 128, width: "65%", height: 7, opacity: 0.3 },
            { top: 140, width: "80%", height: 7, opacity: 0.3 },
            { top: 152, width: "55%", height: 7, opacity: 0.3 },
            { top: 176, width: "75%", height: 7, opacity: 0.25 },
            { top: 188, width: "60%", height: 7, opacity: 0.25 },
            { top: 200, width: "70%", height: 7, opacity: 0.25 },
          ].map((line, i) => (
            <div key={i} style={{
              position: "absolute", left: 16, top: line.top, width: line.width,
              height: line.height, background: `rgba(14,14,20,${line.opacity})`, borderRadius: 3,
            }} />
          ))}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 40,
            background: "linear-gradient(to bottom, rgba(201,165,90,0) 0%, rgba(201,165,90,0.45) 50%, rgba(201,165,90,0) 100%)",
            animation: "scanDown 1.8s linear infinite",
          }} />
        </div>
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: 210, top: p.top,
            animation: `flyOut 2s ease-in-out ${p.delay} infinite`,
            whiteSpace: "nowrap", fontWeight: 500,
            fontSize: 11, color: "var(--color-acc)",
            background: "rgba(201,165,90,0.1)", border: "1px solid rgba(201,165,90,0.3)",
            borderRadius: 5, padding: "3px 8px",
          }}>{p.label}</div>
        ))}
      </div>

      {/* RIGHT — Checklist */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 300 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Extraction en cours...
        </div>
        <div style={{ fontSize: 14, color: "var(--color-tx2)", marginBottom: 32 }}>
          L&apos;IA analyse votre document
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((label, i) => {
            const done = i < doneCount;
            const active = i === doneCount && doneCount < STEPS.length;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                opacity: !done && !active ? 0.35 : 1, transition: "opacity 0.4s",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "grid", placeItems: "center", fontSize: 12,
                  ...(done ? {
                    background: "rgba(92,255,160,0.15)", border: "1.5px solid var(--color-grn)", color: "var(--color-grn)",
                  } : active ? {
                    border: "2px solid var(--color-acc)", borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite", color: "transparent",
                  } : {
                    border: "1.5px solid var(--color-brd)", color: "transparent",
                  }),
                }}>{done ? "✓" : ""}</div>
                <span style={{
                  fontSize: 13, fontWeight: done ? 500 : 400,
                  color: done ? "var(--color-tx)" : active ? "var(--color-acc)" : "var(--color-tx2)",
                }}>{label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 32, height: 3, background: "var(--color-brd)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "var(--color-acc)", borderRadius: 2,
            width: `${progress}%`, transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-tx3)", textAlign: "right" }}>
          {progress}%
        </div>
      </div>
    </div>
  );
}
