import { NextResponse } from "next/server";

import { getCurrentViewer, requireApiAccess } from "@/lib/access";
import { isDemoMode } from "@/lib/env";
import { getRequestKey, RateLimitError, enforceRateLimit } from "@/lib/rate-limit";
import { createResolutionAttempt } from "@/lib/services/attempts";
import { resolutionAttemptInputSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await enforceRateLimit({
      key: getRequestKey(request),
      scope: "resolution_attempt_api",
      limit: 20,
      windowMinutes: 15
    });

    const { id } = await context.params;
    const body = await request.json();
    const parsed = resolutionAttemptInputSchema.safeParse({
      ...body,
      issueId: id
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const viewer = await getCurrentViewer().catch(() => null);
    const actor = viewer
      ? await requireApiAccess(["contributor", "reviewer", "admin"])
      : isDemoMode
        ? { id: "usr_contrib_1" }
        : null;

    if (!actor) {
      return NextResponse.json({ error: "Authentication required to submit an attempt." }, { status: 401 });
    }

    const attempt = await createResolutionAttempt({
      ...parsed.data,
      submitterUserId: actor.id
    });
    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Attempt submission failed." },
      { status: 400 },
    );
  }
}
