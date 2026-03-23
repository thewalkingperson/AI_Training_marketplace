import { notFound } from "next/navigation";

import { requireBetaAccess } from "@/lib/access";
import { isCompetitionsEnabled } from "@/lib/feature-flags";

export default async function CompetitionDetailPage() {
  await requireBetaAccess();

  if (!isCompetitionsEnabled()) {
    notFound();
  }

  notFound();
}
