import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { companyResearchTool } from "./tools.js";

// The LLM the agent will use, with our tool attached
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.5-flash",
  temperature: 0.3,
});

const tools = [companyResearchTool];
const llmWithTools = llm.bindTools(tools);
const toolNode = new ToolNode(tools);

const SYSTEM_PROMPT = `You are an investment research analyst AI.

Given a company name, your job is to:
1. Use the company_research tool to gather information. Call it multiple times with different "focus" values to cover: recent news, financial performance, competitors, and risks.
2. Once you have enough information (usually 3-4 tool calls), analyze it and make a clear investment decision.

Your final answer MUST be structured exactly like this:

DECISION: [INVEST or PASS]
CONFIDENCE: [Low / Medium / High]
REASONING:
- [key point 1]
- [key point 2]
- [key point 3]
SOURCES:
- [list the URLs you used]

Be objective and base your decision only on the information you gathered. Do not make up facts.`;

// Decides whether the agent should keep calling tools or stop and answer
function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
}

// The node that calls the LLM
async function callModel(state) {
  const messages = state.messages;
  const response = await llmWithTools.invoke(messages);
  return { messages: [response] };
}

// Build the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    [END]: END,
  })
  .addEdge("tools", "agent");

export const investmentAgent = workflow.compile();

/**
 * Runs the agent on a given company name and returns the final
 * text response (the structured DECISION / REASONING output).
 */
export async function runInvestmentResearch(companyName) {
  const result = await investmentAgent.invoke({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Research this company and decide whether to invest: ${companyName}` },
    ],
  });

  const lastMessage = result.messages[result.messages.length - 1];
  return lastMessage.content;
}
