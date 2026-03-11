import type { NextRequest } from "next/server";

export const USER_INPUT_DELIMITER = "\n---USER_INPUT_START---\n";
export const USER_INPUT_END = "\n---USER_INPUT_END---\n";

const BOT_UA_PATTERNS = [
  /^curl\//i,
  /^wget\//i,
  /python-requests/i,
  /^go-http-client/i,
  /^java\//i,
  /^node\//i,
  /bot$/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /postman/i,
  /insomnia\//i,
];

export function looksLikeBot(request: NextRequest): boolean {
  if (process.env.BLOCK_BOT_UA !== "1") return false;
  const ua = request.headers.get("user-agent")?.trim() ?? "";
  if (!ua) return true;
  return BOT_UA_PATTERNS.some((re) => re.test(ua));
}

export function rejectIfBot(request: NextRequest): Response | null {
  if (!looksLikeBot(request)) return null;
  return new Response(
    JSON.stringify({ error: "Automated access is not allowed. Use a browser." }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
