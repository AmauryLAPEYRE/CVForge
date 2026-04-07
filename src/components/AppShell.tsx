"use client";

import { useReducer, useCallback, useEffect } from "react";
import { CVStoreContext, initialState, reducer } from "@/hooks/useCVStore";
import type { Step } from "@/lib/types";
import AnalyseOverlay from "./AnalyseOverlay";

const STEPS = [
  { num: 1, label: "Deposez" },
  { num: 2, label: "Ajustez" },
  { num: 3, label: "Choisissez" },
];

export default function AppShell({ children }: { children: React.ReactNode[] }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goTo = useCallback(
    (step: Step) => {
      if (step < 0 || step > 2 || step === state.step) return;
      dispatch({ type: "SET_STEP", step });
    },
    [state.step]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" && state.step < 2) goTo((state.step + 1) as Step);
      if (e.key === "ArrowLeft" && state.step > 0) goTo((state.step - 1) as Step);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.step, goTo]);

  return (
    <CVStoreContext.Provider value={{ state, dispatch }}>
      <div className="h-screen w-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
        {/* TOPBAR — minimal, immersive */}
        <div style={{
          height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 32px', borderBottom: '1px solid var(--color-brd)',
          background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(24px)', zIndex: 100, flexShrink: 0,
          position: 'relative',
        }}>
          {/* Logo — left */}
          <div style={{
            position: 'absolute', left: 24, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 24, height: 24, background: 'var(--color-acc)', borderRadius: 6,
              display: 'grid', placeItems: 'center', fontFamily: 'Syne', fontWeight: 800,
              fontSize: 13, color: 'var(--color-bg)',
            }}>C</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>
              CV<span style={{ color: 'var(--color-acc)' }}>Forge</span>
            </div>
          </div>

          {/* Step pills — centered */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--color-bg-card)', border: '1px solid var(--color-brd)',
            borderRadius: 100, padding: 3,
          }}>
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => goTo(i as Step)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                  color: i === state.step ? 'var(--color-tx)' : i < state.step ? 'var(--color-tx2)' : 'var(--color-tx3)',
                  background: i === state.step ? 'var(--color-acc-gm)' : 'transparent',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  fontSize: 10,
                  background: i === state.step ? 'var(--color-acc)' : i < state.step ? 'var(--color-acc-s)' : 'transparent',
                  border: i > state.step ? '1.5px solid var(--color-brd)' : '1.5px solid transparent',
                  color: i <= state.step ? 'var(--color-bg)' : 'var(--color-tx3)',
                  fontWeight: i === state.step ? 700 : 500,
                  transition: 'all 0.4s',
                }}>
                  {i < state.step ? '✓' : s.num}
                </div>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* SLIDES — full remaining space */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {(Array.isArray(children) ? children : [children]).map((child, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex',
                alignItems: i === 2 ? 'stretch' : 'center',
                justifyContent: i === 2 ? 'stretch' : 'center',
                padding: i === 2 ? 0 : 40,
                opacity: i === state.step ? 1 : 0,
                transform: i === state.step ? 'translateX(0)' : i < state.step ? 'translateX(-80px)' : 'translateX(80px)',
                pointerEvents: i === state.step ? 'auto' : 'none',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {child}
            </div>
          ))}
        </div>

        <AnalyseOverlay />
      </div>
    </CVStoreContext.Provider>
  );
}
