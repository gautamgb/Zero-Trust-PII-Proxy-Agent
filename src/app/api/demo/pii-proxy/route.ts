import { OpenAI } from "openai";
import type { NextRequest } from "next/server";

const FAST_MODEL = process.env.FAST_MODEL ?? "gpt-4o-mini";
const HEAVY_MODEL = process.env.HEAVY_MODEL ?? "gpt-4o";

const SANITIZE_PROMPT = `You are a PII redaction assistant. Given the user's text, identify all PII (names, emails, phone numbers, SSN, credit card numbers, addresses, etc.) and replace each occurrence with a placeholder like [NAME_1], [EMAIL_1], [PHONE_1], [SSN_1], etc. Preserve the rest of the text.

Respond with a JSON object only, no other text, in this exact format:
{"sanitized": "<the text with PII replaced by placeholders>", "mapping": {"[PLACEHOLDER_1]": "<original value>", "[PLACEHOLDER_2]": "<original value>", ...}}

Example: For "Contact Alice at alice@example.com" you return {"sanitized": "Contact [NAME_1] at [EMAIL_1]", "mapping": {"[NAME_1]": "Alice", "[EMAIL_1]": "alice@example.com"}}`;

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const inputText = typeof body?.text === "string" ? body.text.trim() : "";
  if (!inputText) {
    return new Response(
      JSON.stringify({ error: "Missing or empty 'text' in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const log: string[] = [];

  try {
    // 1) Sanitize with fast model
    log.push("Step 1: Sanitizing input with fast model...");
    const sanitizeRes = await openai.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: "system", content: SANITIZE_PROMPT },
        { role: "user", content: inputText },
      ],
      max_tokens: 2000,
    });
    const sanitizeContent = sanitizeRes.choices[0]?.message?.content?.trim() ?? "";
    let sanitized: string;
    let mapping: Record<string, string>;
    try {
      const parsed = JSON.parse(sanitizeContent) as { sanitized?: string; mapping?: Record<string, string> };
      sanitized = typeof parsed.sanitized === "string" ? parsed.sanitized : inputText;
      mapping = typeof parsed.mapping === "object" && parsed.mapping !== null ? parsed.mapping : {};
    } catch {
      sanitized = inputText;
      mapping = {};
    }
    log.push(`Sanitized text length: ${sanitized.length}; placeholders: ${Object.keys(mapping).length}`);

    // 2) Mapping kept in memory (request-scoped)
    // 3) Heavy LLM on sanitized text
    log.push(`Step 2: Sending sanitized text to heavy model (${HEAVY_MODEL})...`);
    const heavyRes = await openai.chat.completions.create({
      model: HEAVY_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Summarize or analyze the following text. Be concise.",
        },
        { role: "user", content: sanitized },
      ],
      max_tokens: 1000,
    });
    let responseText = heavyRes.choices[0]?.message?.content?.trim() ?? "";

    // 4) Unmask
    log.push("Step 3: Unmasking response...");
    for (const [placeholder, value] of Object.entries(mapping)) {
      responseText = responseText.split(placeholder).join(value);
    }
    log.push("Done.");

    return Response.json({ text: responseText, log });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.push(`Error: ${message}`);
    return new Response(
      JSON.stringify({ error: "PII proxy failed: " + message, log }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export function GET() {
  return new Response(null, { status: 405 });
}
