import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: "Sponsor workflows are disabled in the current deployment." },
    { status: 404 },
  );
}
