import type { CVData } from "./types";

/**
 * Renders a CV template by replacing placeholder markers with real data.
 * No AI needed — pure string replacement. Instant.
 *
 * Markers format: {{fieldName}}
 * Special markers:
 *   {{experiences}} — replaced by generated HTML for each experience
 *   {{skills}} — replaced by generated HTML for each skill
 *   {{education}} — replaced by generated HTML for each education
 *   {{languages}} — replaced by generated HTML for each language
 *   {{interests}} — replaced by generated HTML for each interest
 */

export function renderTemplate(templateHtml: string, data: CVData, accentColor?: string): string {
  let html = templateHtml;

  // Replace simple fields
  const simpleFields: Record<string, string> = {
    "{{firstName}}": data.firstName || "",
    "{{lastName}}": data.lastName || "",
    "{{firstNameUpper}}": (data.firstName || "").toUpperCase(),
    "{{lastNameUpper}}": (data.lastName || "").toUpperCase(),
    "{{fullName}}": `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    "{{fullNameUpper}}": `${data.firstName || ""} ${data.lastName || ""}`.trim().toUpperCase(),
    "{{title}}": data.title || "",
    "{{phone}}": data.phone || "",
    "{{email}}": data.email || "",
    "{{address}}": data.address || "",
    "{{birthDate}}": data.birthDate || "",
    "{{profile}}": data.profile || "",
  };

  for (const [marker, value] of Object.entries(simpleFields)) {
    html = html.replaceAll(marker, value);
  }

  // Replace accent color
  if (accentColor) {
    // Replace CSS variable
    html = html.replace(/--accent:\s*#[0-9a-fA-F]{3,8}/g, `--accent:${accentColor}`);
    html = html.replace(/--accent-light:\s*#[0-9a-fA-F]{3,8}/g, `--accent-light:${lightenHex(accentColor, 30)}`);
  }

  // Replace experience blocks
  if (html.includes("{{#experiences}}")) {
    const expTemplate = extractBlock(html, "{{#experiences}}", "{{/experiences}}");
    if (expTemplate) {
      const expHtml = (data.experiences || []).map((exp) => {
        let block = expTemplate;
        block = block.replaceAll("{{exp.title}}", exp.title || "");
        block = block.replaceAll("{{exp.company}}", exp.company || "");
        block = block.replaceAll("{{exp.location}}", exp.location || "");
        block = block.replaceAll("{{exp.startDate}}", exp.startDate || "");
        block = block.replaceAll("{{exp.endDate}}", exp.endDate || "Present");
        block = block.replaceAll("{{exp.description}}", exp.description || "");
        // Tasks
        if (block.includes("{{#exp.tasks}}")) {
          const taskTemplate = extractBlock(block, "{{#exp.tasks}}", "{{/exp.tasks}}");
          if (taskTemplate) {
            const tasksHtml = (exp.tasks || []).map((t) => taskTemplate.replaceAll("{{task}}", t)).join("\n");
            block = replaceBlock(block, "{{#exp.tasks}}", "{{/exp.tasks}}", tasksHtml);
          }
        }
        return block;
      }).join("\n");
      html = replaceBlock(html, "{{#experiences}}", "{{/experiences}}", expHtml);
    }
  }

  // Replace skills
  if (html.includes("{{#skills}}")) {
    const skillTemplate = extractBlock(html, "{{#skills}}", "{{/skills}}");
    if (skillTemplate) {
      const skillsHtml = (data.skills || []).map((s) => skillTemplate.replaceAll("{{skill}}", s)).join("\n");
      html = replaceBlock(html, "{{#skills}}", "{{/skills}}", skillsHtml);
    }
  }

  // Replace education
  if (html.includes("{{#education}}")) {
    const eduTemplate = extractBlock(html, "{{#education}}", "{{/education}}");
    if (eduTemplate) {
      const eduHtml = (data.education || []).map((e) => {
        let block = eduTemplate;
        block = block.replaceAll("{{edu.degree}}", e.degree || "");
        block = block.replaceAll("{{edu.school}}", e.school || "");
        block = block.replaceAll("{{edu.year}}", e.year || "");
        return block;
      }).join("\n");
      html = replaceBlock(html, "{{#education}}", "{{/education}}", eduHtml);
    }
  }

  // Replace languages
  if (html.includes("{{#languages}}")) {
    const langTemplate = extractBlock(html, "{{#languages}}", "{{/languages}}");
    if (langTemplate) {
      const langHtml = (data.languages || []).map((l) => {
        let block = langTemplate;
        block = block.replaceAll("{{lang.name}}", l.name || "");
        block = block.replaceAll("{{lang.level}}", l.level || "");
        return block;
      }).join("\n");
      html = replaceBlock(html, "{{#languages}}", "{{/languages}}", langHtml);
    }
  }

  // Replace interests
  if (html.includes("{{#interests}}")) {
    const intTemplate = extractBlock(html, "{{#interests}}", "{{/interests}}");
    if (intTemplate) {
      const intHtml = (data.interests || []).map((i) => intTemplate.replaceAll("{{interest}}", i)).join("\n");
      html = replaceBlock(html, "{{#interests}}", "{{/interests}}", intHtml);
    }
  }

  return html;
}

function extractBlock(html: string, startTag: string, endTag: string): string | null {
  const startIdx = html.indexOf(startTag);
  const endIdx = html.indexOf(endTag);
  if (startIdx < 0 || endIdx < 0) return null;
  return html.slice(startIdx + startTag.length, endIdx);
}

function replaceBlock(html: string, startTag: string, endTag: string, replacement: string): string {
  const startIdx = html.indexOf(startTag);
  const endIdx = html.indexOf(endTag);
  if (startIdx < 0 || endIdx < 0) return html;
  return html.slice(0, startIdx) + replacement + html.slice(endIdx + endTag.length);
}

function lightenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
