/**
 * Parses the agent's structured text output into an object the UI can render.
 *
 * Expected input format (from the agent's SYSTEM_PROMPT):
 * DECISION: INVEST
 * CONFIDENCE: High
 * REASONING:
 * - point 1
 * - point 2
 * SOURCES:
 * - url1
 * - url2
 */
export function parseAgentResult(text) {
  const decisionMatch = text.match(/DECISION:\s*(INVEST|PASS)/i);
  const confidenceMatch = text.match(/CONFIDENCE:\s*(Low|Medium|High)/i);

  const reasoningMatch = text.match(/REASONING:([\s\S]*?)SOURCES:/i);
  const sourcesMatch = text.match(/SOURCES:([\s\S]*)$/i);

  const reasoning = reasoningMatch
    ? reasoningMatch[1]
        .split("\n")
        .map((line) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  const sources = sourcesMatch
    ? sourcesMatch[1]
        .split("\n")
        .map((line) => line.replace(/^[-*]\s*/, "").trim())
        .filter((line) => line.startsWith("http"))
    : [];

  return {
    decision: decisionMatch ? decisionMatch[1].toUpperCase() : "UNKNOWN",
    confidence: confidenceMatch ? confidenceMatch[1] : "Unknown",
    reasoning,
    sources,
    raw: text,
  };
}
