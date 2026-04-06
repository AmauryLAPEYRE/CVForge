"use client";

import AppShell from "@/components/AppShell";
import StepDeposez from "@/components/StepDeposez";
import StepAjustez from "@/components/StepAjustez";
import StepChoisissez from "@/components/StepChoisissez";

export default function Home() {
  return (
    <AppShell>
      <StepDeposez />
      <StepAjustez />
      <StepChoisissez />
    </AppShell>
  );
}
