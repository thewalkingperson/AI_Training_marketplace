import { NextResponse } from "next/server";

import { submitCompetitionEntry } from "@/lib/services/competitions";
import { competitionEntryInputSchema } from "@/lib/validations";

interface CompetitionEntryRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: CompetitionEntryRouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = competitionEntryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = submitCompetitionEntry({
      competitionId: id,
      ...parsed.data
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Competition entry failed" },
      { status: 400 },
    );
  }
}
