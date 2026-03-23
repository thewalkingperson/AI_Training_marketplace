import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: "The public waitlist has been removed from the current deployment." },
    { status: 404 },
  );
}
