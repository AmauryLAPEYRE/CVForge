import { spawn } from "child_process";

/**
 * Run Claude CLI with a prompt via stdin.
 * Used for CV extraction and job offer adaptation.
 * Template rendering does NOT use this — it's pure string replacement.
 */
export function runClaude(prompt: string, model = "claude-haiku-4-5-20251001"): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("claude", [
      "--output-format", "text",
      "--model", model,
      "-p", "-",
    ], {
      shell: true,
      cwd: process.cwd(),
      timeout: 120000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Claude CLI exit code ${code}: ${stderr.slice(0, 300)}`));
    });

    proc.on("error", (err) => reject(new Error(`Claude spawn error: ${err.message}`)));

    proc.stdin.write(prompt);
    proc.stdin.end();
  });
}

/**
 * Parse JSON from Claude's response, handling markdown fences.
 */
export function parseJsonResponse(text: string): unknown {
  let cleaned = text.trim();
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) cleaned = match[1].trim();
  return JSON.parse(cleaned);
}
