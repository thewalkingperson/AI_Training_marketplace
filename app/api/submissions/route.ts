import { NextResponse } from "next/server";

import { isArtifactTypeEnabled } from "@/lib/feature-flags";
import { createSubmission } from "@/lib/services/submissions";
import { submissionInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
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

  const result = createSubmission(parsed.data);
  return NextResponse.json(result, { status: 201 });
}
