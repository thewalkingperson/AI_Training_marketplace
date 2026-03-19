import { NextResponse } from "next/server";

import { getRecommendationForCase } from "@/lib/services/pricing";

interface PricingRouteContext {
  params: Promise<{
    caseId: string;
  }>;
}

export async function GET(_: Request, context: PricingRouteContext) {
  const { caseId } = await context.params;
  const recommendation = getRecommendationForCase(caseId);

  if (!recommendation) {
    return NextResponse.json(
      { error: "Case not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ recommendation });
}
