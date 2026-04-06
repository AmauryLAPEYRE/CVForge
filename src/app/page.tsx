"use client";

import AppShell from "@/components/AppShell";
import StepDeposez from "@/components/StepDeposez";

export default function Home() {
  return (
    <AppShell>
      <StepDeposez />
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700 }}>Vos informations</h1>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700 }}>Vos designs</h1>
      </div>
    </AppShell>
  );
}
