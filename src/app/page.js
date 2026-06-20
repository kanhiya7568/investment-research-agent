"use client";

import { useState } from "react";
import { parseAgentResult } from "@/lib/parseResult";

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!companyName.trim()) return;

    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(parseAgentResult(data.result));
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }


  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#F5F3EC] flex flex-col items-center px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12 max-w-xl">
        <p className="font-mono text-xs tracking-[0.2em] text-[#8B8578] uppercase mb-3">
          Research Desk
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl mb-3">
          Investment Research Agent
        </h1>
        <p className="text-[#8B8578] text-sm leading-relaxed">
          Enter a company name. The agent researches recent news, financials,
          competitors, and risks — then renders a call.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex gap-2 mb-12"
      >
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Tesla, Zomato, Infosys"
          disabled={status === "loading"}
          className="flex-1 bg-transparent border border-[#3A3F47] focus:border-[#D4AF6A] outline-none rounded px-4 py-3 text-[#F5F3EC] placeholder-[#5A5F67] font-mono text-sm transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading" || !companyName.trim()}
          className="bg-[#D4AF6A] text-[#0B0E11] font-mono text-sm font-semibold px-6 py-3 rounded hover:bg-[#E0BD7E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? "Researching…" : "Research"}
        </button>
      </form>

      {/* Loading state */}
      {status === "loading" && (
        <div className="text-center text-[#8B8578] font-mono text-sm animate-pulse">
          Gathering filings, news, and competitor data — this takes 20–40s…
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="w-full max-w-md border border-[#B5402F] rounded px-4 py-3 text-[#B5402F] font-mono text-sm">
          {errorMsg}
        </div>
      )}

      {/* Result */}
      {status === "done" && result && (
        <div className="w-full max-w-xl">
          {/* Stamped decision badge */}
          <div className="flex flex-col items-center mb-10">
            <div
              className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center rotate-[-6deg] ${
                result.decision === "INVEST"
                  ? "border-[#1F7A52] text-[#1F7A52]"
                  : result.decision === "PASS"
                  ? "border-[#B5402F] text-[#B5402F]"
                  : "border-[#8B8578] text-[#8B8578]"
              }`}
              style={{ borderStyle: "double" }}
            >
              <span className="font-serif text-xl font-bold tracking-wide">
                {result.decision}
              </span>
            </div>
            <p className="font-mono text-xs text-[#8B8578] uppercase tracking-[0.2em] mt-4">
              Confidence: {result.confidence}
            </p>
            {result.decision === "UNKNOWN" && (
              <p className="font-mono text-xs text-[#B5402F] text-center mt-3 max-w-sm">
                Couldn&apos;t parse a clear decision from the agent&apos;s response. Raw output is below.
              </p>
            )}
          </div>

          {/* Reasoning */}
          <div className="bg-[#F5F3EC] text-[#0B0E11] rounded-lg p-6 sm:p-8 mb-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B8578] mb-4">
              Reasoning
            </h2>
            <ul className="space-y-3">
              {result.reasoning.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-mono text-[#D4AF6A] shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          {result.sources.length > 0 && (
            <div className="border border-[#3A3F47] rounded-lg p-6 sm:p-8">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B8578] mb-4">
                Sources
              </h2>
              <ul className="space-y-2">
                {result.sources.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#8B8578] hover:text-[#D4AF6A] break-all transition-colors"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
