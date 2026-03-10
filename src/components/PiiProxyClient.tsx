"use client";

import { useCallback, useState } from "react";

export function PiiProxyClient({ apiPath = "/api/demo/pii-proxy" }: { apiPath?: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setOutput("");
    setLog([]);
    setLoading(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLog(Array.isArray(data.log) ? data.log : []);
        throw new Error(data?.error ?? `Request failed: ${res.status}`);
      }
      setOutput(typeof data.text === "string" ? data.text : "");
      setLog(Array.isArray(data.log) ? data.log : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [input, loading, apiPath]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <label htmlFor="pii-input" className="mb-2 block text-sm font-medium text-neutral-700">
          Input text (may contain PII)
        </label>
        <textarea
          id="pii-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text with names, emails, etc. The proxy will sanitize before sending to the heavy LLM, then unmask the response."
          className="mb-4 w-full min-h-[120px] rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={loading || !input.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Running proxy..." : "Run proxy"}
        </button>
      </div>

      {(log.length > 0 || output || error) && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-neutral-800">Proxy log</h3>
          <pre className="mb-4 max-h-32 overflow-y-auto rounded bg-neutral-100 px-3 py-2 text-xs text-neutral-700">
            {log.join("\n") || "(no log)"}
          </pre>
          {output ? (
            <>
              <h3 className="mb-2 text-sm font-semibold text-neutral-800">Output (unmasked)</h3>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 whitespace-pre-wrap">
                {output}
              </div>
            </>
          ) : null}
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
