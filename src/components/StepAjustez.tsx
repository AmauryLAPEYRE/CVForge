"use client";

import { useCVStore } from "@/hooks/useCVStore";
import SummaryCards from "./SummaryCards";
import EditModal from "./EditModal";
import JobOfferInput from "./JobOfferInput";
import { useState } from "react";
import type { Step } from "@/lib/types";

export default function StepAjustez() {
  const { state, dispatch } = useCVStore();
  const [editOpen, setEditOpen] = useState(false);

  if (!state.cvData) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 700 }}>Vos informations</h1>
        <p style={{ color: "var(--color-tx2)", marginTop: 8 }}>Importez un CV pour commencer</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "0 10px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, margin: 0 }}>Vos informations</h2>
          <span style={{ color: "var(--color-tx3)", fontSize: 12 }}>Extrait par l&apos;IA — verifiez d&apos;un coup d&apos;oeil</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              fontSize: 11,
              color: "var(--color-acc)",
              padding: "5px 12px",
              borderRadius: 6,
              background: "var(--color-acc-g)",
              border: "1px solid rgba(201,165,90,0.15)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Modifier
          </button>
          <button
            onClick={() => dispatch({ type: "SET_STEP", step: 2 as Step })}
            style={{
              padding: "8px 20px",
              background: "var(--color-bg-up)",
              border: "1px solid var(--color-brd)",
              borderRadius: 8,
              color: "var(--color-tx)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Passer
          </button>
          <button
            onClick={() => dispatch({ type: "SET_STEP", step: 2 as Step })}
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
            Generer les designs →
          </button>
        </div>
      </div>

      {/* Grid: 3 cols x 2 rows */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "auto 1fr",
          gap: 10,
          minHeight: 0,
        }}
      >
        <SummaryCards cvData={state.cvData} />
        <JobOfferInput
          value={state.jobOffer}
          onChange={(text) => dispatch({ type: "SET_JOB_OFFER", text })}
        />
      </div>

      {editOpen && (
        <EditModal
          cvData={state.cvData}
          onSave={(data) => {
            dispatch({ type: "SET_CV_DATA", data });
            setEditOpen(false);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
