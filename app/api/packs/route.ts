import { NextResponse } from "next/server";

import { createPack } from "@/lib/services/packs";
import { packInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = packInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = createPack(parsed.data.buyerId, parsed.data.packType, parsed.data.caseIds);
  return NextResponse.json(result, { status: 201 });
}
