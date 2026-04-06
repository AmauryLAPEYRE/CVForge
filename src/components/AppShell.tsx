"use client";

import { useReducer, useCallback, useEffect } from "react";
import { CVStoreContext, initialState, reducer } from "@/hooks/useCVStore";
import type { Step } from "@/lib/types";

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
      // Don't navigate if user is typing in an input/textarea
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
        {/* TOPBAR */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', borderBottom: '1px solid var(--color-brd)',
          background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(24px)', zIndex: 100, flexShrink: 0
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--color-acc)', borderRadius: 7,
              display: 'grid', placeItems: 'center', fontFamily: 'Syne', fontWeight: 800,
              fontSize: 15, color: 'var(--color-bg)'
            }}>C</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>
              CV<span style={{ color: 'var(--color-acc)' }}>Forge</span>
            </div>
          </div>

          {/* Step pills */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--color-bg-card)', border: '1px solid var(--color-brd)',
            borderRadius: 100, padding: 4
          }}>
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => goTo(i as Step)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 18px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                  color: i === state.step ? 'var(--color-tx)' : i < state.step ? 'var(--color-tx2)' : 'var(--color-tx3)',
                  background: i === state.step ? 'var(--color-acc-gm)' : 'transparent',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'inherit'
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  fontSize: 10, fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
                  background: i === state.step ? 'var(--color-acc)' : i < state.step ? 'var(--color-acc-s)' : 'transparent',
                  borderColor: i <= state.step ? 'transparent' : 'var(--color-brd)',
                  border: i > state.step ? '1.5px solid var(--color-brd)' : '1.5px solid transparent',
                  color: i <= state.step ? 'var(--color-bg)' : 'var(--color-tx3)',
                  fontWeight: i === state.step ? 700 : 500,
                  transition: 'all 0.4s'
                }}>
                  {s.num}
                </div>
                {s.label}
              </button>
            ))}
          </div>

          {/* Keyboard hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--color-tx3)' }}>
            <kbd style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 22, height: 20, padding: '0 5px',
              background: 'var(--color-bg-up)', border: '1px solid var(--color-brd)',
              borderRadius: 4, fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--color-tx2)'
            }}>←</kbd>
            <kbd style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 22, height: 20, padding: '0 5px',
              background: 'var(--color-bg-up)', border: '1px solid var(--color-brd)',
              borderRadius: 4, fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--color-tx2)'
            }}>→</kbd>
            <span>naviguer</span>
          </div>
        </div>

        {/* SLIDES */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {(Array.isArray(children) ? children : [children]).map((child, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 40,
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

        {/* BOTTOMBAR */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', borderTop: '1px solid var(--color-brd)',
          background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(24px)', zIndex: 100, flexShrink: 0
        }}>
          <button
            onClick={() => goTo((state.step - 1) as Step)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--color-tx3)', padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--color-brd)', background: 'none', cursor: 'pointer',
              fontFamily: 'inherit', visibility: state.step === 0 ? 'hidden' : 'visible',
              transition: 'all 0.2s'
            }}
          >
            ← Retour
          </button>

          <div style={{
            flex: 1, maxWidth: 300, height: 3,
            background: 'var(--color-brd)', borderRadius: 2, margin: '0 24px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', background: 'var(--color-acc)', borderRadius: 2,
              width: `${((state.step + 1) / 3) * 100}%`,
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>

          <button
            onClick={() => goTo((state.step + 1) as Step)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: 'var(--color-bg)',
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: 'var(--color-acc)', cursor: 'pointer',
              fontFamily: 'inherit', visibility: state.step === 2 ? 'hidden' : 'visible',
              transition: 'all 0.2s'
            }}
          >
            Suivant →
          </button>
        </div>
      </div>
    </CVStoreContext.Provider>
  );
}
