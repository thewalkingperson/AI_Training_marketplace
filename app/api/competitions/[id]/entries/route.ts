import { NextResponse } from "next/server";

import { ApiAccessError, requireApiAccess } from "@/lib/access";
import { isCompetitionsEnabled } from "@/lib/feature-flags";
import { submitCompetitionEntry } from "@/lib/services/competitions";
import { competitionEntryInputSchema } from "@/lib/validations";

interface CompetitionEntryRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: CompetitionEntryRouteContext) {
  if (!isCompetitionsEnabled()) {
    return NextResponse.json(
      { error: "Competitions are disabled for the invite beta." },
      { status: 404 },
    );
  }

  try {
    const viewer = await requireApiAccess();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = competitionEntryInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = submitCompetitionEntry({
      competitionId: id,
      participantId: viewer.id,
      agentConfig: parsed.data.agentConfig
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Competition entry failed" },
      { status: 400 },
    );
  }
}
