import { PiiProxyClient } from "@/components/PiiProxyClient";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Zero-Trust PII Proxy Agent</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Paste text that may contain PII. A fast LLM sanitizes it (placeholders), a heavy LLM processes the sanitized text, then the response is unmasked. All in one request; no persistence.
      </p>
      <PiiProxyClient apiPath="/api/demo/pii-proxy" />
    </main>
  );
}
