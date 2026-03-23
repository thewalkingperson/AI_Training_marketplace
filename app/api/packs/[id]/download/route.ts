import { NextResponse } from "next/server";

import { ApiAccessError, requireApiAccess } from "@/lib/access";
import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { mockSnapshot } from "@/lib/mock-data";

interface PackDownloadRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, context: PackDownloadRouteContext) {
  try {
    const viewer = await requireApiAccess(["sponsor", "reviewer", "admin"]);
    const { id } = await context.params;

    if (isDemoMode) {
      const pack = mockSnapshot.packs.find((item) => item.id === id);
      if (!pack) {
        return NextResponse.json({ error: "Pack not found" }, { status: 404 });
      }

      if (viewer.role === "sponsor" && pack.buyerId !== viewer.id) {
        return NextResponse.json({ error: "Pack not found" }, { status: 404 });
      }

      return new NextResponse(JSON.stringify(pack.exportManifest, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${id}.json"`
        }
      });
    }

    const pack = await prisma.casePack.findUnique({
      where: {
        id
      }
    });

    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (viewer.role === "sponsor" && pack.buyerId !== viewer.id) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    return new NextResponse(JSON.stringify(pack.exportManifest, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${id}.json"`
      }
    });
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pack download failed" },
      { status: 400 },
    );
  }
}
