import type { EligibilityStatus, RightsGrant } from "@/lib/types";

export const hasRequiredRights = (
  rights: RightsGrant,
  requested: Array<keyof RightsGrant>,
) => requested.every((scope) => rights[scope]);

export const resolveEligibility = (allowed: boolean): EligibilityStatus =>
  allowed ? "eligible" : "ineligible";
