"use client";

import { useState } from "react";
import type { GeneratedCV } from "@/lib/types";

interface CVCardProps {
  cv: GeneratedCV;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CVCard({ cv, isSelected, onSelect }: CVCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--color-bg-card)",
        border: `1px solid ${isSelected ? cv.accentColor : "var(--color-brd)"}`,
        borderRadius: 12,
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: isSelected ? `0 0 0 2px ${cv.accentColor}33` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Preview area */}
      <div
        style={{
          position: "relative",
          background: "#fff",
          aspectRatio: "210/297",
          overflow: "hidden",
        }}
      >
        <iframe
          srcDoc={cv.html}
          sandbox=""
          style={{ width: "100%", height: "100%", border: "none" }}
          title={cv.name}
        />

        {/* Hover overlay */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s",
            }}
          >
            <button
              style={{
                padding: "8px 20px",
                background: "var(--color-acc)",
                color: "var(--color-bg)",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Selectionner
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--color-tx)",
            fontFamily: "Syne, sans-serif",
          }}
        >
          {cv.name}
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            background: "var(--color-bg-up)",
            color: "var(--color-tx2)",
            padding: "2px 7px",
            borderRadius: 999,
            border: "1px solid var(--color-brd)",
            whiteSpace: "nowrap",
          }}
        >
          {cv.style}
        </span>
      </div>
    </div>
  );
}
