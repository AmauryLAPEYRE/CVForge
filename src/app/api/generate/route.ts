import { REWRITE_PROMPT } from "@/lib/prompts";
import { STYLE_DIRECTIONS } from "@/lib/styles";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
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

    // Step 1: If job offer provided, rewrite CV via Claude API (fast)
    let finalCVData = cvData;
    if (jobOffer?.trim()) {
      const rewritePrompt = REWRITE_PROMPT.replace(
        "{{JOB_OFFER}}",
        jobOffer
      ).replace("{{CV_DATA}}", JSON.stringify(cvData, null, 2));

      const rewriteRes = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: rewritePrompt }],
      });

      const content = rewriteRes.content[0];
      if (content.type === "text") {
        try {
          finalCVData = JSON.parse(content.text);
        } catch {
          console.error("Failed to parse rewritten CV, using original");
        }
      }
    }

    // Step 2: Generate CV HTML via MCP server
    const transport = new StdioClientTransport({
      command: "node",
      args: [path.join(process.cwd(), "mcp-server", "dist", "index.js")],
    });

    const client = new Client({ name: "cvforge-app", version: "1.0.0" });
    await client.connect(transport);

    try {
      const result = await client.callTool({
        name: "generate_cv",
        arguments: {
          cvDataJson: JSON.stringify(finalCVData, null, 2),
          styleName: style.name,
          styleDescription: style.description,
          accentColor: accentColor || style.defaultColor,
          layout: layout || style.defaultLayout,
          jobOffer: jobOffer?.trim() || "",
        },
      });

      const textContent = (
        result.content as Array<{ type: string; text?: string }>
      ).find((c) => c.type === "text");
      if (!textContent?.text || result.isError) {
        throw new Error(textContent?.text || "No HTML returned");
      }

      return NextResponse.json({
        id: `cv-${Date.now()}-${styleIndex}`,
        name: style.name,
        style: style.tag,
        html: textContent.text,
        accentColor: accentColor || style.defaultColor,
        layout: layout || style.defaultLayout,
      });
    } finally {
      await client.close();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("Generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
