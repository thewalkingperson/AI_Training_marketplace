import { NextResponse } from "next/server";

import { ApiAccessError, requireApiAccess } from "@/lib/access";
import { getRequestKey, RateLimitError, enforceRateLimit } from "@/lib/rate-limit";
import { createReviewDecision } from "@/lib/services/reviews";
import { reviewDecisionInputSchema } from "@/lib/validations";

interface ReviewDecisionRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: ReviewDecisionRouteContext) {
  try {
    await enforceRateLimit({
      key: getRequestKey(request),
      scope: "review_api",
      limit: 30,
      windowMinutes: 15
    });

    const viewer = await requireApiAccess(["reviewer", "admin"]);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = reviewDecisionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const review = await createReviewDecision({
      caseId: id,
      reviewerId: viewer.id,
      decision: parsed.data.decision,
      notes: parsed.data.notes,
      rightsApproved: parsed.data.rightsApproved
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review failed" },
      { status: 404 },
    );
  }
}
