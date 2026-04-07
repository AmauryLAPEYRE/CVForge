"use client";

import { useCVStore } from "@/hooks/useCVStore";
import { useState } from "react";
import type { Step, CVData } from "@/lib/types";

function EditableField({ value, onChange, label, multiline, mono, size = 14 }: {
  value: string; onChange: (v: string) => void; label: string;
  multiline?: boolean; mono?: boolean; size?: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    const style: React.CSSProperties = {
      width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-acc)",
      borderRadius: 6, padding: "6px 10px", color: "var(--color-tx)",
      fontSize: size, fontFamily: "inherit",
      outline: "none", resize: "none" as const, lineHeight: multiline ? 1.7 : 1.4,
    };
    const common = {
      defaultValue: value, autoFocus: true, style,
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { onChange(e.target.value); setEditing(false); },
      onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" && !multiline) (e.target as HTMLElement).blur(); if (e.key === "Escape") setEditing(false); },
    };
    return multiline ? <textarea {...common} rows={4} /> : <input {...common} />;
  }

  return (
    <div onClick={() => setEditing(true)} title={`Modifier: ${label}`}
      style={{ cursor: "text", padding: "3px 6px", borderRadius: 6, margin: "-3px -6px", transition: "background 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--color-bg)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {value || <span style={{ color: "var(--color-tx3)", fontStyle: "italic" }}>Cliquer pour ajouter</span>}
    </div>
  );
}

function Tag({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <span style={{ fontSize: 13, padding: "5px 14px", background: "var(--color-bg)", border: "1px solid var(--color-brd)", borderRadius: 100, color: "var(--color-tx2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
      {text}
      <span onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ cursor: "pointer", color: "var(--color-tx3)", fontSize: 16, lineHeight: 1 }}>×</span>
    </span>
  );
}

export default function StepAjustez() {
  const { state, dispatch } = useCVStore();
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  if (!state.cvData) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 700 }}>Vos informations</h1>
        <p style={{ color: "var(--color-tx2)", marginTop: 8, fontSize: 15 }}>Importez un CV pour commencer</p>
      </div>
    );
  }

  const cv = state.cvData;
  const update = (partial: Partial<CVData>) => dispatch({ type: "SET_CV_DATA", data: { ...cv, ...partial } });

  const card: React.CSSProperties = { background: "var(--color-bg-card)", border: "1px solid var(--color-brd)", borderRadius: 12, padding: "16px 20px", overflow: "hidden" };
  const label: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--color-acc)", fontWeight: 600, marginBottom: 12 };
  const fLabel: React.CSSProperties = { fontSize: 11, color: "var(--color-tx3)", marginBottom: 2 };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "0 10px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexShrink: 0 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, margin: 0 }}>
          Vos informations
        </h2>
      </div>

      {/* Main grid + chevron */}
      <div style={{ flex: 1, display: "flex", gap: 0, minHeight: 0, overflow: "hidden" }}>
        {/* 4-column grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "auto 1fr", gap: 8, minHeight: 0, overflow: "hidden" }}>

          {/* IDENTITE — col 1, row 1 */}
          <div style={{ ...card, gridColumn: 1, gridRow: 1 }}>
            <div style={label}>Identite</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px" }}>
              <div><div style={fLabel}>Prenom</div><div style={{ fontSize: 15, fontWeight: 500 }}><EditableField value={cv.firstName} onChange={(v) => update({ firstName: v })} label="prenom" size={15} /></div></div>
              <div><div style={fLabel}>Nom</div><div style={{ fontSize: 15, fontWeight: 500 }}><EditableField value={cv.lastName} onChange={(v) => update({ lastName: v })} label="nom" size={15} /></div></div>
              <div><div style={fLabel}>Titre</div><div style={{ fontSize: 14 }}><EditableField value={cv.title} onChange={(v) => update({ title: v })} label="titre" /></div></div>
              <div><div style={fLabel}>Telephone</div><div style={{ fontSize: 14 }}><EditableField value={cv.phone} onChange={(v) => update({ phone: v })} label="tel" mono /></div></div>
              <div><div style={fLabel}>Email</div><div style={{ fontSize: 14 }}><EditableField value={cv.email} onChange={(v) => update({ email: v })} label="email" mono /></div></div>
              <div><div style={fLabel}>Adresse</div><div style={{ fontSize: 14 }}><EditableField value={cv.address} onChange={(v) => update({ address: v })} label="adresse" /></div></div>
            </div>
          </div>

          {/* PROFIL — col 2, row 1 */}
          <div style={{ ...card, gridColumn: 2, gridRow: 1 }}>
            <div style={label}>Profil</div>
            <div style={{ fontSize: 14, color: "var(--color-tx2)", lineHeight: 1.8 }}>
              <EditableField value={cv.profile} onChange={(v) => update({ profile: v })} label="profil" multiline />
            </div>
          </div>

          {/* COMPETENCES — col 3, row 1 */}
          <div style={{ ...card, gridColumn: 3, gridRow: 1 }}>
            <div style={label}>Competences</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {(cv.skills || []).map((s, i) => (
                <Tag key={i} text={s} onRemove={() => update({ skills: cv.skills.filter((_, j) => j !== i) })} />
              ))}
            </div>
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && newSkill.trim()) { update({ skills: [...(cv.skills || []), newSkill.trim()] }); setNewSkill(""); } }}
              placeholder="+ Ajouter une competence"
              style={{ width: "100%", padding: "6px 10px", background: "var(--color-bg)", border: "1px solid var(--color-brd)", borderRadius: 6, color: "var(--color-tx)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>

          {/* INTERETS + LANGUES — col 4, row 1 */}
          <div style={{ ...card, gridColumn: 4, gridRow: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={label}>Langues</div>
              {(cv.languages || []).map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14, borderBottom: "1px solid var(--color-brd)" }}>
                  <span style={{ color: "var(--color-tx)" }}>{l.name}</span>
                  <span style={{ color: "var(--color-tx3)", fontSize: 12 }}>{l.level}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={label}>Centres d'interet</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                {(cv.interests || []).map((h, i) => (
                  <Tag key={i} text={h} onRemove={() => update({ interests: cv.interests.filter((_, j) => j !== i) })} />
                ))}
              </div>
              <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newInterest.trim()) { update({ interests: [...(cv.interests || []), newInterest.trim()] }); setNewInterest(""); } }}
                placeholder="+ Ajouter"
                style={{ width: "100%", padding: "5px 10px", background: "var(--color-bg)", border: "1px solid var(--color-brd)", borderRadius: 6, color: "var(--color-tx)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>

          {/* EXPERIENCES — col 1-4, row 2 (full width) */}
          <div style={{ ...card, gridColumn: "1 / -1", gridRow: 2, overflowY: "auto" }}>
            <div style={label}>Experiences professionnelles</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(cv.experiences || []).map((exp, i) => (
                <div key={i} style={{ background: "var(--color-bg)", border: "1px solid var(--color-brd)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      <EditableField value={exp.title} onChange={(v) => { const e = [...cv.experiences]; e[i] = { ...e[i], title: v }; update({ experiences: e }); }} label="poste" size={16} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-acc)", fontWeight: 500, flexShrink: 0, marginLeft: 12 }}>
                      {exp.startDate} — {exp.endDate || "Present"}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--color-acc)", marginTop: 2 }}>
                    <EditableField value={exp.company} onChange={(v) => { const e = [...cv.experiences]; e[i] = { ...e[i], company: v }; update({ experiences: e }); }} label="entreprise" />
                  </div>
                  {exp.location && (
                    <div style={{ fontSize: 13, color: "var(--color-tx3)", marginTop: 2 }}>{exp.location}</div>
                  )}
                  {/* Tasks */}
                  {(exp.tasks || []).length > 0 && (
                    <ul style={{ listStyle: "none", marginTop: 8, padding: 0 }}>
                      {exp.tasks.map((t, j) => (
                        <li key={j} style={{ fontSize: 13, color: "var(--color-tx2)", lineHeight: 1.7, paddingLeft: 14, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, top: 8, width: 5, height: 1, background: "var(--color-acc)", opacity: 0.4 }} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CHEVRON — right side */}
        <div onClick={() => dispatch({ type: "SET_STEP", step: 2 as Step })}
          style={{ width: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="var(--color-acc)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: `chevronWave 2s ease-in-out ${i * 0.2}s infinite`, filter: i === 1 ? "drop-shadow(0 0 6px rgba(201,165,90,0.4))" : "none" }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            ))}
            <span style={{ writingMode: "vertical-rl", textOrientation: "mixed", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-tx3)", fontWeight: 500, transform: "rotate(180deg)", marginTop: 4 }}>Designs</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes chevronWave { 0%, 100% { transform: translateX(0); opacity: 0.25; } 50% { transform: translateX(5px); opacity: 1; } }`}</style>
    </div>
  );
}
