"use client";

import AppShell from "@/components/AppShell";
import StepDeposez from "@/components/StepDeposez";
import StepAjustez from "@/components/StepAjustez";

export default function Home() {
  return (
    <AppShell>
      <StepDeposez />
      <StepAjustez />
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 700 }}>Vos designs</h1>
      </div>
    </AppShell>
  );
}
