import { NextResponse } from "next/server";

import { ApiAccessError, requireApiAccess } from "@/lib/access";
import { isCompetitionsEnabled } from "@/lib/feature-flags";
import { createCompetition } from "@/lib/services/competitions";
import { competitionInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  if (!isCompetitionsEnabled()) {
    return NextResponse.json(
      { error: "Competitions are disabled for the invite beta." },
      { status: 404 },
    );
  }

  try {
    const viewer = await requireApiAccess(["sponsor", "admin"]);
    const body = await request.json();
    const parsed = competitionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const competition = createCompetition({
      ...parsed.data,
      buyerId: viewer.id,
      status: "active"
    });

    return NextResponse.json({ competition }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Competition creation failed" },
      { status: 400 },
    );
  }
}
