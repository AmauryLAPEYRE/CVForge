"use client";

import { useState } from "react";
import type { GeneratedCV } from "@/lib/types";
import CustomizeControls from "./CustomizeControls";

const PRICING = [
  { id: "single", label: "1 CV", price: "1,99€", detail: "Telechargement unique" },
  { id: "pack", label: "Pack 5", price: "4,99€", detail: "5 telechargements" },
  { id: "unlimited", label: "Illimite", price: "9,99€/mois", detail: "Telechargements illimites" },
];

interface PreviewPanelProps {
  cv: GeneratedCV | undefined;
  onColorChange: (id: string, color: string) => void;
  onLayoutChange: (id: string, layout: GeneratedCV["layout"]) => void;
  onClose: () => void;
}

export default function PreviewPanel({ cv, onColorChange, onLayoutChange, onClose }: PreviewPanelProps) {
  const [selectedPricing, setSelectedPricing] = useState("single");

  if (!cv) return null;

  return (
    <div
      style={{
        width: 340,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflowY: "auto",
        flexShrink: 0,
        animation: "slideInPanel 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes slideInPanel {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          color: "var(--color-tx3)",
          fontSize: 18,
          cursor: "pointer",
          lineHeight: 1,
          padding: "2px 6px",
          borderRadius: 6,
        }}
        title="Fermer"
      >
        ✕
      </button>

      {/* Large preview */}
      <div
        style={{
          background: "#fff",
          aspectRatio: "210/297",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          flexShrink: 0,
        }}
      >
        <iframe
          srcDoc={cv.html}
          sandbox=""
          style={{ width: "100%", height: "100%", border: "none" }}
          title={`Preview ${cv.name}`}
        />
      </div>

      {/* Info card */}
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-brd)",
          borderRadius: 10,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--color-tx)" }}>
            {cv.name}
          </div>
          <div style={{ fontSize: 10, color: "var(--color-tx3)", marginTop: 2 }}>
            Style <span style={{ fontFamily: "monospace", color: "var(--color-acc)" }}>{cv.style}</span>
          </div>
        </div>
        <button
          style={{
            fontSize: 11,
            color: "var(--color-acc)",
            padding: "5px 12px",
            borderRadius: 6,
            background: "var(--color-acc-g)",
            border: "1px solid rgba(201,165,90,0.15)",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          + Similaire
        </button>
      </div>

      {/* Customization card */}
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-brd)",
          borderRadius: 10,
          padding: "14px",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-tx)", marginBottom: 12 }}>
          Personnalisation
        </div>
        <CustomizeControls
          accentColor={cv.accentColor}
          layout={cv.layout}
          onColorChange={(color) => onColorChange(cv.id, color)}
          onLayoutChange={(layout) => onLayoutChange(cv.id, layout)}
        />
      </div>

      {/* Pricing card */}
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-brd)",
          borderRadius: 10,
          padding: "14px",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-tx)", marginBottom: 12 }}>
          Telecharger
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {PRICING.map((option) => {
            const active = selectedPricing === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedPricing(option.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${active ? "var(--color-acc)" : "var(--color-brd)"}`,
                  background: active ? "var(--color-acc-g)" : "var(--color-bg-up)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: active ? "var(--color-acc)" : "var(--color-tx)" }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-tx3)", marginTop: 1 }}>
                    {option.detail}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: active ? "var(--color-acc)" : "var(--color-tx)" }}>
                  {option.price}
                </div>
              </button>
            );
          })}
        </div>

        <button
          style={{
            width: "100%",
            padding: "11px",
            background: "var(--color-acc)",
            color: "var(--color-bg)",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: 0.3,
          }}
        >
          Telecharger →
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "var(--color-tx3)",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
            <rect x="1" y="5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Paiement securise Stripe
        </div>
      </div>
    </div>
  );
}
