"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent, KeyboardEvent } from "react";

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onTextPasted: (text: string) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function DropZone({ onFileSelected, onTextPasted }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"drop" | "paste">("drop");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && ACCEPTED_TYPES.includes(file.type)) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleSubmitText = useCallback(() => {
    if (text.trim()) onTextPasted(text.trim());
  }, [text, onTextPasted]);

  const handleTextKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        handleSubmitText();
      }
    },
    [handleSubmitText]
  );

  return (
    <div style={{ width: 440, maxWidth: "90vw" }}>
      <style>{`
        @keyframes cvFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes cvDrop {
          0% { transform: translateY(-20px) rotate(-5deg) scale(0.9); opacity: 0; }
          40% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          60% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80% { transform: translateY(4px) scale(0.97); opacity: 0.7; }
          100% { transform: translateY(8px) scale(0.92); opacity: 0; }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,165,90,0); }
          50% { box-shadow: 0 0 30px 4px rgba(201,165,90,0.08); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Mode toggle */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 10,
        background: "var(--color-bg-card)", borderRadius: 8, padding: 3,
        border: "1px solid var(--color-brd)",
      }}>
        <button onClick={() => setMode("drop")} style={{
          flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
          fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          background: mode === "drop" ? "var(--color-acc-gm)" : "transparent",
          color: mode === "drop" ? "var(--color-tx)" : "var(--color-tx3)",
          transition: "all 0.2s",
        }}>Importer un fichier</button>
        <button onClick={() => setMode("paste")} style={{
          flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
          fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          background: mode === "paste" ? "var(--color-acc-gm)" : "transparent",
          color: mode === "paste" ? "var(--color-tx)" : "var(--color-tx3)",
          transition: "all 0.2s",
        }}>Coller le texte</button>
      </div>

      {mode === "drop" ? (
        /* ===== DROP ZONE with animated mini-CV ===== */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            position: "relative",
            border: `1.5px dashed ${isDragging ? "var(--color-acc)" : "var(--color-brd)"}`,
            borderRadius: 16,
            padding: "32px",
            background: isDragging ? "var(--color-acc-g)" : "var(--color-bg-card)",
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 0.3s",
            animation: "pulseGlow 4s ease-in-out infinite",
          }}
        >
          {/* Animated mini-CV */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, height: 140, position: "relative",
          }}>
            {/* Target zone glow */}
            <div style={{
              position: "absolute", bottom: 10, width: 100, height: 6,
              borderRadius: 3, background: "var(--color-acc)",
              opacity: 0.1, filter: "blur(4px)",
            }} />

            {/* Mini CV document */}
            <div style={{
              width: 90, height: 120, background: "#fff", borderRadius: 6,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
              position: "relative", overflow: "hidden",
              animation: isDragging ? "cvDrop 2s ease-in-out infinite" : "cvFloat 3s ease-in-out infinite",
            }}>
              {/* Mini CV content lines */}
              <div style={{ padding: "10px 8px" }}>
                {/* Header */}
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 3, background: "var(--color-acc)", opacity: 0.7 }} />
                  <div>
                    <div style={{ height: 3, width: 36, background: "#222", borderRadius: 1, marginBottom: 3 }} />
                    <div style={{ height: 2, width: 28, background: "#bbb", borderRadius: 1 }} />
                  </div>
                </div>
                {/* Lines */}
                {[38, 32, 36, 24, 38, 30, 34, 26, 38, 32].map((w, i) => (
                  <div key={i} style={{
                    height: 2, width: `${w}px`, borderRadius: 1, marginBottom: 3,
                    background: i === 3 || i === 7 ? "var(--color-acc)" : "#e0e0e0",
                    opacity: i === 3 || i === 7 ? 0.4 : 0.6,
                  }} />
                ))}
              </div>

              {/* Shimmer effect */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                animation: "shimmerLine 3s ease-in-out infinite",
              }} />
            </div>

            {/* Floating format badges around the CV */}
            {[
              { label: "PDF", top: 8, left: 10, delay: "0s" },
              { label: "JPG", top: 60, right: 10, delay: "0.5s" },
              { label: "DOCX", bottom: 5, left: 20, delay: "1s" },
            ].map((b, i) => (
              <div key={i} style={{
                position: "absolute", ...Object.fromEntries(
                  Object.entries(b).filter(([k]) => ["top","left","right","bottom"].includes(k))
                ),
                fontSize: 10, fontWeight: 500,
                padding: "3px 8px", borderRadius: 6,
                background: "var(--color-bg-up)", border: "1px solid var(--color-brd)",
                color: "var(--color-tx3)", letterSpacing: 0.5,
                animation: `cvFloat 3s ease-in-out ${b.delay} infinite`,
              }}>{b.label}</div>
            ))}
          </div>

          {/* Text */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-tx)", marginBottom: 4 }}>
              Glissez votre CV ici
            </p>
            <p style={{ fontSize: 14, color: "var(--color-tx3)" }}>
              ou <span style={{ color: "var(--color-acc)", textDecoration: "underline" }}>parcourez vos fichiers</span>
            </p>
          </div>

          {/* Format tags */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14 }}>
            {["PDF", "PNG", "JPG", "DOCX"].map((f) => (
              <span key={f} style={{
                fontSize: 11, fontWeight: 500,
                padding: "4px 10px", borderRadius: 6,
                background: "var(--color-bg)", border: "1px solid var(--color-brd)",
                color: "var(--color-tx3)", letterSpacing: 0.5,
              }}>{f}</span>
            ))}
          </div>

          <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx"
            style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      ) : (
        /* ===== TEXT PASTE with animated cursor ===== */
        <div style={{
          position: "relative",
          background: "var(--color-bg-card)",
          border: "1.5px solid var(--color-brd)",
          borderRadius: 16, padding: 0, overflow: "hidden",
        }}>
          {/* Header bar */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--color-brd)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--color-tx3)", fontWeight: 500 }}>
              Contenu du CV
            </span>
          </div>

          {/* Textarea */}
          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="Collez le contenu de votre CV ici...&#10;&#10;Nom, prenom, titre, experiences, competences..."
              rows={8}
              style={{
                width: "100%", background: "transparent",
                border: "none", padding: "16px 18px",
                color: "var(--color-tx)", fontSize: 13, lineHeight: 1.7,
                resize: "none", outline: "none",
                fontWeight: 500,
              }}
            />

            {/* Blinking cursor when empty */}
            {!text && (
              <div style={{
                position: "absolute", top: 18, left: 18,
                width: 2, height: 16, background: "var(--color-acc)",
                animation: "cursorBlink 1s step-end infinite",
                pointerEvents: "none",
              }} />
            )}
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: "10px 16px", borderTop: "1px solid var(--color-brd)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <kbd style={{
                fontSize: 9, fontWeight: 500,
                padding: "2px 6px", borderRadius: 4,
                background: "var(--color-bg)", border: "1px solid var(--color-brd)",
                color: "var(--color-tx3)",
              }}>Ctrl+↵</kbd>
              <span style={{ fontSize: 10, color: "var(--color-tx3)" }}>pour analyser</span>
            </div>
            {text.trim() && (
              <button onClick={handleSubmitText} style={{
                fontSize: 11, fontWeight: 600, padding: "6px 16px",
                background: "var(--color-acc)", color: "var(--color-bg)",
                border: "none", borderRadius: 6, cursor: "pointer",
                fontFamily: "inherit",
              }}>Analyser</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
