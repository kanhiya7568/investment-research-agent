import { config } from "dotenv";
config({ path: ".env.local" });

// Dynamic import AFTER dotenv has loaded, so agent.js sees the env vars
const { runInvestmentResearch } = await import("../src/lib/agent.js");

const companyName = process.argv[2] || "Tesla";

console.log(`\nResearching: ${companyName}...\n`);

try {
  const result = await runInvestmentResearch(companyName);
  console.log("=== RESULT ===\n");
  console.log(result);
} catch (err) {
  console.error("Error running agent:", err);
}
