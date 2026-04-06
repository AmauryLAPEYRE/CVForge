"use client";

import { useEffect, useState } from "react";
import { useCVStore } from "@/hooks/useCVStore";
import type { GeneratedCV } from "@/lib/types";
import CVCard from "./CVCard";
import PreviewPanel from "./PreviewPanel";

const FILTER_CHIPS = [
  { label: "Tous", value: null },
  { label: "Sombre", value: "dark" },
  { label: "Clair", value: "clean" },
  { label: "Split", value: "split" },
  { label: "Minimal", value: "minimal" },
  { label: "Bold", value: "bold" },
  { label: "Creatif", value: "nature" },
];

async function generateStyleIndex(
  cvData: object,
  jobOffer: string,
  styleIndex: number
): Promise<GeneratedCV> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvData, jobOffer, styleIndex }),
  });
  if (!res.ok) throw new Error(`Generate failed for style ${styleIndex}`);
  return res.json();
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-brd)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          aspectRatio: "210/297",
          background: "var(--color-bg-up)",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "8px 10px", display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            height: 12,
            width: 70,
            borderRadius: 4,
            background: "var(--color-bg-up)",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 12,
            width: 40,
            borderRadius: 999,
            background: "var(--color-bg-up)",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

export default function StepChoisissez() {
  const { state, dispatch } = useCVStore();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { cvData, jobOffer, generatedCVs, selectedCVId, isGenerating, step } = state;

  const selectedCV = generatedCVs.find((cv) => cv.id === selectedCVId);

  async function triggerGeneration(indices: number[], mode: "set" | "add") {
    if (!cvData) return;
    dispatch({ type: "SET_GENERATING", value: true });
    try {
      const results = await Promise.all(
        indices.map((i) => generateStyleIndex(cvData, jobOffer, i))
      );
      if (mode === "set") {
        dispatch({ type: "SET_GENERATED_CVS", cvs: results });
      } else {
        dispatch({ type: "ADD_GENERATED_CVS", cvs: results });
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      dispatch({ type: "SET_GENERATING", value: false });
    }
  }

  // Auto-generate when step becomes 2 and no CVs yet
  useEffect(() => {
    if (step === 2 && generatedCVs.length === 0 && cvData && !isGenerating) {
      triggerGeneration([0, 1, 2, 3, 4, 5], "set");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleRegenerate() {
    dispatch({ type: "SET_GENERATED_CVS", cvs: [] });
    triggerGeneration([0, 1, 2, 3, 4, 5], "set");
  }

  function handleAddMore() {
    const nextIndices = Array.from({ length: 6 }, (_, i) => (generatedCVs.length + i) % 6);
    triggerGeneration(nextIndices, "add");
  }

  const filteredCVs = activeFilter
    ? generatedCVs.filter((cv) => cv.style === activeFilter)
    : generatedCVs;

  if (!cvData) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 700 }}>Vos designs</h1>
        <p style={{ color: "var(--color-tx2)", marginTop: 8 }}>
          Importez un CV pour commencer
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              display: "flex",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            Vos designs
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-tx3)",
                fontFamily: "inherit",
              }}
            >
              {generatedCVs.length}
            </span>
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-tx3)", margin: 0, marginTop: 2 }}>
            Selectionnez un design pour le personnaliser
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            style={{
              fontSize: 12,
              color: "var(--color-tx2)",
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--color-brd)",
              background: "var(--color-bg-up)",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isGenerating ? 0.5 : 1,
            }}
          >
            Regenerer tout
          </button>
          <button
            onClick={handleAddMore}
            disabled={isGenerating}
            style={{
              fontSize: 12,
              color: "var(--color-acc)",
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid rgba(201,165,90,0.3)",
              background: "var(--color-acc-g)",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isGenerating ? 0.5 : 1,
            }}
          >
            + 6 designs
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        {FILTER_CHIPS.map((chip) => {
          const active = activeFilter === chip.value;
          return (
            <button
              key={chip.label}
              onClick={() => setActiveFilter(chip.value)}
              style={{
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                padding: "5px 13px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--color-acc)" : "var(--color-brd)"}`,
                background: active ? "var(--color-acc-g)" : "transparent",
                color: active ? "var(--color-acc)" : "var(--color-tx3)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 16,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Cards grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {isGenerating && generatedCVs.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredCVs.map((cv) => (
                  <CVCard
                    key={cv.id}
                    cv={cv}
                    isSelected={cv.id === selectedCVId}
                    onSelect={() =>
                      dispatch({
                        type: "SELECT_CV",
                        id: cv.id === selectedCVId ? null : cv.id,
                      })
                    }
                  />
                ))}
            {/* Skeleton placeholders for additional loading CVs */}
            {isGenerating &&
              generatedCVs.length > 0 &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`loading-${i}`} />)}
          </div>
        </div>

        {/* Preview panel */}
        {selectedCV && (
          <PreviewPanel
            cv={selectedCV}
            onColorChange={(id, color) =>
              dispatch({ type: "UPDATE_CV_COLOR", id, color })
            }
            onLayoutChange={(id, layout) =>
              dispatch({ type: "UPDATE_CV_LAYOUT", id, layout })
            }
            onClose={() => dispatch({ type: "SELECT_CV", id: null })}
          />
        )}
      </div>
    </div>
  );
}
