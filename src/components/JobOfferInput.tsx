"use client";

interface JobOfferInputProps {
  value: string;
  onChange: (text: string) => void;
}

export default function JobOfferInput({ value, onChange }: JobOfferInputProps) {
  return (
    <div
      style={{
        gridColumn: 3,
        gridRow: "1 / 3",
        background: "var(--color-bg-card)",
        border: "1.5px solid var(--color-acc-s)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top gradient line */}
      <div
        style={{
          height: 2,
          background: "linear-gradient(90deg, var(--color-acc), var(--color-acc-s))",
          flexShrink: 0,
        }}
      />

      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--color-tx)" }}>
            Ciblez l&apos;offre
          </span>
          <span
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              padding: "3px 8px",
              background: "var(--color-acc-g)",
              border: "1px solid rgba(201,165,90,0.25)",
              borderRadius: 4,
              color: "var(--color-acc)",
              fontWeight: 600,
            }}
          >
            Recommande
          </span>
        </div>

        <p style={{ fontSize: 12, color: "var(--color-tx3)", margin: "0 0 14px 0", lineHeight: 1.6 }}>
          Collez l&apos;offre d&apos;emploi ciblee. L&apos;IA adaptera vos designs pour maximiser la correspondance.
        </p>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Collez ici le texte de l'offre d'emploi..."
          style={{
            flex: 1,
            minHeight: 100,
            resize: "none",
            background: "var(--color-bg)",
            border: "1px solid var(--color-brd)",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 13,
            color: "var(--color-tx)",
            lineHeight: 1.7,
            fontFamily: "inherit",
            outline: "none",
          }}
        />

        {/* Hint */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ fontSize: 11, color: "var(--color-tx3)", lineHeight: 1.5 }}>
            Sans offre, l&apos;IA generera des designs polyvalents bases sur votre profil uniquement.
          </span>
        </div>
      </div>
    </div>
  );
}
