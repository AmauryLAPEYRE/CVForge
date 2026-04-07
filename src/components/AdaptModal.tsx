"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface AdaptModalProps {
  onClose: () => void;
  onAdapted: () => void;
  onSubmit: (text: string) => Promise<void>;
  isAdapting: boolean;
}

const ADAPT_STEPS = [
  "Analyse de l'offre d'emploi",
  "Identification des mots-cles",
  "Reecriture du profil",
  "Reordonnancement des experiences",
  "Mise en avant des competences",
];

// Real sourced stats — displayed during adaptation
const MARKETING_FACTS = [
  { text: "Les recruteurs passent en moyenne 7.4 secondes sur un CV", source: "Ladders, 2018" },
  { text: "Un CV adapte a l'offre multiplie par 2.5x les chances d'entretien", source: "TopResume, 2021" },
  { text: "75% des CV sont rejetes par les ATS avant d'etre lus par un humain", source: "Harvard Business Review" },
  { text: "Les candidats qui personnalisent leur CV ont 40% de reponses en plus", source: "CareerBuilder" },
  { text: "63% des recruteurs preferent un CV adapte au poste specifique", source: "Jobvite, 2022" },
];

export default function AdaptModal({ onClose, onAdapted, onSubmit, isAdapting }: AdaptModalProps) {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [factIndex, setFactIndex] = useState(0);

  async function handleSubmit() {
    if (!text.trim()) return;
    setValidationError("");

    // Start progress animation + rotate facts
    setProgress(0);
    setFactIndex(0);
    let step = 0;
    let fact = 0;
    const timer = setInterval(() => {
      step++;
      if (step <= 4) setProgress(step);
      else clearInterval(timer);
    }, 1500);
    const factTimer = setInterval(() => {
      fact++;
      setFactIndex(fact % MARKETING_FACTS.length);
    }, 5000);

    try {
      await onSubmit(text.trim());
      clearInterval(timer);
      clearInterval(factTimer);
      setProgress(5);
      setDone(true);

      setTimeout(() => {
        onAdapted();
        onClose();
      }, 3500);
    } catch (err) {
      clearInterval(timer);
      clearInterval(factTimer);
      setProgress(0);
      if (err instanceof Error && err.message.includes("not_a_job_offer")) {
        setValidationError(err.message.replace("not_a_job_offer:", "").trim() || "Le contenu colle ne semble pas etre une offre d'emploi. Collez le texte ou l'URL d'une vraie annonce.");
      } else {
        setValidationError("Une erreur est survenue. Reessayez.");
      }
    }
  }

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "rgba(6,6,10,0.92)", backdropFilter: "blur(24px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "cvAppear 0.3s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 520, maxWidth: "90vw",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {!isAdapting && !done ? (
          /* === INPUT STATE === */
          <>
            {/* Icon */}
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 6, textAlign: "center" }}>
              Adapter a une offre
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-tx2)", textAlign: "center", lineHeight: 1.7, marginBottom: 24, maxWidth: 420 }}>
              Collez le texte ou l'URL de l'offre d'emploi. L'IA va reecrire votre profil, reordonner vos experiences et mettre en avant les competences qui matchent.
            </p>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Collez ici le texte ou l'URL de l'offre d'emploi..."
              autoFocus
              style={{
                width: "100%", minHeight: 140, padding: "16px 18px",
                background: "var(--color-bg-card)", border: "1.5px solid var(--color-brd)",
                borderRadius: 12, color: "var(--color-tx)", fontSize: 14,
                fontFamily: "inherit", resize: "vertical", outline: "none",
                lineHeight: 1.7, transition: "border-color 0.2s",
              }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--color-acc)"; }}
              onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--color-brd)"; }}
            />

            {/* Validation error */}
            {validationError && (
              <div style={{
                marginTop: 14, padding: "12px 16px", borderRadius: 8,
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                fontSize: 13, color: "#f87171", lineHeight: 1.6,
              }}>
                {validationError}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 20, width: "100%" }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "12px", borderRadius: 10,
                background: "var(--color-bg-up)", border: "1px solid var(--color-brd)",
                color: "var(--color-tx2)", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>Annuler</button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                style={{
                  flex: 2, padding: "12px", borderRadius: 10,
                  background: text.trim() ? "var(--color-acc)" : "var(--color-bg-up)",
                  color: text.trim() ? "var(--color-bg)" : "var(--color-tx3)",
                  border: "none", fontSize: 14, fontWeight: 600, cursor: text.trim() ? "pointer" : "not-allowed",
                  fontFamily: "Syne, sans-serif", letterSpacing: 0.5,
                  transition: "all 0.2s",
                }}
              >Adapter mon CV</button>
            </div>
          </>
        ) : done ? (
          /* === SUCCESS STATE === */
          <>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(92,255,160,0.12)", border: "2px solid var(--color-grn)",
              display: "grid", placeItems: "center", marginBottom: 20,
              animation: "cvAppear 0.5s ease",
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--color-grn)" strokeWidth={2.5}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--color-grn)" }}>
              CV adapte !
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-tx2)", textAlign: "center" }}>
              Votre profil, experiences et competences ont ete adaptes a l'offre
            </p>
          </>
        ) : (
          /* === ADAPTING STATE — facts-centered === */
          <>
            {/* Step label — compact top */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 40,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: "2px solid var(--color-brd)", borderTopColor: "var(--color-acc)",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13, color: "var(--color-acc)", fontWeight: 500 }}>
                {ADAPT_STEPS[Math.min(progress, ADAPT_STEPS.length - 1)]}
              </span>
            </div>

            {/* Main fact — big, centered, takes the stage */}
            <div key={factIndex} style={{
              textAlign: "center", maxWidth: 480,
              animation: "cvAppear 0.5s ease",
            }}>
              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 700,
                color: "var(--color-tx)", lineHeight: 1.5, marginBottom: 16,
              }}>
                {MARKETING_FACTS[factIndex].text}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-tx3)" }}>
                {MARKETING_FACTS[factIndex].source}
              </div>
            </div>

            {/* Progress dots — minimal bottom */}
            <div style={{
              display: "flex", gap: 8, marginTop: 48, alignItems: "center",
            }}>
              {MARKETING_FACTS.map((_, i) => (
                <div key={i} style={{
                  width: i === factIndex ? 24 : 6, height: 6, borderRadius: 3,
                  background: i === factIndex ? "var(--color-acc)" : "var(--color-brd)",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>

            {/* Progress bar — thin bottom */}
            <div style={{ width: "100%", maxWidth: 300, marginTop: 20, height: 2, background: "var(--color-brd)", borderRadius: 1 }}>
              <div style={{
                height: "100%", background: "var(--color-acc)", borderRadius: 1,
                width: `${(progress / ADAPT_STEPS.length) * 100}%`,
                transition: "width 0.5s ease",
              }} />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
