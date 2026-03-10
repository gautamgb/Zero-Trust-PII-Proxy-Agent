import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zero-Trust PII Proxy Agent",
  description: "Sanitize PII before sending to a heavy LLM; unmask the response. In-request only; no persistence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
