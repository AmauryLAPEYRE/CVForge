"use client";

import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      {/* Step 0: Deposez */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 48, fontWeight: 800 }}>
          Deposez. <span style={{ color: 'var(--color-acc)' }}>On fait le reste.</span>
        </h1>
      </div>

      {/* Step 1: Ajustez */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700 }}>Vos informations</h1>
      </div>

      {/* Step 2: Choisissez */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700 }}>Vos designs</h1>
      </div>
    </AppShell>
  );
}
