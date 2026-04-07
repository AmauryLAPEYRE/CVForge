import { runClaude, parseJsonResponse } from "@/lib/claude";
import { REWRITE_PROMPT } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";
import type { CVData } from "@/lib/types";

const VALIDATION_PROMPT = `Analyse le texte suivant et determine s'il s'agit d'une offre d'emploi ou d'une annonce de recrutement.
Reponds UNIQUEMENT avec un JSON: {"isJobOffer": true} ou {"isJobOffer": false, "reason": "explication courte"}
Pas de backticks, pas de texte avant ou apres.

Texte a analyser:
`;

export async function POST(request: NextRequest) {
  try {
    const { cvData, jobOffer } = await request.json() as {
      cvData: CVData;
      jobOffer: string;
    };

    if (!jobOffer?.trim()) {
      return NextResponse.json(cvData);
    }

    // Step 1: Validate that it's a real job offer
    const validationResult = await runClaude(VALIDATION_PROMPT + jobOffer.slice(0, 500));
    try {
      const validation = parseJsonResponse(validationResult) as { isJobOffer: boolean; reason?: string };
      if (!validation.isJobOffer) {
        return NextResponse.json({
          error: "not_a_job_offer",
          reason: validation.reason || "Le contenu ne semble pas etre une offre d'emploi.",
        }, { status: 400 });
      }
    } catch {
      // If validation parsing fails, continue anyway
    }

    // Step 2: Adapt CV to the job offer
    const prompt = REWRITE_PROMPT
      .replace("{{JOB_OFFER}}", jobOffer)
      .replace("{{CV_DATA}}", JSON.stringify(cvData, null, 2));

    const result = await runClaude(prompt);
    const adapted = parseJsonResponse(result) as CVData;

    return NextResponse.json(adapted);
  } catch (error: unknown) {
    console.error("Adaptation error:", error);
    const message = error instanceof Error ? error.message : "Adaptation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
