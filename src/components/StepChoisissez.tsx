"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useCVStore } from "@/hooks/useCVStore";
import { STYLE_DIRECTIONS } from "@/lib/styles";
import { renderTemplate } from "@/lib/cv-renderer";
import { EXAMPLE_CV } from "@/lib/example-data";
import type { GeneratedCV } from "@/lib/types";
import PaywallModal from "./PaywallModal";
import AdaptModal from "./AdaptModal";

// Colors are now per-template — defined in styles.ts

// Inject CSS to remove scrollbars and margins inside iframe
function prepareForPreview(html: string, isGenerated = false): string {
  if (!html) return html;
  const watermark = isGenerated ? "" : `
    body::before{
      content:'APERCU CVFORGE';position:fixed;top:50%;left:50%;
      transform:translate(-50%,-50%) rotate(-35deg);
      font-size:60px;font-weight:900;letter-spacing:16px;
      color:rgba(150,150,150,0.15);pointer-events:none;z-index:9999;
      font-family:sans-serif;white-space:nowrap;
    }
  `;
  const injectCSS = `<style>html,body{margin:0!important;padding:0!important;overflow:hidden!important;}::-webkit-scrollbar{display:none!important;}${watermark}</style>`;
  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>${injectCSS}`);
  }
  if (html.includes("<html")) {
    return html.replace(/<html[^>]*>/, (m) => `${m}${injectCSS}`);
  }
  return injectCSS + html;
}

function recolorTemplate(html: string, defaultColor: string, newColor: string, defaultBg?: string, newBg?: string): string {
  if (!html) return html;
  let result = html;

  // Replace accent CSS variable
  if (result.includes("--accent")) {
    result = result.replace(/--accent:\s*#[0-9a-fA-F]{3,8}/g, `--accent:${newColor}`);
    result = result.replace(/--accent-light:\s*#[0-9a-fA-F]{3,8}/g, `--accent-light:${lightenHex(newColor, 30)}`);
  }

  // Replace hardcoded accent color
  if (defaultColor !== newColor) {
    const escaped = defaultColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), newColor);
  }

  // Replace background colors (for dark-bg templates like Atlantic, Soma, Velvet)
  if (defaultBg && newBg && defaultBg !== newBg) {
    // Replace CSS variables --bg, --bg2, --bg3
    result = result.replace(/--bg:\s*#[0-9a-fA-F]{3,8}/g, `--bg:${newBg}`);
    result = result.replace(/--bg2:\s*#[0-9a-fA-F]{3,8}/g, `--bg2:${lightenHex(newBg, 6)}`);
    result = result.replace(/--bg3:\s*#[0-9a-fA-F]{3,8}/g, `--bg3:${lightenHex(newBg, 12)}`);

    // Also replace hardcoded bg values
    const escapedBg = defaultBg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escapedBg, "gi"), newBg);
  }

  return result;
}

function lightenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

async function generateOne(cvData: object, styleIndex: number, accentColor?: string): Promise<GeneratedCV> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvData, styleIndex, accentColor }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(err.error || "Generation echouee");
  }
  return res.json();
}

export default function StepChoisissez() {
  const { state, dispatch } = useCVStore();
  const [activeStyle, setActiveStyle] = useState(0);
  const [selectedColor, setSelectedColor] = useState(STYLE_DIRECTIONS[0].defaultColor);
  const [templateHtmls, setTemplateHtmls] = useState<Map<number, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const adaptTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [error, setError] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAdaptModal, setShowAdaptModal] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const cvIframeRef = useRef<HTMLIFrameElement>(null);

  // Adapt CV to job offer — debounced, runs in background
  const handleJobOfferChange = useCallback((text: string) => {
    dispatch({ type: "SET_JOB_OFFER", text });

    if (adaptTimerRef.current) clearTimeout(adaptTimerRef.current);

    if (!text.trim()) {
      // Restore original CV when offer is cleared
      dispatch({ type: "RESTORE_ORIGINAL_CV" });
      return;
    }

    adaptTimerRef.current = setTimeout(async () => {
      const original = state.originalCvData;
      if (!original) return;

      dispatch({ type: "SET_ADAPTING", value: true });
      try {
        const res = await fetch("/api/adapt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cvData: original, jobOffer: text }),
        });
        if (res.ok) {
          const adapted = await res.json();
          dispatch({ type: "SET_CV_DATA", data: adapted });
        }
      } catch (err) {
        console.error("Adaptation failed:", err);
      } finally {
        dispatch({ type: "SET_ADAPTING", value: false });
      }
    }, 2000);
  }, [dispatch, state.originalCvData]);

  // Check subscription on mount + after Stripe return
  useEffect(() => {
    // Check URL for paid=true (Stripe return)
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      setIsSubscriber(true);
      // Clean URL
      window.history.replaceState({}, "", "/");
      return;
    }

    // Check cookie for stored email
    const match = document.cookie.match(/cvforge_email=([^;]+)/);
    if (match) {
      const email = decodeURIComponent(match[1]);
      fetch("/api/verify-sub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((data) => { if (data.active) setIsSubscriber(true); })
        .catch(() => {});
    }
  }, []);

  // Handle download — paywall or direct
  function handleDownloadClick() {
    if (isSubscriber) {
      handleDownload();
    } else {
      setShowPaywall(true);
    }
  }

  const scaleIframe = useCallback(() => {
    const el = cvIframeRef.current;
    if (!el) return;
    const container = el.parentElement;
    if (container && container.clientWidth > 0) {
      el.style.transform = `scale(${container.clientWidth / 794})`;
    }
  }, []);

  // Recalculate scale on style change and after slide transitions
  useEffect(() => {
    scaleIframe();
    const t1 = setTimeout(scaleIframe, 300);
    const t2 = setTimeout(scaleIframe, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [activeStyle, scaleIframe]);

  const { cvData, jobOffer, generatedCVs } = state;
  const style = STYLE_DIRECTIONS[activeStyle];

  // Find generated CV for current style
  const generatedCV = generatedCVs.find((cv) => cv.name === style.name);

  // Observe center panel size to calculate iframe scale
  // Load all templates and render with example data for preview
  useEffect(() => {
    STYLE_DIRECTIONS.forEach((s, idx) => {
      fetch(`/templates/${s.templateFile}`)
        .then((r) => r.text())
        .then((rawHtml) => {
          // If template has markers, render with example data
          const html = rawHtml.includes("{{firstName}}")
            ? renderTemplate(rawHtml, EXAMPLE_CV, s.defaultColor)
            : rawHtml;
          setTemplateHtmls((prev) => new Map(prev).set(idx, html));
        })
        .catch(() => {});
    });
  }, []);

  // Reset color when switching style
  useEffect(() => {
    setSelectedColor(style.defaultColor);
    setError("");
  }, [activeStyle, style.defaultColor]);

  // Find the selected color option (for bg color support)
  const selectedColorOption = style.colors.find((c) => c.hex === selectedColor);
  const selectedBg = selectedColorOption?.bg;
  const defaultBg = style.colors[0]?.bg;

  // Base HTML — only changes when switching template or generating, NOT on color change
  const rawHtml = generatedCV?.html || templateHtmls.get(activeStyle) || "";
  const baseHtml = prepareForPreview(rawHtml, !!generatedCV);

  // Apply color changes directly in iframe DOM (no reload)
  useEffect(() => {
    const iframe = cvIframeRef.current;
    if (!iframe || generatedCV) return;

    const apply = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc || !doc.documentElement) return;
        const root = doc.documentElement;

        // Set CSS variables
        root.style.setProperty("--accent", selectedColor);
        root.style.setProperty("--accent-light", lightenHex(selectedColor, 30));

        if (selectedBg) {
          root.style.setProperty("--bg", selectedBg);
          root.style.setProperty("--bg2", lightenHex(selectedBg, 6));
          root.style.setProperty("--bg3", lightenHex(selectedBg, 12));
        }

        // For templates with hardcoded colors: inject override stylesheet
        let override = doc.getElementById("color-override") as HTMLStyleElement;
        if (!override) {
          override = doc.createElement("style");
          override.id = "color-override";
          doc.head.appendChild(override);
        }

        const defaultAcc = style.defaultColor;
        const escaped = defaultAcc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Build CSS that overrides all hardcoded color references
        const allStyles = Array.from(doc.querySelectorAll("style"));
        let overrideCSS = "";
        for (const s of allStyles) {
          if (s.id === "color-override") continue;
          // Find all selectors that reference the default color
          const rules = s.textContent || "";
          if (rules.includes(defaultAcc)) {
            overrideCSS = rules.replace(new RegExp(escaped, "gi"), selectedColor);
          }
        }
        if (overrideCSS && selectedColor !== defaultAcc) {
          override.textContent = overrideCSS;
        } else {
          override.textContent = "";
        }
      } catch { /* sandbox restriction */ }
    };

    apply();
    iframe.addEventListener("load", apply);
    return () => iframe.removeEventListener("load", apply);
  }, [selectedColor, selectedBg, generatedCV]);

  async function handleGenerate() {
    if (!cvData || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const cv = await generateOne(cvData, activeStyle, selectedColor);
      dispatch({ type: "ADD_GENERATED_CVS", cvs: [cv] });
      setJustGenerated(true);
      setTimeout(() => setJustGenerated(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de generation");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownload() {
    if (!generatedCV) return;
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: generatedCV.html }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${style.name.toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Erreur lors du telechargement");
    }
  }

  if (!cvData) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 700 }}>Vos designs</h1>
        <p style={{ color: "var(--color-tx2)", marginTop: 8 }}>Importez un CV pour commencer</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", gap: 0, minHeight: 0, overflow: "hidden" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes cvAppear {
          0% { transform: scale(0.9); opacity: 0; filter: blur(8px); }
          60% { transform: scale(1.02); opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes successGlow {
          0% { box-shadow: 0 20px 80px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(92,255,160,0.15); }
          100% { box-shadow: 0 20px 80px rgba(0,0,0,0.5); }
        }
        @keyframes badgePop {
          0% { transform: scale(0) rotate(-20deg); }
          60% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        div:hover > .zoom-hint { opacity: 1 !important; }
      `}</style>

      {/* LEFT — Style selector */}
      <div style={{
        width: 180, flexShrink: 0, display: "flex", flexDirection: "column",
        borderRight: "1px solid var(--color-brd)", background: "var(--color-bg-card)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid var(--color-brd)", flexShrink: 0,
        }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700 }}>Styles</div>
          <div style={{ fontSize: 12, color: "var(--color-tx3)", marginTop: 2 }}>{STYLE_DIRECTIONS.length} designs</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {STYLE_DIRECTIONS.map((s, idx) => {
            const isActive = idx === activeStyle;
            const hasGenerated = generatedCVs.some((cv) => cv.name === s.name);
            return (
              <div
                key={s.name}
                onClick={() => setActiveStyle(idx)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  marginBottom: 2,
                  background: isActive ? "var(--color-acc-gm)" : "transparent",
                  border: isActive ? "1px solid rgba(201,165,90,0.3)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {/* Status icon */}
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  background: isActive ? "var(--color-acc-gm)" : "var(--color-bg)",
                  border: `1px solid ${isActive ? "var(--color-acc)" : "var(--color-brd)"}`,
                  display: "grid", placeItems: "center",
                  transition: "all 0.2s",
                  fontSize: 10,
                }}>
                  {hasGenerated
                    ? <span style={{ color: "var(--color-grn)", fontSize: 11 }}>✓</span>
                    : <span style={{ color: isActive ? "var(--color-acc)" : "var(--color-tx3)", fontSize: 9 }}>{idx + 1}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--color-tx)" : "var(--color-tx2)",
                  }}>{s.name}</div>
                  <div style={{
                    fontSize: 11, color: "var(--color-tx3)",
                    fontWeight: 500,
                  }}>{s.tag}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER — Large CV preview */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--color-bg)", position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "10%", left: "20%", width: 400, height: 300,
          borderRadius: "50%", background: `${selectedColor}08`, filter: "blur(80px)", pointerEvents: "none",
        }} />

        {/* CV frame — pure CSS: aspect-ratio A4 + height constrained */}
        <div
          onClick={() => setIsZoomed(true)}
          style={{
            height: "calc(100% - 16px)",
            aspectRatio: "210 / 297",
            maxWidth: "calc(100% - 16px)",
            borderRadius: 6, overflow: "hidden", position: "relative",
            cursor: "zoom-in",
            boxShadow: justGenerated
              ? "0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(92,255,160,0.15)"
              : "0 20px 80px rgba(0,0,0,0.5)",
            animation: justGenerated ? "cvAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            transition: "box-shadow 0.5s ease",
          }}
        >
          {baseHtml ? (
            <iframe
              ref={(el) => {
                (cvIframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = el;
                if (el) { el.onload = scaleIframe; scaleIframe(); }
              }}
              srcDoc={baseHtml}
              sandbox="allow-same-origin"
              scrolling="no"
              style={{
                width: "794px", height: "1123px", border: "none",
                transformOrigin: "top left",
                pointerEvents: "none",
                position: "absolute", top: 0, left: 0,
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#ccc", fontSize: 14 }}>
              Chargement...
            </div>
          )}

          {/* "Template" badge when not generated */}
          {!generatedCV && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              padding: "4px 10px", borderRadius: 6,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
              fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 500,
            }}>
              Apercu template
            </div>
          )}

          {/* Generated badge */}
          {generatedCV && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(92,255,160,0.12)", border: "1px solid rgba(92,255,160,0.25)",
              backdropFilter: "blur(8px)",
              fontSize: 11, color: "var(--color-grn)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
              animation: justGenerated ? "badgePop 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--color-grn)" strokeWidth={2.5}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              CV pret
            </div>
          )}

          {/* Zoom hint */}
          {generatedCV && !justGenerated && (
            <div style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              padding: "5px 12px", borderRadius: 6,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              fontSize: 10, color: "rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", gap: 5,
              opacity: 0, transition: "opacity 0.2s",
            }}
            className="zoom-hint"
            >
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                <path d="M11 8v6M8 11h6"/>
              </svg>
              Cliquer pour agrandir
            </div>
          )}

          {/* Loading overlay */}
          {isGenerating && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "2.5px solid var(--color-brd)", borderTopColor: "var(--color-acc)",
                animation: "spin 0.8s linear infinite",
              }} />
              <div style={{ fontSize: 13, color: "var(--color-acc)", fontWeight: 500 }}>
                Generation en cours...
              </div>
              <div style={{ fontSize: 10, color: "var(--color-tx3)" }}>
                Claude Code cree votre CV unique
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Customization panel */}
      <div style={{
        width: 230, flexShrink: 0, display: "flex", flexDirection: "column",
        borderLeft: "1px solid var(--color-brd)", background: "var(--color-bg-card)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid var(--color-brd)", flexShrink: 0,
        }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700 }}>
            {style.name}
          </div>
          <div style={{ fontSize: 10, color: "var(--color-tx3)", marginTop: 2 }}>
            {style.tag} — {style.defaultLayout}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Color accent */}
          <div>
            <div style={{
              fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 2,
              color: "var(--color-tx3)", fontWeight: 600, marginBottom: 10,
            }}>Couleur d'accent</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
              {style.colors.map((c) => {
                const isActive = selectedColor === c.hex;
                const hasBg = !!c.bg;
                return (
                  <div
                    key={c.hex}
                    title={c.label}
                    onClick={() => setSelectedColor(c.hex)}
                    style={{
                      width: 26, height: 26, borderRadius: 6, cursor: "pointer",
                      transition: "all 0.15s", overflow: "hidden", position: "relative",
                      background: hasBg ? "transparent" : c.hex,
                      border: isActive ? "2px solid var(--color-tx)" : "2px solid transparent",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      boxShadow: isActive ? `0 0 12px ${c.hex}44` : "none",
                    }}
                  >
                    {hasBg && (
                      <>
                        {/* Diagonal split: bg color bottom-left, accent top-right */}
                        <div style={{
                          position: "absolute", inset: 0,
                          background: `linear-gradient(135deg, ${c.bg} 50%, ${c.hex} 50%)`,
                        }} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job offer — button that opens modal */}
          <div>
            {jobOffer ? (
              /* Adapted state */
              <div style={{
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(92,255,160,0.05)", border: "1px solid rgba(92,255,160,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-grn)" }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--color-grn)" strokeWidth={2}>
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    CV adapte a l'offre
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-tx3)", lineHeight: 1.5, marginBottom: 8, overflow: "hidden", maxHeight: 40 }}>
                  {jobOffer.slice(0, 100)}...
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowAdaptModal(true)} style={{
                    fontSize: 11, color: "var(--color-acc)", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "inherit", padding: 0, textDecoration: "underline",
                  }}>Modifier</button>
                  <button onClick={() => handleJobOfferChange("")} style={{
                    fontSize: 11, color: "var(--color-tx3)", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "inherit", padding: 0, textDecoration: "underline",
                  }}>Retirer</button>
                </div>
              </div>
            ) : (
              /* CTA button */
              <button
                onClick={() => setShowAdaptModal(true)}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 10,
                  background: "var(--color-acc-g)", border: "1.5px dashed rgba(201,165,90,0.25)",
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-acc)"; (e.currentTarget as HTMLElement).style.background = "var(--color-acc-gm)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,165,90,0.25)"; (e.currentTarget as HTMLElement).style.background = "var(--color-acc-g)"; }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-acc)" }}>Adapter a une offre</div>
                  <div style={{ fontSize: 11, color: "var(--color-tx3)", marginTop: 2 }}>Collez le texte ou l'URL — 2.5x plus de chances</div>
                </div>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              fontSize: 11, color: "#f87171", lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div style={{
          padding: 16, borderTop: "1px solid var(--color-brd)", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {!generatedCV ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                width: "100%", padding: "12px 16px",
                background: isGenerating ? "var(--color-bg-up)" : "var(--color-acc)",
                color: isGenerating ? "var(--color-tx3)" : "var(--color-bg)",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: isGenerating ? "not-allowed" : "pointer",
                fontFamily: "Syne, sans-serif", letterSpacing: 0.5,
                transition: "all 0.2s",
              }}
            >
              {isGenerating ? "Generation..." : "Generer ce style"}
            </button>
          ) : (
            <button
              onClick={handleDownloadClick}
              style={{
                width: "100%", padding: "12px 16px",
                background: "var(--color-acc)", color: "var(--color-bg)",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "Syne, sans-serif", letterSpacing: 0.5,
                transition: "all 0.2s",
              }}
            >
              {isSubscriber ? "Telecharger PDF" : "Telecharger — 0.99€"}
            </button>
          )}

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            fontSize: 9, color: "var(--color-tx3)", marginTop: 4,
          }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="var(--color-tx3)">
              <path d="M12 2L4 7v5c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5z" />
            </svg>
            Paiement securise Stripe
          </div>
        </div>
      </div>

      {/* ADAPT MODAL */}
      {showAdaptModal && (
        <AdaptModal
          isAdapting={state.isAdapting}
          onClose={() => setShowAdaptModal(false)}
          onAdapted={() => setShowAdaptModal(false)}
          onSubmit={async (text) => {
            dispatch({ type: "SET_ADAPTING", value: true });
            const original = state.originalCvData;
            if (!original) throw new Error("No CV data");
            const res = await fetch("/api/adapt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cvData: original, jobOffer: text }),
            });
            if (!res.ok) {
              const err = await res.json();
              dispatch({ type: "SET_ADAPTING", value: false });
              if (err.error === "not_a_job_offer") {
                throw new Error(`not_a_job_offer: ${err.reason}`);
              }
              throw new Error(err.error || "Adaptation failed");
            }
            const adapted = await res.json();
            dispatch({ type: "SET_JOB_OFFER", text });
            dispatch({ type: "SET_CV_DATA", data: adapted });
            dispatch({ type: "SET_ADAPTING", value: false });
          }}
        />
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && createPortal(
        <PaywallModal
          styleName={style.name}
          onClose={() => setShowPaywall(false)}
          onPaid={() => {
            setShowPaywall(false);
            setIsSubscriber(true);
            handleDownload();
          }}
        />,
        document.body
      )}

      {/* PREVIEW MODAL — rendered as portal to escape stacking context */}
      {isZoomed && baseHtml && createPortal(
        <div
          onClick={() => setIsZoomed(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 40,
            animation: "cvAppear 0.3s ease",
            cursor: "pointer",
          }}
        >
          {/* CV — drag to pan + mouse wheel, no scrollbar */}
          <div
            className="no-scrollbar"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              const el = e.currentTarget;
              el.dataset.dragging = "true";
              el.dataset.startX = String(e.clientX);
              el.dataset.startY = String(e.clientY);
              el.dataset.scrollX = String(el.scrollLeft);
              el.dataset.scrollY = String(el.scrollTop);
              el.style.cursor = "grabbing";
            }}
            onMouseMove={(e) => {
              const el = e.currentTarget;
              if (el.dataset.dragging !== "true") return;
              const dx = e.clientX - Number(el.dataset.startX);
              const dy = e.clientY - Number(el.dataset.startY);
              el.scrollLeft = Number(el.dataset.scrollX) - dx;
              el.scrollTop = Number(el.dataset.scrollY) - dy;
            }}
            onMouseUp={(e) => {
              const el = e.currentTarget;
              el.dataset.dragging = "false";
              el.style.cursor = "grab";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.dataset.dragging = "false";
              el.style.cursor = "grab";
            }}
            style={{
              maxHeight: "100%", maxWidth: "100%",
              overflow: "scroll", cursor: "grab",
              scrollbarWidth: "none" as const, msOverflowStyle: "none" as const,
              borderRadius: 6, boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ width: 794, background: "#fff" }}>
              <iframe
                srcDoc={baseHtml}
                sandbox=""
                scrolling="no"
                style={{ width: "100%", height: 1123, border: "none", display: "block", pointerEvents: "none" }}
              />
            </div>
          </div>

          {/* Close button — floating top right */}
          <button
            onClick={() => setIsZoomed(false)}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer",
              display: "grid", placeItems: "center",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          >×</button>

          {/* Download button — floating bottom center */}
          {generatedCV && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDownloadClick(); }}
              style={{
                position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
                padding: "12px 28px", borderRadius: 12,
                background: "var(--color-acc)", color: "var(--color-bg)",
                border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
                fontFamily: "Syne, sans-serif", letterSpacing: 0.5,
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateX(-50%) translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateX(-50%)"; }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Telecharger PDF
            </button>
          )}
        </div>
      , document.body)}
    </div>
  );
}
