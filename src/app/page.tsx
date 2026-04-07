"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import StepDeposez from "@/components/StepDeposez";
import StepAjustez from "@/components/StepAjustez";
import StepChoisissez from "@/components/StepChoisissez";
import Welcome from "@/components/Welcome";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started && <Welcome onEnter={() => setStarted(true)} />}
      <AppShell>
        <StepDeposez />
        <StepAjustez />
        <StepChoisissez />
      </AppShell>
    </>
  );
}
