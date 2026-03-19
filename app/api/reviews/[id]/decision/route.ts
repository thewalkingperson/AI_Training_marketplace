import { NextResponse } from "next/server";

import { createReviewDecision } from "@/lib/services/reviews";
import { reviewDecisionInputSchema } from "@/lib/validations";

interface ReviewDecisionRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: ReviewDecisionRouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = reviewDecisionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const review = createReviewDecision({
      caseId: id,
      ...parsed.data
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review failed" },
      { status: 404 },
    );
  }
}
