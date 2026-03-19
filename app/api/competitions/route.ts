import { NextResponse } from "next/server";

import { createCompetition } from "@/lib/services/competitions";
import { competitionInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
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
    status: "active"
  });

  return NextResponse.json({ competition }, { status: 201 });
}
