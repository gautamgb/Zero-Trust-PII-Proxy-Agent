# Zero-Trust PII Proxy Agent

A privacy-preserving proxy that sits between your application and your LLM. Sanitizes input, processes only clean text, and unmasks the response — so your LLM never sees real PII.

## Why This Exists

Enterprise AI adoption stalls on compliance. Legal and security teams won't approve LLM integrations if sensitive data flows to third-party models. The usual answer is "just don't send PII" — but that cripples the AI's usefulness. This proxy solves the problem architecturally: a fast LLM identifies and replaces PII with placeholders, the heavy LLM processes only sanitized text, and the proxy unmasks the response before returning it to the user. The heavy model never sees real data. Compliance is preserved. AI capability is preserved.

I built this after repeatedly hitting the same blocker while shipping AI features in regulated enterprise environments — healthcare and financial services teams that wanted AI but couldn't get past data governance review.

## How It Works

```
User Input → [Fast LLM: Detect & Replace PII] → Sanitized Text → [Heavy LLM: Process] → Sanitized Response → [Unmask PII] → Clean Output
```

1. **Sanitize** — A fast model (gpt-4o-mini) scans input, identifies PII, and replaces it with deterministic placeholders
2. **Process** — The heavy model (gpt-4o) receives only sanitized text and generates a response
3. **Unmask** — Placeholders in the response are mapped back to original values

The proxy log shows every step transparently so you can audit the pipeline.

## Key Features

- **Zero-trust architecture** — the processing LLM never sees real PII
- **Transparent proxy logging** — see sanitization, processing, and unmasking steps
- **Deterministic placeholder mapping** — consistent replacement and restoration
- **Configurable models** — swap the fast and heavy models via environment variables
- **Audit-ready** — full pipeline visibility for compliance review

## Getting Started

```bash
git clone https://github.com/gautamgb/Zero-Trust-PII-Proxy-Agent.git
cd Zero-Trust-PII-Proxy-Agent
npm install
cp .env.example .env.local  # Add your OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter text containing PII, and click "Run proxy" to see the sanitization pipeline in action.

## Deploy to Vercel

1. Push to GitHub and import in Vercel
2. Set `OPENAI_API_KEY` in environment variables
3. Optionally configure `FAST_MODEL` and `HEAVY_MODEL`
4. Deploy

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** OpenAI API
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Live Demo

[seekgb.com/pii-proxy](https://www.seekgb.com/pii-proxy)

## License

MIT
