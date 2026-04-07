import { EXTRACTION_PROMPT } from "@/lib/prompts";
import { runClaude, parseJsonResponse } from "@/lib/claude";
import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    let prompt = "";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      prompt = EXTRACTION_PROMPT + body.text;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const buffer = Buffer.from(await file.arrayBuffer());

      const tmpDir = join(process.cwd(), ".tmp");
      if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
      const tmpPath = join(tmpDir, `upload-${randomUUID().slice(0, 8)}-${file.name}`);
      writeFileSync(tmpPath, buffer);

      prompt = `${EXTRACTION_PROMPT}\n\nLe fichier se trouve ici: ${tmpPath.replace(/\\/g, "/")}\nLis ce fichier et extrais les donnees.`;

      setTimeout(() => { try { unlinkSync(tmpPath); } catch {} }, 60000);
    }

    if (!prompt) {
      return NextResponse.json({ error: "No content" }, { status: 400 });
    }

    const result = await runClaude(prompt);
    const data = parseJsonResponse(result);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Extraction error:", error);
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
