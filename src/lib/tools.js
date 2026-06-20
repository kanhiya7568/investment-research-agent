import { tavily } from "@tavily/core";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Create a Tavily client using the API key from .env.local
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

/**
 * Calls Tavily's search API to find recent, relevant information
 * about a company. Returns a simplified array of results
 * (title, url, short content snippet) that we can hand to the LLM.
 */
async function searchCompany(query) {
  const response = await tvly.search(query, {
    searchDepth: "advanced", // more thorough search, slightly slower
    maxResults: 5,
  });

  // response.results is an array of { title, url, content, score, ... }
  // We only keep what the LLM actually needs to reason about.
  return response.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
  }));
}

/**
 * Wraps searchCompany as a LangChain "tool" — this gives it a name,
 * description, and input schema so the agent graph can call it
 * in a structured way.
 */
export const companyResearchTool = tool(
  async ({ companyName, focus }) => {
    const query = focus
      ? `${companyName} ${focus}`
      : `${companyName} company overview business news`;

    const results = await searchCompany(query);

    if (results.length === 0) {
      return `No results found for "${query}".`;
    }

    // Format results as readable text for the LLM to read
    return results
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}\n`
      )
      .join("\n");
  },
  {
    name: "company_research",
    description:
      "Searches the web for information about a company. Use this to find recent news, financial performance, business model, competitors, risks, or any other relevant information needed to make an investment decision. Call it multiple times with different 'focus' values to cover different angles (e.g. 'recent news', 'financial performance', 'competitors', 'risks').",
    schema: z.object({
      companyName: z.string().describe("The name of the company to research"),
      focus: z
        .string()
        .optional()
        .describe(
          "Optional: a specific angle to focus the search on, e.g. 'recent financial results', 'competitors', 'leadership changes', 'risks and controversies'"
        ),
    }),
  }
);
