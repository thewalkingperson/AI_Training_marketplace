import { NextResponse } from "next/server";

import { createDomainBrief } from "@/lib/services/briefs";
import { domainBriefInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = domainBriefInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const brief = createDomainBrief(parsed.data);
  return NextResponse.json({ brief }, { status: 201 });
}
