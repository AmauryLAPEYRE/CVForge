# CVForge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app where users import a CV, optionally paste a job offer, and get unlimited AI-generated CV designs to download as PDF.

**Architecture:** Next.js App Router with 3-step horizontal navigation (no scroll). API routes call Claude SDK for extraction. **CV HTML generation is done via a local MCP server that invokes Claude Code with /frontend-design skill** — producing truly premium, unique designs (not generic prompt output). Puppeteer for HTML→PDF. Stripe Checkout for payment. No database — all client-side state.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, Anthropic SDK (@anthropic-ai/sdk), Claude Code CLI (MCP server for CV generation), Puppeteer, Stripe, TypeScript

**Key Architecture Decision:** The `/api/generate` route does NOT call the Anthropic SDK directly. Instead it calls a **local MCP server** that wraps Claude Code. Claude Code then uses the `/frontend-design` skill to generate each CV as a complete HTML file with premium design quality (unique fonts, bold layouts, print-ready CSS). This is the product's competitive advantage — AI-generated CVs that look genuinely designed, not template-filled.

```
Flow: Browser → /api/generate → MCP Server → Claude Code CLI → /frontend-design → HTML
```

---

## File Structure

```
cvforge/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, global styles
│   │   ├── page.tsx                # Main app (3-step horizontal flow)
│   │   ├── globals.css             # Tailwind + CSS variables + animations
│   │   └── api/
│   │       ├── extract/route.ts    # POST: file/text → Claude SDK → structured JSON
│   │       ├── generate/route.ts   # POST: CV data + style → MCP server → Claude Code /frontend-design → HTML
│   │       ├── download/route.ts   # POST: HTML → Puppeteer → PDF
│   │       └── checkout/route.ts   # POST: plan → Stripe session URL
│   ├── components/
│   │   ├── AppShell.tsx            # Topbar + steps + bottombar + slide container
│   │   ├── StepDeposez.tsx         # Step 1: hero + drop zone
│   │   ├── StepAjustez.tsx         # Step 2: summary cards + job offer
│   │   ├── StepChoisissez.tsx      # Step 3: gallery + preview panel
│   │   ├── DropZone.tsx            # Drag & drop + file input + textarea
│   │   ├── AnalyseOverlay.tsx      # Extraction animation (scan + particles)
│   │   ├── SummaryCards.tsx         # Compact data display (identity, profile, skills, exp)
│   │   ├── EditModal.tsx           # Modal to edit extracted data
│   │   ├── JobOfferInput.tsx       # Job offer textarea card
│   │   ├── DesignGallery.tsx       # Grid of CV thumbnails + filter chips
│   │   ├── CVCard.tsx              # Single CV thumbnail card
│   │   ├── PreviewPanel.tsx        # Right panel: preview + customize + pricing
│   │   └── CustomizeControls.tsx   # Color dots, layout toggles, photo toggle
│   ├── lib/
│   │   ├── types.ts                # CVData, Experience, Education, GeneratedCV types
│   │   ├── prompts.ts              # Claude prompts for extraction + rewriting
│   │   ├── styles.ts               # Style directions for CV generation (names, palettes, descriptions)
│   │   └── mcp-client.ts           # Client to call the local MCP server
│   └── hooks/
│       └── useCVStore.ts           # Client-side state (CV data, generated designs, current step)
├── mcp-server/
│   ├── index.ts                    # MCP server entry point (stdio transport)
│   ├── generate-cv.ts              # Tool: invokes Claude Code CLI with /frontend-design
│   ├── package.json
│   └── tsconfig.json
├── public/
│   └── (static assets)
├── .env.local                      # ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_*
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `.env.local`

- [ ] **Step 1: Create Next.js project**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

Accept defaults. This scaffolds the project.

- [ ] **Step 2: Install dependencies**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge
npm install @anthropic-ai/sdk stripe puppeteer
```

- [ ] **Step 3: Create .env.local**

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
STRIPE_PRICE_SINGLE=price_xxx
STRIPE_PRICE_PACK=price_xxx
STRIPE_PRICE_UNLIMITED=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

- [ ] **Step 4: Set up CSS variables and fonts in globals.css**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #06060a;
  --color-bg-card: #0e0e14;
  --color-bg-up: #151520;
  --color-bg-in: #0b0b12;
  --color-brd: #1e1e2e;
  --color-brd-h: #2e2e44;
  --color-acc: #c9a55a;
  --color-acc-s: #a8884a;
  --color-tx: #eae6df;
  --color-tx2: #8e8e9e;
  --color-tx3: #4e4e62;
  --color-grn: #5cffa0;
}

@font-face {
  font-family: 'Syne';
  src: url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--color-bg);
  color: var(--color-tx);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  height: 100vh;
}

/* Grain overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10000;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.025'/%3E%3C/svg%3E");
}

/* Slide transitions */
.slide-enter { opacity: 0; transform: translateX(80px); }
.slide-active { opacity: 1; transform: translateX(0); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-exit { opacity: 0; transform: translateX(-80px); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

/* Staggered reveals */
@keyframes revealUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal { animation: revealUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
```

- [ ] **Step 5: Set up layout.tsx with Google Fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// Syne via Google Fonts
const syne = localFont({
  src: [],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CVForge — CV professionnel en 10 secondes",
  description: "Importez votre CV, l'IA genere des designs uniques adaptes a l'offre d'emploi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${dmSans.variable} ${jetbrains.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create placeholder page.tsx**

Replace `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne' }}>
        CV<span className="text-[var(--color-acc)]">Forge</span>
      </h1>
    </div>
  );
}
```

- [ ] **Step 7: Run dev server and verify**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && npm run dev
```

Expected: App runs on localhost:3000, dark background, "CVForge" in gold.

- [ ] **Step 8: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git init && git add -A && git commit -m "chore: init Next.js project with Tailwind + fonts + CSS variables"
```

---

## Task 2: Types + Client State

**Files:**
- Create: `src/lib/types.ts`, `src/hooks/useCVStore.ts`

- [ ] **Step 1: Define TypeScript types**

Create `src/lib/types.ts`:

```ts
export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  tasks: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface CVData {
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  profile: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  interests: string[];
  certifications: string[];
}

export interface GeneratedCV {
  id: string;
  name: string;
  style: string;
  html: string;
  accentColor: string;
  layout: "single" | "double" | "sidebar";
}

export type Step = 0 | 1 | 2;

export interface AppState {
  step: Step;
  cvData: CVData | null;
  jobOffer: string;
  generatedCVs: GeneratedCV[];
  selectedCVId: string | null;
  isExtracting: boolean;
  isGenerating: boolean;
}
```

- [ ] **Step 2: Create client state store with React context**

Create `src/hooks/useCVStore.ts`:

```ts
"use client";

import { createContext, useContext, useReducer, type Dispatch } from "react";
import type { AppState, CVData, GeneratedCV, Step } from "@/lib/types";

const initialState: AppState = {
  step: 0,
  cvData: null,
  jobOffer: "",
  generatedCVs: [],
  selectedCVId: null,
  isExtracting: false,
  isGenerating: false,
};

type Action =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_CV_DATA"; data: CVData }
  | { type: "SET_JOB_OFFER"; text: string }
  | { type: "SET_GENERATED_CVS"; cvs: GeneratedCV[] }
  | { type: "ADD_GENERATED_CVS"; cvs: GeneratedCV[] }
  | { type: "SELECT_CV"; id: string | null }
  | { type: "SET_EXTRACTING"; value: boolean }
  | { type: "SET_GENERATING"; value: boolean }
  | { type: "UPDATE_CV_COLOR"; id: string; color: string }
  | { type: "UPDATE_CV_LAYOUT"; id: string; layout: GeneratedCV["layout"] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_CV_DATA":
      return { ...state, cvData: action.data };
    case "SET_JOB_OFFER":
      return { ...state, jobOffer: action.text };
    case "SET_GENERATED_CVS":
      return { ...state, generatedCVs: action.cvs, selectedCVId: null };
    case "ADD_GENERATED_CVS":
      return { ...state, generatedCVs: [...state.generatedCVs, ...action.cvs] };
    case "SELECT_CV":
      return { ...state, selectedCVId: action.id };
    case "SET_EXTRACTING":
      return { ...state, isExtracting: action.value };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.value };
    case "UPDATE_CV_COLOR":
      return {
        ...state,
        generatedCVs: state.generatedCVs.map((cv) =>
          cv.id === action.id ? { ...cv, accentColor: action.color } : cv
        ),
      };
    case "UPDATE_CV_LAYOUT":
      return {
        ...state,
        generatedCVs: state.generatedCVs.map((cv) =>
          cv.id === action.id ? { ...cv, layout: action.layout } : cv
        ),
      };
    default:
      return state;
  }
}

export const CVStoreContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function useCVStore() {
  return useContext(CVStoreContext);
}

export { initialState, reducer };
export type { Action };
```

- [ ] **Step 3: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add src/lib/types.ts src/hooks/useCVStore.ts && git commit -m "feat: add TypeScript types and client state store"
```

---

## Task 3: App Shell (horizontal navigation)

**Files:**
- Create: `src/components/AppShell.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build AppShell component**

Create `src/components/AppShell.tsx`:

```tsx
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
      if (e.key === "ArrowRight" && state.step < 2) goTo((state.step + 1) as Step);
      if (e.key === "ArrowLeft" && state.step > 0) goTo((state.step - 1) as Step);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.step, goTo]);

  return (
    <CVStoreContext.Provider value={{ state, dispatch }}>
      <div className="h-screen w-screen flex flex-col">
        {/* TOPBAR */}
        <div className="h-14 flex items-center justify-between px-8 border-b border-brd bg-bg/85 backdrop-blur-xl z-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-acc rounded-[7px] grid place-items-center font-[Syne] font-extrabold text-[15px] text-bg">C</div>
            <div className="font-[Syne] font-bold text-[17px] tracking-tight">CV<span className="text-acc">Forge</span></div>
          </div>

          <div className="flex items-center gap-1 bg-bg-card border border-brd rounded-full p-1">
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => goTo(i as Step)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  i === state.step
                    ? "bg-acc/15 text-tx"
                    : i < state.step
                    ? "text-tx2"
                    : "text-tx3"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full grid place-items-center text-[10px] font-mono border transition-all duration-300 ${
                    i === state.step
                      ? "bg-acc border-acc text-bg font-bold"
                      : i < state.step
                      ? "bg-acc-s border-acc-s text-bg"
                      : "border-brd"
                  }`}
                >
                  {s.num}
                </div>
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-tx3">
            <kbd className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 bg-bg-up border border-brd rounded font-mono text-[10px] text-tx2">←</kbd>
            <kbd className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 bg-bg-up border border-brd rounded font-mono text-[10px] text-tx2">→</kbd>
            <span>naviguer</span>
          </div>
        </div>

        {/* SLIDES */}
        <div className="flex-1 relative overflow-hidden">
          {children.map((child, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex items-center justify-center p-10 transition-all duration-600 ${
                i === state.step
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : i < state.step
                  ? "opacity-0 -translate-x-20 pointer-events-none"
                  : "opacity-0 translate-x-20 pointer-events-none"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* BOTTOMBAR */}
        <div className="h-13 flex items-center justify-between px-8 border-t border-brd bg-bg/85 backdrop-blur-xl z-50 shrink-0">
          <button
            onClick={() => goTo((state.step - 1) as Step)}
            className={`flex items-center gap-1.5 text-xs text-tx3 px-3.5 py-1.5 rounded-lg border border-brd bg-transparent font-sans transition-all hover:text-tx2 hover:border-brd-h ${
              state.step === 0 ? "invisible" : ""
            }`}
          >
            ← Retour
          </button>

          <div className="flex-1 max-w-[300px] h-[3px] bg-brd rounded-full mx-6 overflow-hidden">
            <div
              className="h-full bg-acc rounded-full transition-all duration-600"
              style={{
                width: `${((state.step + 1) / 3) * 100}%`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>

          <button
            onClick={() => goTo((state.step + 1) as Step)}
            className={`flex items-center gap-1.5 text-[13px] font-semibold text-bg px-5 py-2 rounded-lg bg-acc transition-all hover:-translate-y-px hover:shadow-lg ${
              state.step === 2 ? "invisible" : ""
            }`}
          >
            Suivant →
          </button>
        </div>
      </div>
    </CVStoreContext.Provider>
  );
}
```

- [ ] **Step 2: Update page.tsx to use AppShell**

Replace `src/app/page.tsx`:

```tsx
"use client";

import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      {/* Step 0: Deposez */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold font-[Syne]">
          Deposez. <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-acc)] to-[#e8cf8a]">On fait le reste.</span>
        </h1>
      </div>

      {/* Step 1: Ajustez */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-[Syne]">Vos informations</h1>
      </div>

      {/* Step 2: Choisissez */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-[Syne]">Vos designs</h1>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Run and verify horizontal navigation works**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && npm run dev
```

Expected: 3 steps navigable with arrow keys, pills, and buttons. Smooth slide transitions.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: app shell with horizontal 3-step navigation"
```

---

## Task 4: Step 1 — Drop Zone

**Files:**
- Create: `src/components/StepDeposez.tsx`, `src/components/DropZone.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build DropZone component**

Create `src/components/DropZone.tsx`:

```tsx
"use client";

import { useState, useRef, useCallback } from "react";

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onTextPasted: (text: string) => void;
}

export default function DropZone({ onFileSelected, onTextPasted }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handlePasteSubmit = useCallback(() => {
    if (pasteText.trim()) onTextPasted(pasteText.trim());
  }, [pasteText, onTextPasted]);

  const FORMATS = [".pdf", ".png", ".jpg", ".docx"];

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-[460px] max-w-[90vw] rounded-2xl p-11 bg-bg-card cursor-pointer relative overflow-hidden transition-all duration-400 border-[1.5px] border-dashed ${
        isDragging
          ? "border-acc scale-[1.02] shadow-2xl"
          : "border-brd hover:border-acc-s hover:-translate-y-0.5 hover:shadow-2xl"
      }`}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-radial-gradient from-[var(--color-acc)]/7 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleFileChange} className="hidden" />

      {/* Icon */}
      <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-acc/15 grid place-items-center relative">
        <svg className="w-6 h-6 stroke-acc" fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="text-center font-[Syne] text-[17px] font-semibold mb-1.5">Glissez votre CV ici</div>
      <div className="text-center text-sm text-tx2 mb-5">ou cliquez pour parcourir</div>

      <div className="flex justify-center gap-1.5 mb-5">
        {FORMATS.map((f) => (
          <span key={f} className="text-[10px] font-mono px-2.5 py-1 bg-bg border border-brd rounded-md text-tx3">{f}</span>
        ))}
      </div>

      <div className="flex items-center gap-3.5 mb-5 text-[10px] uppercase tracking-[3px] text-tx3">
        <span className="flex-1 h-px bg-brd" />ou collez votre texte<span className="flex-1 h-px bg-brd" />
      </div>

      <textarea
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); handlePasteSubmit(); } }}
        placeholder="Collez le contenu de votre CV ici..."
        className="w-full min-h-[72px] bg-bg border border-brd rounded-xl p-3.5 text-tx2 text-sm font-sans outline-none resize-none transition-colors focus:border-acc-s placeholder:text-tx3"
      />
    </div>
  );
}
```

- [ ] **Step 2: Build StepDeposez component**

Create `src/components/StepDeposez.tsx`:

```tsx
"use client";

import DropZone from "./DropZone";
import { useCVStore } from "@/hooks/useCVStore";

export default function StepDeposez() {
  const { dispatch } = useCVStore();

  const handleFile = async (file: File) => {
    dispatch({ type: "SET_EXTRACTING", value: true });

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract", { method: "POST", body: formData });
    const data = await res.json();

    dispatch({ type: "SET_CV_DATA", data });
    dispatch({ type: "SET_EXTRACTING", value: false });
    dispatch({ type: "SET_STEP", step: 1 });
  };

  const handleText = async (text: string) => {
    dispatch({ type: "SET_EXTRACTING", value: true });

    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    dispatch({ type: "SET_CV_DATA", data });
    dispatch({ type: "SET_EXTRACTING", value: false });
    dispatch({ type: "SET_STEP", step: 1 });
  };

  return (
    <div className="flex items-center gap-20 max-w-[1100px] w-full">
      {/* Ambient glows */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[400px] rounded-full bg-acc/7 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/4 blur-[120px] pointer-events-none" />

      <div className="flex-1">
        <h1 className="font-[Syne] text-[clamp(38px,4.5vw,58px)] font-extrabold leading-[1.05] tracking-tight mb-4">
          Deposez.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-acc to-[#e8cf8a]">
            On fait{"\n"}le reste.
          </span>
        </h1>
        <p className="text-base text-tx2 leading-relaxed max-w-[420px] mb-7 font-light">
          Importez votre CV existant. L&apos;IA extrait tout, adapte le contenu a l&apos;offre, genere des designs uniques.
        </p>
        <div className="flex gap-8">
          {[
            { val: "< 10s", label: "Generation" },
            { val: "∞", label: "Templates" },
            { val: "A4", label: "Print-ready" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-[Syne] text-2xl font-bold text-acc">{s.val}</div>
              <div className="text-[11px] text-tx3 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <DropZone onFileSelected={handleFile} onTextPasted={handleText} />
    </div>
  );
}
```

- [ ] **Step 3: Wire into page.tsx**

Update `src/app/page.tsx` — replace the Step 0 placeholder:

```tsx
"use client";

import AppShell from "@/components/AppShell";
import StepDeposez from "@/components/StepDeposez";

export default function Home() {
  return (
    <AppShell>
      <StepDeposez />
      <div className="text-center"><h1 className="text-3xl font-bold font-[Syne]">Vos informations</h1></div>
      <div className="text-center"><h1 className="text-3xl font-bold font-[Syne]">Vos designs</h1></div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify drop zone renders correctly**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && npm run dev
```

Expected: Hero left + drop zone right, animated icon, formats, textarea.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: step 1 drop zone with file upload and text paste"
```

---

## Task 5: Extraction API Route

**Files:**
- Create: `src/app/api/extract/route.ts`, `src/lib/prompts.ts`

- [ ] **Step 1: Write extraction prompt**

Create `src/lib/prompts.ts`:

```ts
export const EXTRACTION_PROMPT = `Tu es un expert en extraction de donnees de CV. Analyse le texte suivant et extrais toutes les informations dans le format JSON ci-dessous. Si une information est manquante, utilise une chaine vide "". Pour les tableaux vides, utilise [].

FORMAT JSON ATTENDU:
{
  "firstName": "",
  "lastName": "",
  "title": "",
  "phone": "",
  "email": "",
  "address": "",
  "birthDate": "",
  "profile": "",
  "experiences": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "tasks": []
    }
  ],
  "education": [
    { "degree": "", "school": "", "year": "" }
  ],
  "skills": [],
  "languages": [{ "name": "", "level": "" }],
  "interests": [],
  "certifications": []
}

REGLES:
- Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres
- Dates au format lisible (ex: "Janvier 2020", "2020")
- Tasks: liste de bullet points descriptifs des missions
- Profile: reformule en 2-3 phrases professionnelles si necessaire
- Skills: extrais chaque competence individuellement

CV A ANALYSER:
`;

export const GENERATION_PROMPT = `Tu es un expert en design de CV HTML/CSS. Genere un CV complet en HTML/CSS autonome (pas de fichiers externes) qui est:
- Parfaitement imprimable en A4 (210mm x 297mm)
- Utilise print-color-adjust: exact pour les fonds colores
- Visuellement professionnel et unique
- Responsive dans le conteneur

DONNEES DU CANDIDAT:
{{CV_DATA}}

{{JOB_OFFER_SECTION}}

DIRECTION ARTISTIQUE:
{{STYLE_DIRECTION}}

REGLES:
- Le HTML doit etre COMPLET et autonome (inclure <style> dans le HTML)
- Utilise des Google Fonts via @import dans le <style>
- Le design doit tenir sur UNE page A4
- Couleur d'accent: {{ACCENT_COLOR}}
- Layout: {{LAYOUT_TYPE}}
- Reponds UNIQUEMENT avec le HTML, sans markdown, sans backticks
`;

export const REWRITE_PROMPT = `Tu es un expert en redaction de CV. Reecris le contenu du CV pour matcher l'offre d'emploi ci-dessous.

OFFRE D'EMPLOI:
{{JOB_OFFER}}

CV ACTUEL (JSON):
{{CV_DATA}}

REGLES:
- Reecris le profil pour matcher le poste
- Reordonne les experiences (les plus pertinentes en premier)
- Met en avant les competences qui matchent l'offre
- Adapte le vocabulaire au secteur de l'offre
- Ne change PAS les faits (dates, noms d'entreprises)
- Reponds UNIQUEMENT avec le JSON modifie, meme format que l'entree
`;
```

- [ ] **Step 2: Build extraction API route**

Create `src/app/api/extract/route.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { EXTRACTION_PROMPT } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    let text = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      text = body.text;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (file.type === "application/pdf") {
        // For PDF: send as document to Claude
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: base64 },
                },
                { type: "text", text: EXTRACTION_PROMPT },
              ],
            },
          ],
        });

        const content = response.content[0];
        if (content.type === "text") {
          return NextResponse.json(JSON.parse(content.text));
        }
      } else if (file.type.startsWith("image/")) {
        // For images: send as image to Claude
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: mediaType, data: base64 },
                },
                { type: "text", text: EXTRACTION_PROMPT },
              ],
            },
          ],
        });

        const content = response.content[0];
        if (content.type === "text") {
          return NextResponse.json(JSON.parse(content.text));
        }
      } else {
        // For text files (docx treated as text)
        text = await file.text();
      }
    }

    if (text) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          { role: "user", content: EXTRACTION_PROMPT + text },
        ],
      });

      const content = response.content[0];
      if (content.type === "text") {
        return NextResponse.json(JSON.parse(content.text));
      }
    }

    return NextResponse.json({ error: "No content to extract" }, { status: 400 });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Test with curl (text input)**

```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Hanafi Benameur, Agent de securite, 14 ans experience, Tel: 07 77 07 69 24, Ne le 08/03/1987. Competences: surveillance, controle acces, maitre-chien."}'
```

Expected: JSON with firstName, lastName, skills, etc.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: extraction API route with Claude (PDF, image, text)"
```

---

## Task 6: Analyse Overlay

**Files:**
- Create: `src/components/AnalyseOverlay.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build AnalyseOverlay component**

Create `src/components/AnalyseOverlay.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useCVStore } from "@/hooks/useCVStore";

const CHECKS = [
  "Identite et contact",
  "Experiences professionnelles",
  "Formations et diplomes",
  "Competences et langues",
  "Centres d'interet",
];

export default function AnalyseOverlay() {
  const { state } = useCVStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!state.isExtracting) {
      setProgress(0);
      return;
    }
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(step);
      if (step >= CHECKS.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [state.isExtracting]);

  if (!state.isExtracting) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-bg/92 backdrop-blur-[30px] flex items-center justify-center transition-opacity">
      <div className="flex items-center gap-16 max-w-[800px] w-full">
        {/* Document scan visual */}
        <div className="w-[220px] shrink-0 relative">
          <div className="w-[180px] h-[240px] bg-white rounded-lg mx-auto relative shadow-2xl overflow-hidden">
            {/* Scan beam */}
            <div className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-acc/25 to-transparent border-b border-acc animate-[scanDown_2.5s_ease-in-out_infinite]" />
            {/* Document bars */}
            <div className="p-5 space-y-1.5">
              <div className="h-[5px] bg-gray-800 rounded w-full mb-2" />
              <div className="h-1 bg-acc rounded w-2/5 mb-3" />
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`h-[3px] bg-gray-200 rounded ${i % 3 === 2 ? "w-3/5" : "w-full"} ${i === 3 || i === 6 ? "mt-3 h-[5px] bg-gray-800 !w-2/5" : ""}`} />
              ))}
            </div>
          </div>
          {/* Particles */}
          <div className="absolute right-[-30px] top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
            {["nom: Benameur", "exp: 14 ans", "skill: securite", "tel: 07 77..."].map((p, i) => (
              <div
                key={p}
                className="bg-acc/15 border border-acc-s rounded-md px-2.5 py-1 text-[9px] font-mono text-acc whitespace-nowrap animate-[flyOut_2s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="flex-1">
          <h2 className="font-[Syne] text-2xl font-bold mb-1.5">Extraction en cours...</h2>
          <p className="text-tx2 text-sm mb-7">L&apos;IA analyse votre document</p>
          <div className="space-y-1">
            {CHECKS.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card border border-brd text-sm font-medium transition-all ${
                  i < progress ? "text-tx" : i === progress ? "text-tx2" : "text-tx3"
                }`}
              >
                <div className={`w-[22px] h-[22px] rounded-full grid place-items-center text-[11px] shrink-0 ${
                  i < progress
                    ? "bg-grn/12 text-grn"
                    : i === progress
                    ? "border-2 border-brd border-t-acc animate-spin"
                    : "border-[1.5px] border-brd"
                }`}>
                  {i < progress ? "✓" : ""}
                </div>
                {label}
              </div>
            ))}
          </div>
          <div className="mt-6 h-[3px] bg-brd rounded-full overflow-hidden">
            <div
              className="h-full bg-acc rounded-full transition-all duration-500"
              style={{ width: `${(progress / CHECKS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add keyframe animations to globals.css**

Append to `src/app/globals.css`:

```css
@keyframes scanDown {
  0% { top: -40px; }
  100% { top: 250px; }
}

@keyframes flyOut {
  0% { opacity: 0; transform: translateX(-10px); }
  30% { opacity: 1; transform: translateX(10px); }
  70% { opacity: 1; transform: translateX(10px); }
  100% { opacity: 0; transform: translateX(40px); }
}
```

- [ ] **Step 3: Add AnalyseOverlay to page.tsx**

Add `<AnalyseOverlay />` inside `<AppShell>` (before children).

- [ ] **Step 4: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: analyse overlay with document scan animation"
```

---

## Task 7: Step 2 — Data Review + Job Offer

**Files:**
- Create: `src/components/StepAjustez.tsx`, `src/components/SummaryCards.tsx`, `src/components/EditModal.tsx`, `src/components/JobOfferInput.tsx`

- [ ] **Step 1: Build SummaryCards component**

Create `src/components/SummaryCards.tsx` — displays CV data in a compact grid (identity, profile, skills, experiences). Each card is read-only with a global "Modifier" button.

- [ ] **Step 2: Build EditModal component**

Create `src/components/EditModal.tsx` — full-screen modal with editable fields for all CV data. Opens on "Modifier" click.

- [ ] **Step 3: Build JobOfferInput component**

Create `src/components/JobOfferInput.tsx` — the right-column card with textarea for pasting a job offer. Includes the "Recommande" badge and hint text.

- [ ] **Step 4: Build StepAjustez — assembles the 3-column x 2-row grid**

Create `src/components/StepAjustez.tsx`:

```tsx
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

  if (!state.cvData) return null;

  const handleGenerate = () => {
    dispatch({ type: "SET_GENERATING", value: true });
    dispatch({ type: "SET_STEP", step: 2 as Step });
    // Generation will be triggered in StepChoisissez
  };

  return (
    <div className="w-full h-full flex flex-col px-2.5">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="font-[Syne] text-[22px] font-bold">Vos informations</h2>
          <span className="text-tx3 text-xs">Extrait par l&apos;IA — verifiez d&apos;un coup d&apos;oeil</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditOpen(true)} className="text-[11px] text-acc px-3 py-1.5 rounded-md bg-acc/7 border border-acc/15 hover:bg-acc/15 transition-all">
            Modifier
          </button>
          <button onClick={handleGenerate} className="flex items-center gap-2 px-5 py-2.5 bg-bg-up border border-brd rounded-xl text-sm font-medium hover:border-brd-h transition-all">
            Passer
          </button>
          <button onClick={handleGenerate} className="flex items-center gap-2 px-5 py-2.5 bg-acc text-bg rounded-xl text-sm font-semibold hover:-translate-y-px hover:shadow-lg transition-all">
            Generer les designs →
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2.5 min-h-0">
        <SummaryCards cvData={state.cvData} />
        <JobOfferInput
          value={state.jobOffer}
          onChange={(text) => dispatch({ type: "SET_JOB_OFFER", text })}
        />
      </div>

      {editOpen && (
        <EditModal
          cvData={state.cvData}
          onSave={(data) => { dispatch({ type: "SET_CV_DATA", data }); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Wire into page.tsx, verify layout**

- [ ] **Step 6: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: step 2 data review with summary grid + job offer + edit modal"
```

---

## Task 8: MCP Server + CV Generation via Claude Code /frontend-design

**Why MCP + Claude Code instead of raw API calls?**
A basic prompt to Claude API produces generic HTML. Claude Code with /frontend-design applies a complete design skill — unique font pairings, bold spatial composition, print-ready CSS, no "AI slop" aesthetics. This is the product's competitive advantage.

**Files:**
- Create: `mcp-server/package.json`, `mcp-server/tsconfig.json`, `mcp-server/index.ts`, `mcp-server/generate-cv.ts`
- Create: `src/lib/styles.ts`, `src/lib/mcp-client.ts`
- Modify: `src/app/api/generate/route.ts`

- [ ] **Step 1: Init MCP server package**

Create `mcp-server/package.json`:

```json
{
  "name": "cvforge-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

Create `mcp-server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true
  },
  "include": ["*.ts"]
}
```

```bash
cd c:/Users/LAPEYRE/Documents/cvforge/mcp-server && npm install
```

- [ ] **Step 2: Build the MCP server with generate_cv tool**

Create `mcp-server/index.ts`:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateCV } from "./generate-cv.js";

const server = new McpServer({
  name: "cvforge",
  version: "1.0.0",
});

server.tool(
  "generate_cv",
  "Generate a professional CV as complete HTML/CSS using Claude Code with /frontend-design skill. Produces premium, print-ready A4 designs with unique typography, bold layouts, and cohesive aesthetics.",
  {
    cvDataJson: z.string().describe("JSON string of CVData (firstName, lastName, title, experiences, skills, etc.)"),
    styleName: z.string().describe("Design style name: Obsidian, Mineral, Atlantic, Swiss, Vermillon, Emeraude"),
    styleDescription: z.string().describe("Detailed artistic direction for the design"),
    accentColor: z.string().describe("Hex color for accent (e.g. #c9a55a)"),
    layout: z.enum(["single", "double", "sidebar"]).describe("Layout type"),
    jobOffer: z.string().optional().describe("Job offer text to adapt the CV content to"),
  },
  async ({ cvDataJson, styleName, styleDescription, accentColor, layout, jobOffer }) => {
    const html = await generateCV({
      cvDataJson,
      styleName,
      styleDescription,
      accentColor,
      layout,
      jobOffer,
    });
    return { content: [{ type: "text", text: html }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

- [ ] **Step 3: Build the generate-cv function that invokes Claude Code CLI**

Create `mcp-server/generate-cv.ts`:

```ts
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

interface GenerateCVParams {
  cvDataJson: string;
  styleName: string;
  styleDescription: string;
  accentColor: string;
  layout: string;
  jobOffer?: string;
}

export async function generateCV(params: GenerateCVParams): Promise<string> {
  const { cvDataJson, styleName, styleDescription, accentColor, layout, jobOffer } = params;

  const tmpDir = join(process.cwd(), ".tmp");
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const id = randomUUID().slice(0, 8);
  const outputPath = join(tmpDir, `cv-${id}.html`);

  const jobSection = jobOffer
    ? `\n\nOFFRE D'EMPLOI CIBLEE — adapte le vocabulaire, reordonne les experiences, et mets en avant les competences pertinentes:\n${jobOffer}`
    : "";

  const prompt = `
/frontend-design

Genere un CV professionnel complet en UN SEUL fichier HTML autonome (tout le CSS inline dans <style>).

DONNEES DU CANDIDAT:
${cvDataJson}
${jobSection}

DIRECTION ARTISTIQUE — Style "${styleName}":
${styleDescription}

CONTRAINTES TECHNIQUES:
- Couleur d'accent: ${accentColor}
- Layout: ${layout}
- Format A4 (210mm x 297mm), print-ready
- Utilise print-color-adjust: exact et -webkit-print-color-adjust: exact
- Google Fonts via @import dans le <style>
- Le CV doit tenir sur UNE page A4
- Pas de JavaScript, uniquement HTML + CSS
- Pas de placeholder, toutes les donnees du candidat doivent etre presentes

Ecris le fichier HTML complet dans: ${outputPath}
`;

  try {
    await execFileAsync("claude", [
      "--print",
      "--output-format", "text",
      "--max-turns", "1",
      "-p", prompt,
    ], {
      timeout: 120000,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (existsSync(outputPath)) {
      return readFileSync(outputPath, "utf-8");
    }

    throw new Error("CV file not generated");
  } catch (error) {
    console.error(`Generation failed for style ${styleName}:`, error);
    throw error;
  }
}
```

- [ ] **Step 4: Define style directions**

Create `src/lib/styles.ts`:

```ts
export interface StyleDirection {
  name: string;
  tag: string;
  description: string;
  defaultColor: string;
  defaultLayout: "single" | "double" | "sidebar";
}

export const STYLE_DIRECTIONS: StyleDirection[] = [
  {
    name: "Obsidian",
    tag: "dark",
    description: "Design sombre premium avec sidebar. Fond anthracite profond (#0e0e18), texte clair, accent dore. Typo display: Bebas Neue ou Playfair Display pour les titres, Barlow pour le corps. Sidebar gauche sombre avec infos contact et competences en tags. Zone principale claire (#faf9f7). Texture grain subtile. Section titles en uppercase avec lettre-spacing large.",
    defaultColor: "#c9a55a",
    defaultLayout: "sidebar",
  },
  {
    name: "Mineral",
    tag: "clean",
    description: "Design epure editorial sur fond blanc casse. Typo: Cormorant Garamond pour le nom en grande taille, Source Sans Pro pour le corps. Header centre avec nom en capitales tres espacees (letter-spacing: 6px). Ligne de separation fine sous le header. Accent terracotta sur les titres de section seulement. Beaucoup d'espace blanc. Sections clairement delimitees par la typographie.",
    defaultColor: "#e17055",
    defaultLayout: "single",
  },
  {
    name: "Atlantic",
    tag: "split",
    description: "Deux colonnes bicolores contrastees. Colonne gauche (38%) bleu profond (#0a3d62 vers #1e3799 en gradient) avec nom et contact en blanc. Colonne droite blanche avec experiences et profil. Typo: Montserrat bold pour titres, Lato pour corps. Barre de progression doree pour les competences. Dates en monospace discret.",
    defaultColor: "#f6b93b",
    defaultLayout: "double",
  },
  {
    name: "Swiss",
    tag: "minimal",
    description: "Ultra minimaliste typographique inspire du style suisse/international. Fond blanc pur. Nom en 48px font-weight 200 avec letter-spacing 8px. Un seul separateur horizontal noir epais sous le nom. Aucune couleur sauf le noir. Sections delimitees uniquement par la hierarchie typographique. Typo: Outfit extra-light pour le nom, weight 400 pour le corps. Grille rigoureuse.",
    defaultColor: "#222222",
    defaultLayout: "single",
  },
  {
    name: "Vermillon",
    tag: "bold",
    description: "Impact visuel maximal. Header pleine largeur en gradient rouge (#e74c3c → #c0392b) avec nom en blanc extra-bold. Corps blanc en dessous avec sections bien espacees. Typo: Poppins 800 pour le nom, DM Sans pour le corps. Titres de section en rouge avec underline epaisse. Competences en tags rouges sur fond blanc.",
    defaultColor: "#e74c3c",
    defaultLayout: "single",
  },
  {
    name: "Emeraude",
    tag: "nature",
    description: "Elegance naturelle. Fine bande verte emeraude (5px) sur le bord gauche de la page. Fond off-white (#f0f5f0). Typo: Playfair Display italic pour le nom, Nunito pour le corps. Titres de section en vert (#27ae60) discret avec petites lignes decoratives. Icones simples SVG pour contact. Ambiance calme et professionnelle.",
    defaultColor: "#27ae60",
    defaultLayout: "sidebar",
  },
];
```

- [ ] **Step 5: Build MCP client helper**

Create `src/lib/mcp-client.ts`:

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CVData } from "./types";
import type { StyleDirection } from "./styles";

export async function generateCVViaMCP(params: {
  cvData: CVData;
  style: StyleDirection;
  accentColor?: string;
  layout?: string;
  jobOffer?: string;
}): Promise<string> {
  const { cvData, style, accentColor, layout, jobOffer } = params;

  const transport = new StdioClientTransport({
    command: "node",
    args: ["mcp-server/dist/index.js"],
  });

  const client = new Client({ name: "cvforge-app", version: "1.0.0" });
  await client.connect(transport);

  try {
    const result = await client.callTool({
      name: "generate_cv",
      arguments: {
        cvDataJson: JSON.stringify(cvData),
        styleName: style.name,
        styleDescription: style.description,
        accentColor: accentColor || style.defaultColor,
        layout: layout || style.defaultLayout,
        jobOffer: jobOffer || "",
      },
    });

    const textContent = result.content.find((c: any) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No HTML returned from MCP server");
    }
    return textContent.text;
  } finally {
    await client.close();
  }
}
```

- [ ] **Step 6: Build the /api/generate route that uses MCP**

Create `src/app/api/generate/route.ts`:

```ts
import { generateCVViaMCP } from "@/lib/mcp-client";
import { STYLE_DIRECTIONS } from "@/lib/styles";
import { REWRITE_PROMPT } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { CVData } from "@/lib/types";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvData, jobOffer, styleIndex, accentColor, layout } = body as {
      cvData: CVData;
      jobOffer?: string;
      styleIndex: number;
      accentColor?: string;
      layout?: string;
    };

    const style = STYLE_DIRECTIONS[styleIndex % STYLE_DIRECTIONS.length];

    // If job offer provided, rewrite CV content first (via Claude API — fast)
    let finalCVData = cvData;
    if (jobOffer?.trim()) {
      const rewritePrompt = REWRITE_PROMPT
        .replace("{{JOB_OFFER}}", jobOffer)
        .replace("{{CV_DATA}}", JSON.stringify(cvData, null, 2));

      const rewriteRes = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: rewritePrompt }],
      });

      const content = rewriteRes.content[0];
      if (content.type === "text") {
        finalCVData = JSON.parse(content.text);
      }
    }

    // Generate CV HTML via MCP server → Claude Code → /frontend-design
    const html = await generateCVViaMCP({
      cvData: finalCVData,
      style,
      accentColor,
      layout,
      jobOffer: jobOffer?.trim(),
    });

    return NextResponse.json({
      id: `cv-${Date.now()}-${styleIndex}`,
      name: style.name,
      style: style.tag,
      html,
      accentColor: accentColor || style.defaultColor,
      layout: layout || style.defaultLayout,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
```

- [ ] **Step 7: Build and test MCP server**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge/mcp-server && npm run build
```

Test with a manual curl:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"cvData":{"firstName":"Hanafi","lastName":"Benameur","title":"Agent de securite","phone":"07 77 07 69 24","email":"","address":"","birthDate":"08/03/1987","profile":"14 ans d experience","experiences":[],"education":[],"skills":["Surveillance","Rondes"],"languages":[],"interests":[],"certifications":[]},"styleIndex":0}'
```

Expected: JSON with `html` field containing a complete styled HTML CV.

- [ ] **Step 8: Register MCP server in Claude Code settings**

Add to `~/.claude/settings.json` or project `.claude/settings.json`:

```json
{
  "mcpServers": {
    "cvforge": {
      "command": "node",
      "args": ["c:/Users/LAPEYRE/Documents/cvforge/mcp-server/dist/index.js"]
    }
  }
}
```

- [ ] **Step 9: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: MCP server for CV generation via Claude Code /frontend-design"
```

---

## Task 9: Step 3 — Gallery + Preview Panel

**Files:**
- Create: `src/components/StepChoisissez.tsx`, `src/components/DesignGallery.tsx`, `src/components/CVCard.tsx`, `src/components/PreviewPanel.tsx`, `src/components/CustomizeControls.tsx`

- [ ] **Step 1: Build CVCard component**

Create `src/components/CVCard.tsx` — single gallery card with iframe CV preview, hover overlay "Selectionner", footer with name + style tag.

- [ ] **Step 2: Build DesignGallery component**

Create `src/components/DesignGallery.tsx` — filter chips row + 3-column grid of CVCard. Filters: Tous, Sombre, Clair, Minimal, Bold, Creatif. Clicking a card calls `onSelect(id)`.

- [ ] **Step 3: Build CustomizeControls component**

Create `src/components/CustomizeControls.tsx`:

```tsx
"use client";

const COLORS = [
  "#c9a55a", "#5b8def", "#e74c3c", "#27ae60",
  "#9b59b6", "#e67e22", "#1abc9c", "#2c3e50",
];

const LAYOUTS = [
  { value: "single" as const, label: "1 col", icon: "M4,3 h16 v18 h-16z" },
  { value: "double" as const, label: "2 col", icon: "M3,3 h8 v18 h-8z M13,3 h8 v18 h-8z" },
  { value: "sidebar" as const, label: "Sidebar", icon: "M3,3 h6 v18 h-6z M11,3 h10 v18 h-10z" },
];

interface CustomizeControlsProps {
  accentColor: string;
  layout: "single" | "double" | "sidebar";
  onColorChange: (color: string) => void;
  onLayoutChange: (layout: "single" | "double" | "sidebar") => void;
}

export default function CustomizeControls({ accentColor, layout, onColorChange, onLayoutChange }: CustomizeControlsProps) {
  return (
    <div className="bg-bg-card border border-brd rounded-xl p-3.5 shrink-0">
      <div className="text-[9px] uppercase tracking-[2px] text-tx3 font-semibold mb-2">Couleur d&apos;accent</div>
      <div className="flex gap-1.5 mb-3">
        {COLORS.map((c) => (
          <div
            key={c}
            onClick={() => onColorChange(c)}
            className={`w-[22px] h-[22px] rounded-full cursor-pointer transition-all hover:scale-115 ${
              c === accentColor ? "border-2 border-tx scale-115" : "border-2 border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="text-[9px] uppercase tracking-[2px] text-tx3 font-semibold mb-2">Mise en page</div>
      <div className="flex gap-1.5 mb-3">
        {LAYOUTS.map((l) => (
          <div
            key={l.value}
            onClick={() => onLayoutChange(l.value)}
            className={`flex-1 py-1.5 rounded-md bg-bg-in grid place-items-center cursor-pointer transition-all border-[1.5px] ${
              l.value === layout ? "border-acc" : "border-brd hover:border-brd-h"
            }`}
          >
            <svg className="w-5 h-5 stroke-tx2" fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d={l.icon} />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-tx2">
        <span>Photo</span>
        <div className="w-9 h-5 rounded-full bg-brd cursor-pointer relative transition-colors" onClick={(e) => e.currentTarget.classList.toggle("!bg-acc")}>
          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build PreviewPanel component**

Create `src/components/PreviewPanel.tsx` — right panel with: iframe preview of selected CV, name + "+ Similaire" button, CustomizeControls, pricing options, download button.

- [ ] **Step 5: Build StepChoisissez — assembles gallery + preview panel**

Create `src/components/StepChoisissez.tsx` — triggers generation on mount (calls `/api/generate` for each of the 6 styles in parallel), displays DesignGallery on the left, PreviewPanel on the right (slides in on selection).

- [ ] **Step 6: Wire into page.tsx, test full flow**

- [ ] **Step 7: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: step 3 gallery with filters, preview panel, customization controls"
```

---

## Task 10: PDF Download API

**Files:**
- Create: `src/app/api/download/route.ts`

- [ ] **Step 1: Build download route**

Create `src/app/api/download/route.ts`:

```ts
import puppeteer from "puppeteer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cv-cvforge.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add download handler in PreviewPanel**

In `PreviewPanel.tsx`, add a function that calls `/api/download` with the selected CV's HTML and triggers a browser download of the returned PDF blob.

- [ ] **Step 3: Test PDF download locally**

- [ ] **Step 4: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: PDF download via Puppeteer"
```

---

## Task 11: Stripe Checkout

**Files:**
- Create: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Build checkout route**

Create `src/app/api/checkout/route.ts`:

```ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, string> = {
  single: process.env.STRIPE_PRICE_SINGLE!,
  pack: process.env.STRIPE_PRICE_PACK!,
  unlimited: process.env.STRIPE_PRICE_UNLIMITED!,
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const priceId = PRICE_MAP[plan];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan === "unlimited" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/?paid=true`,
      cancel_url: `${request.nextUrl.origin}/?paid=false`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Wire checkout into PreviewPanel download button**

In `PreviewPanel.tsx`: clicking "Telecharger" first calls `/api/checkout`, redirects to Stripe. On return with `?paid=true`, auto-trigger the PDF download.

- [ ] **Step 3: Commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: Stripe checkout integration"
```

---

## Task 12: Polish + Final Integration

- [ ] **Step 1: Test full flow end-to-end** — Drop CV → Extract → Review → Generate → Preview → Customize → Download
- [ ] **Step 2: Fix any Tailwind class issues** (ensure CSS variables work with Tailwind v4 syntax)
- [ ] **Step 3: Add loading states** — spinner on generate button, skeleton cards in gallery while generating
- [ ] **Step 4: Add error handling** — toast/alert if extraction or generation fails
- [ ] **Step 5: Test print quality** — open generated HTML in browser, Ctrl+P, verify A4 rendering
- [ ] **Step 6: Final commit**

```bash
cd c:/Users/LAPEYRE/Documents/cvforge && git add -A && git commit -m "feat: CVForge v1 complete - polish and integration"
```
