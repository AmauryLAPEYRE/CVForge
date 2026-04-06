import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
const execFileAsync = promisify(execFile);
const server = new McpServer({
    name: "cvforge",
    version: "1.0.0",
});
server.tool("generate_cv", "Generate a professional CV as complete HTML/CSS using Claude Code with /frontend-design skill.", {
    cvDataJson: z.string().describe("JSON string of CV data"),
    styleName: z.string().describe("Style name (Obsidian, Mineral, etc.)"),
    styleDescription: z.string().describe("Detailed artistic direction"),
    accentColor: z.string().describe("Hex accent color"),
    layout: z.enum(["single", "double", "sidebar"]).describe("Layout type"),
    jobOffer: z.string().optional().describe("Job offer text"),
}, async ({ cvDataJson, styleName, styleDescription, accentColor, layout, jobOffer, }) => {
    const tmpDir = join(process.cwd(), ".tmp");
    if (!existsSync(tmpDir))
        mkdirSync(tmpDir, { recursive: true });
    const id = randomUUID().slice(0, 8);
    const outputPath = join(tmpDir, `cv-${id}.html`);
    const jobSection = jobOffer
        ? `\n\nOFFRE D'EMPLOI CIBLEE — adapte le vocabulaire, reordonne les experiences, mets en avant les competences pertinentes:\n${jobOffer}`
        : "";
    const prompt = `/frontend-design

Genere un CV professionnel complet en UN SEUL fichier HTML autonome (tout le CSS dans une balise <style>).

DONNEES DU CANDIDAT:
${cvDataJson}
${jobSection}

DIRECTION ARTISTIQUE — Style "${styleName}":
${styleDescription}

CONTRAINTES:
- Couleur d'accent: ${accentColor}
- Layout: ${layout}
- Format A4 (210mm x 297mm), print-ready
- print-color-adjust: exact et -webkit-print-color-adjust: exact sur *
- Google Fonts via @import
- Tenir sur UNE page A4
- HTML + CSS seulement, pas de JavaScript
- Toutes les donnees du candidat doivent apparaitre

Ecris le fichier dans: ${outputPath}`;
    try {
        await execFileAsync("claude", ["--print", "--output-format", "text", "--max-turns", "1", "-p", prompt], {
            timeout: 120_000,
            maxBuffer: 1024 * 1024 * 10,
        });
        if (existsSync(outputPath)) {
            const html = readFileSync(outputPath, "utf-8");
            return { content: [{ type: "text", text: html }] };
        }
        throw new Error("CV file was not generated at " + outputPath);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `ERROR: ${message}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
