import { NextResponse } from "next/server";

import { ApiAccessError, requireApiAccess } from "@/lib/access";
import { getRecommendationForCase } from "@/lib/services/pricing";

interface PricingRouteContext {
  params: Promise<{
    caseId: string;
  }>;
}

export async function GET(_: Request, context: PricingRouteContext) {
  try {
    await requireApiAccess();
    const { caseId } = await context.params;
    const recommendation = await getRecommendationForCase(caseId);

    if (!recommendation) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ recommendation });
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pricing lookup failed" },
      { status: 400 },
    );
  }
}
