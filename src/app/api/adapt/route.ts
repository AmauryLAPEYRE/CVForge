import { runClaude, parseJsonResponse } from "@/lib/claude";
import { REWRITE_PROMPT } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";
import type { CVData } from "@/lib/types";

const VALIDATION_PROMPT = `Analyse le texte suivant et determine s'il s'agit d'une offre d'emploi ou d'une annonce de recrutement.
Reponds UNIQUEMENT avec un JSON: {"isJobOffer": true} ou {"isJobOffer": false, "reason": "explication courte"}
Pas de backticks, pas de texte avant ou apres.

Texte a analyser:
`;

// Detect if input is a URL and fetch its content
async function resolveJobOffer(input: string): Promise<string> {
  const trimmed = input.trim();

  // Check if it's a URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const res = await fetch(trimmed, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "fr-FR,fr;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch URL: ${res.status}`);
      }

      const html = await res.text();

      // Extract text content — strip HTML tags, scripts, styles
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#\d+;/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000); // Limit to avoid too long prompts

      if (textContent.length < 50) {
        throw new Error("Page content too short — might be blocked");
      }

      return textContent;
    } catch (err) {
      console.error("URL fetch failed:", err);
      throw new Error("Impossible de lire cette URL. Essayez de copier-coller le texte de l'offre directement.");
    }
  }

  // Not a URL — return as-is
  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const { cvData, jobOffer } = await request.json() as {
      cvData: CVData;
      jobOffer: string;
    };

    if (!jobOffer?.trim()) {
      return NextResponse.json(cvData);
    }

    // Step 1: Resolve URL to text if needed
    let offerText: string;
    try {
      offerText = await resolveJobOffer(jobOffer);
    } catch (err) {
      return NextResponse.json({
        error: "url_fetch_failed",
        reason: err instanceof Error ? err.message : "Impossible de lire cette URL.",
      }, { status: 400 });
    }

    // Step 2: Validate that it's a real job offer
    const validationResult = await runClaude(VALIDATION_PROMPT + offerText.slice(0, 1000));
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

    // Step 3: Adapt CV to the job offer
    const prompt = REWRITE_PROMPT
      .replace("{{JOB_OFFER}}", offerText)
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
