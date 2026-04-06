"use client";

import { useEffect, useState } from "react";
import { useCVStore } from "@/hooks/useCVStore";

const STEPS = [
  "Identite et contact",
  "Experiences professionnelles",
  "Formations et diplomes",
  "Competences et langues",
  "Centres d'interet",
];

const PARTICLES = [
  { label: "nom: Benameur", top: "15%", delay: "0s" },
  { label: "exp: 14 ans",   top: "32%", delay: "0.4s" },
  { label: "skill: securite", top: "52%", delay: "0.8s" },
  { label: "tel: 07 77...", top: "68%", delay: "1.2s" },
];

export default function AnalyseOverlay() {
  const { state } = useCVStore();
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (!state.isExtracting) {
      setDoneCount(0);
      return;
    }

    setDoneCount(0);
    const interval = setInterval(() => {
      setDoneCount((prev) => {
        if (prev >= STEPS.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [state.isExtracting]);

  if (!state.isExtracting) return null;

  const progress = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9000,
      background: "rgba(6,6,10,0.92)",
      backdropFilter: "blur(30px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 80,
    }}>

      {/* LEFT — Document scan visual */}
      <div style={{ position: "relative", width: 280, height: 280 }}>
        {/* Document card */}
        <div style={{
          position: "absolute",
          left: 20,
          top: 20,
          width: 180,
          height: 240,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}>
          {/* Simulated text lines */}
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
              position: "absolute",
              left: 16,
              top: line.top,
              width: line.width,
              height: line.height,
              background: `rgba(14,14,20,${line.opacity})`,
              borderRadius: 3,
            }} />
          ))}

          {/* Scan beam */}
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 40,
            background: "linear-gradient(to bottom, rgba(201,165,90,0) 0%, rgba(201,165,90,0.45) 50%, rgba(201,165,90,0) 100%)",
            animation: "scanDown 1.8s linear infinite",
            pointerEvents: "none",
          }} />
        </div>

        {/* Data particles */}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: 210,
            top: p.top,
            animation: `flyOut 2s ease-in-out ${p.delay} infinite`,
            whiteSpace: "nowrap",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: "var(--color-acc)",
            background: "rgba(201,165,90,0.1)",
            border: "1px solid rgba(201,165,90,0.3)",
            borderRadius: 5,
            padding: "3px 8px",
            pointerEvents: "none",
          }}>
            {p.label}
          </div>
        ))}
      </div>

      {/* RIGHT — Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 300 }}>
        <div style={{
          fontFamily: "Syne, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--color-tx)",
          marginBottom: 6,
          letterSpacing: -0.5,
        }}>
          Extraction en cours...
        </div>
        <div style={{
          fontSize: 14,
          color: "var(--color-tx2)",
          marginBottom: 32,
        }}>
          L'IA analyse votre document
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((label, i) => {
            const done = i < doneCount;
            const active = i === doneCount;
            const pending = i > doneCount;

            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: pending ? 0.35 : 1,
                transition: "opacity 0.4s",
              }}>
                {/* Icon */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  ...(done ? {
                    background: "rgba(92,255,160,0.15)",
                    border: "1.5px solid var(--color-grn)",
                    color: "var(--color-grn)",
                  } : active ? {
                    background: "transparent",
                    border: "2px solid var(--color-acc)",
                    borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                    color: "transparent",
                  } : {
                    background: "transparent",
                    border: "1.5px solid var(--color-brd)",
                    color: "transparent",
                  }),
                }}>
                  {done ? "✓" : ""}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: 13,
                  fontWeight: done ? 500 : 400,
                  color: done ? "var(--color-tx)" : active ? "var(--color-acc)" : "var(--color-tx2)",
                  transition: "color 0.4s",
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 32,
          height: 3,
          background: "var(--color-brd)",
          borderRadius: 2,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            background: "var(--color-acc)",
            borderRadius: 2,
            width: `${progress}%`,
            transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 11,
          color: "var(--color-tx3)",
          textAlign: "right",
        }}>
          {progress}%
        </div>
      </div>
    </div>
  );
}
