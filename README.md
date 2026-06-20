# AI Investment Research Agent

An AI agent that takes a company name, researches it using live web search, and returns a clear INVEST / PASS decision with structured reasoning and sources.

Live demo: https://investment-research-agent-jet.vercel.app/

---

## Overview

Given a company name, the agent:
1. Searches the web (via Tavily) across multiple angles - recent news, financial performance, competitors, and risks
2. Feeds everything it finds to Gemini, which reasons over the gathered evidence
3. Returns a structured decision: DECISION (Invest/Pass), CONFIDENCE (Low/Medium/High), bullet-point REASONING, and the SOURCES it actually used

The agent decides for itself how many searches it needs and what to search for - it isn't a fixed pipeline. This is implemented as a LangGraph agent loop: the model is given a search tool and decides when to call it and when it has enough information to answer.

## How to run it

Requirements: Node.js 22+, a free Google AI Studio API key (aistudio.google.com/apikey), a free Tavily API key (tavily.com).

Steps:
1. Clone and install: git clone https://github.com/kanhiya7568/investment-research-agent.git then cd investment-research-agent then npm install
2. Add your API keys into a file named .env.local with two lines: GOOGLE_API_KEY=your_gemini_api_key and TAVILY_API_KEY=your_tavily_api_key
3. Run: npm run dev

Open http://localhost:3000, type a company name, click Research. A full run takes roughly 20-40 seconds.

Optional - test the agent directly from the terminal: node scripts/test-agent.js "Company Name"

## How it works

Stack: Next.js (frontend + backend in one app), LangGraph.js (agent orchestration), Gemini 3.5 Flash (LLM, via @langchain/google-genai), Tavily (web search).

The flow: the user enters a company name in the React form, which POSTs to /api/research, a Next.js API route. That route runs a LangGraph agent loop: an agent node powered by Gemini decides whether it needs more research or can answer now. If it needs research, it calls the Tavily search tool, gets results back, and loops again. Once it stops calling tools, the final structured text response is parsed into decision, confidence, reasoning list, and sources list, then rendered as the stamped badge UI.

Key files:
- src/lib/tools.js - wraps Tavily's search API as a LangChain tool the agent can call, with a name, description, and input schema
- src/lib/agent.js - defines the LangGraph state graph (agent and tools loop) and the system prompt that shapes the agent's behavior and output format
- src/app/api/research/route.js - the API endpoint the frontend calls
- src/lib/parseResult.js - parses the agent's structured text output into a JS object for the UI
- src/app/page.js - the frontend: form, loading state, and result display

## Key decisions and trade-offs

- Tavily over separate news/financial APIs. Tavily is purpose-built for AI agents and returns clean, summarized search results rather than raw HTML or rate-limited financial endpoints. This keeps the tool surface to one integration instead of three, at the cost of not having precise structured numbers - the agent gets qualitative and reported figures from articles, not a live stock-data feed.
- LangGraph's tool-calling loop instead of a fixed pipeline. The agent itself decides how many searches to run and what to search for, rather than hardcoding a fixed sequence. This is closer to how production agents are actually built and makes the agent's research adaptive to each company.
- Plain JavaScript over TypeScript. Chosen for clarity given the project size and timeline - no large team or long-term maintenance need that would justify the added type-safety overhead.
- Structured text output, parsed with regex, instead of JSON mode. The system prompt forces Gemini into a strict DECISION/CONFIDENCE/REASONING/SOURCES format, parsed client-side. Simpler to implement and debug than configuring strict JSON schema output, at the cost of being slightly more fragile if the model deviates from the format - handled with a graceful UNKNOWN fallback state in the UI rather than crashing.
- Fixed dark theme, no light mode. The visual direction is intentionally styled like a research desk and ledger rather than a generic SaaS dashboard. Skipping light mode was a deliberate scope cut to keep focus on the agent itself.
- No persistence or database. Each research run is stateless - nothing is saved between sessions. For a take-home in this timeframe, this was the right scope.

## Example runs

Tesla:
DECISION: PASS, CONFIDENCE: Medium.
Reasoning: Declining annual revenue (2025: $94.8B, down from $97.7B in 2024); overall EV sales fell for a second consecutive year, down 9%, with Cybertruck sales down 48%. Intense global competition: BYD outsold Tesla in Europe for the first time; US EV market share narrowed to roughly 45-48%. Brand erosion tied to CEO Elon Musk's public conduct, notably in Europe. Regulatory headwinds: NHTSA investigations into self-driving incidents; FSD facing pushback in Sweden.
Sources: macrotrends.net, cnbc.com, cbsnews.com, en.wikipedia.org, investopedia.com, teslarati.com

Zomato:
DECISION: INVEST, CONFIDENCE: High.
Reasoning: Market leadership with 58% share in food delivery; Blinkit leads quick commerce at 46% share. Proven profitability: quarterly net profit grew from Rs 39 crore in March 2025 to Rs 174 crore in March 2026. Strong capitalization via a Rs 8500 crore QIP raise, and leadership alignment with the Blinkit founder now CEO of parent company Eternal.
Sources: economictimes.com, indianexpress.com, groww.in, matrixbcg.com, brineweb.com, linkedin.com

Infosys:
DECISION: INVEST, CONFIDENCE: High.
Reasoning: Crossed $20B revenue in FY2026, with 4.57% YoY USD growth and 13.4% YoY INR growth, roughly 21% stable operating margins, and a debt-free balance sheet. Proactive AI investment via the Topaz suite with over 12000 AI use cases, plus AWS and Cognition partnerships. Resilient market position alongside TCS and Accenture, with the stock rallying roughly 10% on valuation reassessment.
Sources: infosys.com, wallstreetzen.com, businessmodelcanvastemplate.com, economictimes.com

(Full raw output for each is saved in the examples folder.)

## What I would improve with more time

- Structured financial data. Add a dedicated financial API for hard numbers - exact P/E, market cap, revenue trend - as a second tool alongside Tavily's qualitative search.
- Streaming the agent's progress to the UI. Right now the user waits 20-40 seconds with just a loading message. Streaming intermediate steps would make the wait feel transparent.
- Stricter structured output. Move from prompt-engineered text parsing to enforced JSON schema output.
- Caching. Repeated research on the same company currently re-runs the full loop every time; caching recent results would save time and quota.
- Confidence calibration. Right now confidence is self-reported by the LLM with no grounding - a more rigorous version would tie it to something measurable.
- Persistence. Saving past research runs so a user can revisit prior decisions instead of every session being stateless.

## AI usage disclosure

This project was built with AI assistance throughout, as explicitly invited by the assignment. Every part of this codebase was reviewed, tested, and can be explained by me.
