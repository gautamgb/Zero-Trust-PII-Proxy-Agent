# Zero-Trust PII Proxy Agent

A small Next.js demo that sends text through a **PII proxy**: a fast LLM sanitizes input (replaces PII with placeholders), a heavy LLM processes only the sanitized text, and the response is unmasked before returning. All state is in-memory for the request; no database.

## Features

- Input text area and "Run proxy" button
- Proxy log (steps: sanitize, send to heavy model, unmask)
- Output (unmasked) from the heavy model

## Setup

1. Clone and install:

   ```bash
   cd Zero-Trust-PII-Proxy-Agent
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set your OpenAI API key:

   ```bash
   cp .env.example .env.local
   # Edit .env.local: OPENAI_API_KEY=sk-...
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), paste text with PII, and click "Run proxy".

## Deploy (e.g. Vercel)

- Push to GitHub and import the project in Vercel.
- Add `OPENAI_API_KEY` in Project Settings → Environment Variables.
- Optionally set `FAST_MODEL` and `HEAVY_MODEL`.

## Publish as a public repo

1. Create a new **public** repo on GitHub (e.g. `zero-trust-pii-proxy-agent`). Do not add a README or .gitignore.
2. From this directory: `git remote add origin https://github.com/gautamgb/Zero-Trust-PII-Proxy-Agent.git` then `git push -u origin main`.
3. Optionally add a description and topics on the repo page.

## Tech

- Next.js 16 (App Router)
- OpenAI API (fast model for sanitize, heavy for main task)
- Tailwind CSS
