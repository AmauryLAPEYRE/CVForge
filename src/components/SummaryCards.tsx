"use client";

import type { CVData } from "@/lib/types";

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: 2,
  color: "var(--color-acc)",
  marginBottom: 2,
};

const cardBase: React.CSSProperties = {
  background: "var(--color-bg-card)",
  border: "1px solid var(--color-brd)",
  borderRadius: 10,
  padding: 20,
  overflow: "hidden",
};

export default function SummaryCards({ cvData }: { cvData: CVData }) {
  return (
    <>
      {/* Identity card — col 1, row 1 */}
      <div style={{ ...cardBase, gridColumn: 1, gridRow: 1 }}>
        <div style={labelStyle}>Identite</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: 10 }}>
          {[
            ["Prenom", cvData.firstName],
            ["Nom", cvData.lastName],
            ["Titre", cvData.title],
            ["Telephone", cvData.phone],
            ["Naissance", cvData.birthDate],
            ["Email", cvData.email],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--color-tx3)", marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-tx)", fontWeight: 500, wordBreak: "break-all" }}>
                {value || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile card — col 2, row 1 */}
      <div style={{ ...cardBase, gridColumn: 2, gridRow: 1 }}>
        <div style={labelStyle}>Profil</div>
        <div style={{ marginTop: 10 }}>
          {cvData.experiences.length > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-tx)", marginBottom: 8 }}>
              {cvData.experiences.length} experience{cvData.experiences.length > 1 ? "s" : ""} professionnelle{cvData.experiences.length > 1 ? "s" : ""}
            </div>
          )}
          <p style={{ fontSize: 14, color: "var(--color-tx2)", lineHeight: 1.8, margin: 0 }}>
            {cvData.profile || "Aucun profil renseigne."}
          </p>
        </div>
      </div>

      {/* Skills card — col 1, row 2 */}
      <div style={{ ...cardBase, gridColumn: 1, gridRow: 2 }}>
        <div style={labelStyle}>Competences</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {cvData.skills.length > 0 ? cvData.skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: 12,
                padding: "6px 14px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-brd)",
                borderRadius: 9999,
                color: "var(--color-tx2)",
                whiteSpace: "nowrap",
              }}
            >
              {skill}
            </span>
          )) : (
            <span style={{ fontSize: 13, color: "var(--color-tx3)" }}>Aucune competence renseignee.</span>
          )}
        </div>
      </div>

      {/* Experiences card — col 2, row 2 */}
      <div style={{ ...cardBase, gridColumn: 2, gridRow: 2, overflowY: "auto" }}>
        <div style={labelStyle}>Experiences</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {cvData.experiences.length > 0 ? cvData.experiences.map((exp, i) => (
            <div
              key={i}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-brd)",
                borderRadius: 6,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-tx)" }}>{exp.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-acc)", marginTop: 2 }}>{exp.company}</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-tx3)", marginTop: 4 }}>
                {exp.startDate} — {exp.endDate || "Aujourd'hui"}
              </div>
            </div>
          )) : (
            <span style={{ fontSize: 13, color: "var(--color-tx3)" }}>Aucune experience renseignee.</span>
          )}
        </div>
      </div>
    </>
  );
}
