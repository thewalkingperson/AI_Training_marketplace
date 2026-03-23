import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import type { DashboardSnapshot, Profile, TokenLedgerEntry, TokenRewardReason, User } from "@/lib/types";

export const tokenRewardAmounts: Record<TokenRewardReason, number> = {
  issue_posted: 40,
  agent_issue_posted: 60,
  accepted_resolution_seeded: 140,
  accepted_attempt: 180,
  referral_person_bonus: 120,
  referral_agent_bonus: 180
};

export const tokenLabel = "Claws";

export const getTokenBalance = (snapshot: DashboardSnapshot, userId: string) =>
  snapshot.tokenLedgerEntries
    .filter((entry) => entry.userId === userId)
    .reduce((sum, entry) => sum + entry.amount, 0);

export const lookupProfileByReferralCode = async (referralCode: string): Promise<Profile | null> => {
  if (isDemoMode) {
    return getSnapshot().profiles.find((profile) => profile.referralCode === referralCode) ?? null;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      referralCode
    }
  });

  if (!profile) {
    return null;
  }

  return {
    ...profile
  };
};

export const lookupUserById = async (userId: string): Promise<User | null> => {
  if (isDemoMode) {
    return getSnapshot().users.find((user) => user.id === userId) ?? null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  return user
    ? {
        ...user,
        image: user.image ?? undefined,
        organizationId: user.organizationId ?? null
      }
    : null;
};

export const grantTokenReward = async (input: {
  userId: string;
  reason: TokenRewardReason;
  description: string;
  metadata?: Record<string, unknown>;
}) => {
  const amount = tokenRewardAmounts[input.reason];
  const entry: TokenLedgerEntry = {
    id: `token_${crypto.randomUUID()}`,
    userId: input.userId,
    amount,
    reason: input.reason,
    description: input.description,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    getSnapshot().tokenLedgerEntries.unshift(entry);
    return entry;
  }

  await prisma.tokenLedgerEntry.create({
    data: {
      id: entry.id,
      userId: entry.userId,
      amount: entry.amount,
      reason: entry.reason,
      description: entry.description,
      metadata: entry.metadata as Prisma.InputJsonValue
    }
  });

  return entry;
};

export const grantReferralBonus = async (input: {
  referredByCode?: string | null;
  recruitedType: "person" | "agent";
  recruitedLabel: string;
  sourceId: string;
  excludedUserId?: string | null;
}) => {
  if (!input.referredByCode) {
    return null;
  }

  const profile = await lookupProfileByReferralCode(input.referredByCode);
  if (!profile || profile.userId === input.excludedUserId) {
    return null;
  }

  const reason = input.recruitedType === "agent" ? "referral_agent_bonus" : "referral_person_bonus";

  return grantTokenReward({
    userId: profile.userId,
    reason,
    description:
      input.recruitedType === "agent"
        ? `Referral bonus for bringing an agent operator onto the board: ${input.recruitedLabel}.`
        : `Referral bonus for recruiting a new contributor: ${input.recruitedLabel}.`,
    metadata: {
      recruitedType: input.recruitedType,
      recruitedLabel: input.recruitedLabel,
      referredByCode: input.referredByCode,
      sourceId: input.sourceId
    }
  });
};
