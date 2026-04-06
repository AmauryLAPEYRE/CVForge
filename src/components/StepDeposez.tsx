"use client";

import DropZone from "@/components/DropZone";
import { useCVStore } from "@/hooks/useCVStore";
import type { CVData } from "@/lib/types";

const STATS = [
  { value: "< 10s", label: "Génération" },
  { value: "∞", label: "Templates" },
  { value: "A4", label: "Print-ready" },
];

export default function StepDeposez() {
  const { dispatch } = useCVStore();

  async function handleFile(file: File) {
    dispatch({ type: "SET_EXTRACTING", value: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data: CVData = await res.json();
      dispatch({ type: "SET_CV_DATA", data });
    } catch {
      // API not yet built — fail silently, extraction state will reset
    } finally {
      dispatch({ type: "SET_EXTRACTING", value: false });
      dispatch({ type: "SET_STEP", step: 1 });
    }
  }

  async function handleText(text: string) {
    dispatch({ type: "SET_EXTRACTING", value: true });
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data: CVData = await res.json();
      dispatch({ type: "SET_CV_DATA", data });
    } catch {
      // API not yet built — fail silently
    } finally {
      dispatch({ type: "SET_EXTRACTING", value: false });
      dispatch({ type: "SET_STEP", step: 1 });
    }
  }

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
        alignItems: "center",
        width: "100%",
        maxWidth: 1100,
        overflow: "hidden",
      }}
    >
      {/* Ambient glow — left */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,165,90,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Ambient glow — right */}
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          right: "-5%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,165,90,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* LEFT — Copy */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "4px 12px",
            borderRadius: 100,
            background: "var(--color-acc-g)",
            border: "1px solid rgba(201,165,90,0.2)",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-acc)",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--color-acc)", fontWeight: 500, letterSpacing: 0.5 }}>
            Propulsé par l'IA
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: "var(--color-tx)",
            margin: "0 0 12px 0",
          }}
        >
          Deposez.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #c9a55a 0%, #e8c97a 50%, #c9a55a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            On fait le reste.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            color: "var(--color-tx2)",
            lineHeight: 1.65,
            margin: "0 0 36px 0",
            maxWidth: 400,
          }}
        >
          Importez votre CV existant ou collez son contenu. Notre IA extrait toutes vos informations
          en quelques secondes.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--color-acc)",
                    lineHeight: 1,
                    marginBottom: 3,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-tx3)", fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 28,
                    background: "var(--color-brd)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Drop zone */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <DropZone onFileSelected={handleFile} onTextPasted={handleText} />
      </div>
    </div>
  );
}
