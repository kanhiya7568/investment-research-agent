import { runInvestmentResearch } from "@/lib/agent";

// Handles POST requests to /api/research
export async function POST(request) {
  try {
    const body = await request.json();
    const { companyName } = body;

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return Response.json(
        { error: "Please provide a valid company name." },
        { status: 400 }
      );
    }

    const result = await runInvestmentResearch(companyName.trim());

    return Response.json({ result });
  } catch (err) {
    console.error("API /research error:", err);
    return Response.json(
      { error: "Something went wrong while researching this company. Please try again." },
      { status: 500 }
    );
  }
}
