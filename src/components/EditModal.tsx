"use client";

import { useState } from "react";
import type { CVData } from "@/lib/types";

interface EditModalProps {
  cvData: CVData;
  onSave: (data: CVData) => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--color-bg)",
  border: "1px solid var(--color-brd)",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--color-tx)",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  color: "var(--color-tx3)",
  marginBottom: 4,
  display: "block",
};

export default function EditModal({ cvData, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<CVData>({ ...cvData });

  function set(key: keyof CVData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "var(--color-bg-card)",
          borderRadius: 16,
          padding: 28,
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "var(--color-tx3)",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>

        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20, marginTop: 0 }}>
          Modifier vos informations
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
          {(
            [
              ["firstName", "Prenom"],
              ["lastName", "Nom"],
              ["title", "Titre"],
              ["phone", "Telephone"],
              ["birthDate", "Date de naissance"],
              ["email", "Email"],
            ] as [keyof CVData, string][]
          ).map(([key, label]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type="text"
                value={(form[key] as string) || ""}
                onChange={(e) => set(key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Profil</label>
          <textarea
            value={form.profile || ""}
            onChange={(e) => set("profile", e.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              background: "none",
              border: "1px solid var(--color-brd)",
              borderRadius: 8,
              color: "var(--color-tx2)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            style={{
              padding: "8px 20px",
              background: "var(--color-acc)",
              border: "none",
              borderRadius: 8,
              color: "var(--color-bg)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
