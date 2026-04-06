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

const FORMAT_TAGS = [".pdf", ".png", ".jpg", ".docx"];

export default function DropZone({ onFileSelected, onTextPasted }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState("");
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
      if (file && ACCEPTED_TYPES.includes(file.type)) {
        onFileSelected(file);
      }
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

  const handleTextKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        if (text.trim()) {
          onTextPasted(text.trim());
        }
      }
    },
    [text, onTextPasted]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          position: "relative",
          border: `1.5px dashed ${isDragging ? "var(--color-acc)" : "var(--color-brd-h)"}`,
          borderRadius: 16,
          padding: "40px 32px",
          background: isDragging ? "var(--color-acc-g)" : "var(--color-bg-in)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          transition: "all 0.25s ease",
          boxShadow: isDragging
            ? "0 0 32px rgba(201,165,90,0.18), inset 0 0 32px rgba(201,165,90,0.06)"
            : "none",
          userSelect: "none",
        }}
      >
        {/* Upload icon with pulse */}
        <div
          style={{
            position: "relative",
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* Pulse ring */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "1.5px solid rgba(201,165,90,0.25)",
              animation: "pulseRing 2.4s ease-out infinite",
            }}
          />
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: isDragging ? "var(--color-acc-gm)" : "var(--color-bg-up)",
              border: `1px solid ${isDragging ? "var(--color-acc)" : "var(--color-brd)"}`,
              display: "grid",
              placeItems: "center",
              transition: "all 0.25s ease",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDragging ? "var(--color-acc)" : "var(--color-tx2)"}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "stroke 0.25s ease" }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-tx)", marginBottom: 4 }}>
            Glissez votre CV ici
          </p>
          <p style={{ fontSize: 12, color: "var(--color-tx3)" }}>
            ou{" "}
            <span style={{ color: "var(--color-acc)", textDecoration: "underline" }}>
              parcourez vos fichiers
            </span>
          </p>
        </div>

        {/* Format tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {FORMAT_TAGS.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontFamily: "JetBrains Mono, monospace",
                padding: "3px 8px",
                borderRadius: 5,
                background: "var(--color-bg-up)",
                border: "1px solid var(--color-brd)",
                color: "var(--color-tx3)",
                letterSpacing: 0.5,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-brd)" }} />
        <span style={{ fontSize: 11, color: "var(--color-tx3)", letterSpacing: 1 }}>OU</span>
        <div style={{ flex: 1, height: 1, background: "var(--color-brd)" }} />
      </div>

      {/* Text paste area */}
      <div style={{ position: "relative" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTextKeyDown}
          placeholder="Collez le texte de votre CV ici..."
          rows={5}
          style={{
            width: "100%",
            background: "var(--color-bg-in)",
            border: "1.5px solid var(--color-brd)",
            borderRadius: 12,
            padding: "14px 16px",
            color: "var(--color-tx)",
            fontSize: 13,
            lineHeight: 1.6,
            resize: "none",
            outline: "none",
            fontFamily: "DM Sans, sans-serif",
            boxSizing: "border-box",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-brd-h)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-brd)";
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 5,
            pointerEvents: "none",
          }}
        >
          <kbd
            style={{
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--color-bg-up)",
              border: "1px solid var(--color-brd)",
              color: "var(--color-tx3)",
            }}
          >
            Ctrl+↵
          </kbd>
          <span style={{ fontSize: 10, color: "var(--color-tx3)" }}>pour envoyer</span>
        </div>
      </div>

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
