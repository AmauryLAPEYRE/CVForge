import { STYLE_DIRECTIONS } from "@/lib/styles";
import { renderTemplate } from "@/lib/cv-renderer";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { CVData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { cvData, styleIndex, accentColor } = await request.json() as {
      cvData: CVData;
      styleIndex: number;
      accentColor?: string;
    };

    const style = STYLE_DIRECTIONS[styleIndex % STYLE_DIRECTIONS.length];
    const color = accentColor || style.defaultColor;

    const templatePath = join(process.cwd(), "public", "templates", style.templateFile);
    if (!existsSync(templatePath)) {
      return NextResponse.json({ error: `Template not found: ${style.templateFile}` }, { status: 500 });
    }

    const templateHtml = readFileSync(templatePath, "utf-8");
    const html = renderTemplate(templateHtml, cvData, color);

    return NextResponse.json({
      id: `cv-${Date.now()}-${styleIndex}`,
      name: style.name,
      style: style.tag,
      html,
      accentColor: color,
      layout: style.defaultLayout,
    });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
