"use client";

import { useState } from "react";
import type { GeneratedCV } from "@/lib/types";

const ACCENT_COLORS = [
  "#c9a55a",
  "#5b8def",
  "#e74c3c",
  "#27ae60",
  "#9b59b6",
  "#e67e22",
  "#1abc9c",
  "#2c3e50",
];

const LAYOUTS: { value: GeneratedCV["layout"]; label: string }[] = [
  { value: "single", label: "1 col" },
  { value: "double", label: "2 col" },
  { value: "sidebar", label: "Sidebar" },
];

function SingleColIcon() {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <rect x="2" y="2" width="18" height="3" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="2" y="8" width="18" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="12" width="18" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="16" width="14" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="22" width="18" height="2" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function DoubleColIcon() {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <rect x="2" y="2" width="8" height="3" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="12" y="2" width="8" height="3" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="2" y="8" width="8" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="12" y="8" width="8" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="12" width="8" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="12" y="12" width="6" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="16" width="8" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="12" y="16" width="8" height="2" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <rect x="2" y="2" width="5" height="24" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="10" y="2" width="10" height="3" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="10" y="8" width="10" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="10" y="12" width="10" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="10" y="16" width="7" height="2" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

const LAYOUT_ICONS = {
  single: <SingleColIcon />,
  double: <DoubleColIcon />,
  sidebar: <SidebarIcon />,
};

interface CustomizeControlsProps {
  accentColor: string;
  layout: GeneratedCV["layout"];
  onColorChange: (color: string) => void;
  onLayoutChange: (layout: GeneratedCV["layout"]) => void;
}

export default function CustomizeControls({
  accentColor,
  layout,
  onColorChange,
  onLayoutChange,
}: CustomizeControlsProps) {
  const [photoEnabled, setPhotoEnabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Color picker */}
      <div>
        <div style={{ fontSize: 11, color: "var(--color-tx3)", marginBottom: 8, fontWeight: 500 }}>
          Couleur d&apos;accent
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ACCENT_COLORS.map((color) => {
            const active = color === accentColor;
            return (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: color,
                  border: active ? "2.5px solid #fff" : "2.5px solid transparent",
                  outline: active ? `2px solid ${color}` : "2px solid transparent",
                  cursor: "pointer",
                  transform: active ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.15s, outline 0.15s",
                  padding: 0,
                }}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {/* Layout picker */}
      <div>
        <div style={{ fontSize: 11, color: "var(--color-tx3)", marginBottom: 8, fontWeight: 500 }}>
          Mise en page
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {LAYOUTS.map(({ value, label }) => {
            const active = layout === value;
            return (
              <button
                key={value}
                onClick={() => onLayoutChange(value)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 6px",
                  borderRadius: 8,
                  border: `1px solid ${active ? "var(--color-acc)" : "var(--color-brd)"}`,
                  background: active ? "var(--color-acc-g)" : "var(--color-bg-up)",
                  color: active ? "var(--color-acc)" : "var(--color-tx3)",
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {LAYOUT_ICONS[value]}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--color-tx3)", fontWeight: 500 }}>
          Photo de profil
        </span>
        <button
          onClick={() => setPhotoEnabled(!photoEnabled)}
          style={{
            width: 38,
            height: 22,
            borderRadius: 11,
            background: photoEnabled ? "var(--color-acc)" : "var(--color-bg-up)",
            border: "1px solid var(--color-brd)",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
            padding: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: photoEnabled ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
