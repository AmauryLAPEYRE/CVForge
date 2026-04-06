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
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          }],
        });

        const content = response.content[0];
        if (content.type === "text") {
          return NextResponse.json(JSON.parse(content.text));
        }
      } else if (file.type.startsWith("image/")) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          }],
        });

        const content = response.content[0];
        if (content.type === "text") {
          return NextResponse.json(JSON.parse(content.text));
        }
      } else {
        // Text-based files (docx as text)
        text = await file.text();
      }
    }

    if (text) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: EXTRACTION_PROMPT + text }],
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
