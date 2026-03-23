import { NextResponse } from "next/server";

import { ApiAccessError, getCurrentViewer, requireApiAccess } from "@/lib/access";
import { isDemoMode } from "@/lib/env";
import { isArtifactTypeEnabled } from "@/lib/feature-flags";
import { getRequestKey, RateLimitError, enforceRateLimit } from "@/lib/rate-limit";
import { createSubmission } from "@/lib/services/submissions";
import { submissionInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    await enforceRateLimit({
      key: getRequestKey(request),
      scope: "submission_api",
      limit: 20,
      windowMinutes: 15
    });

    const body = await request.json();
    const parsed = submissionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!isArtifactTypeEnabled(parsed.data.artifactType)) {
      return NextResponse.json(
        { error: "Only code_repo submissions are enabled in the MVP." },
        { status: 403 },
      );
    }

    const viewer = await getCurrentViewer().catch(() => null);
    const actor = viewer
      ? await requireApiAccess(["contributor", "admin"])
      : isDemoMode
        ? { id: parsed.data.contributorId, role: "contributor" as const }
        : null;

    if (!actor) {
      return NextResponse.json({ error: "Authentication required to post issues." }, { status: 401 });
    }

    const result = await createSubmission({
      ...parsed.data,
      contributorId: actor.id
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 400 },
    );
  }
}
