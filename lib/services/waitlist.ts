import { prisma } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { sendInviteEmail, sendWaitlistNotification } from "@/lib/email";
import { mockSnapshot } from "@/lib/mock-data";
import { logInfo } from "@/lib/observability";
import type { Invite, UserRole, WaitlistEntry, WaitlistUserType } from "@/lib/types";

interface CreateWaitlistInput {
  email: string;
  userType: WaitlistUserType;
  githubHandle?: string | null;
  company?: string | null;
  agentName?: string | null;
  agentFramework?: string | null;
  operatorName?: string | null;
  notes?: string | null;
}

interface ApproveWaitlistInput {
  entryId: string;
  role: UserRole;
  createdBy: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const mapEntry = (entry: {
  id: string;
  email: string;
  userType: WaitlistEntry["userType"];
  githubHandle: string | null;
  company: string | null;
  agentName: string | null;
  agentFramework: string | null;
  operatorName: string | null;
  notes: string | null;
  status: WaitlistEntry["status"];
  invitedRole: WaitlistEntry["invitedRole"];
  createdAt: Date;
  updatedAt: Date;
}): WaitlistEntry => ({
  id: entry.id,
  email: entry.email,
  userType: entry.userType,
  githubHandle: entry.githubHandle,
  company: entry.company,
  agentName: entry.agentName,
  agentFramework: entry.agentFramework,
  operatorName: entry.operatorName,
  notes: entry.notes,
  status: entry.status,
  invitedRole: entry.invitedRole ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString()
});

const mapInvite = (invite: {
  id: string;
  email: string;
  role: Invite["role"];
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
}): Invite => ({
  id: invite.id,
  email: invite.email,
  role: invite.role,
  token: invite.token,
  expiresAt: invite.expiresAt.toISOString(),
  acceptedAt: invite.acceptedAt?.toISOString() ?? null,
  createdBy: invite.createdBy,
  createdAt: invite.createdAt.toISOString()
});

export const createWaitlistEntry = async (input: CreateWaitlistInput) => {
  const email = normalizeEmail(input.email);

  if (isDemoMode) {
    const duplicate = mockSnapshot.waitlistEntries.find((entry) => entry.email === email);
    const existingInvite = mockSnapshot.invites.find((invite) => invite.email === email);
    const existingUser = mockSnapshot.users.find((user) => user.email === email);

    if (duplicate || existingInvite || existingUser?.accessState === "active") {
      throw new Error("That email is already on the waitlist.");
    }

    const entry: WaitlistEntry = {
      id: `wait_${crypto.randomUUID()}`,
      email,
      userType: input.userType,
      githubHandle: input.githubHandle ?? null,
      company: input.company ?? null,
      agentName: input.agentName ?? null,
      agentFramework: input.agentFramework ?? null,
      operatorName: input.operatorName ?? null,
      notes: input.notes ?? null,
      status: "pending",
      invitedRole: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockSnapshot.waitlistEntries.unshift(entry);
    await sendWaitlistNotification(input);
    return entry;
  }

  const existing = await prisma.waitlistEntry.findUnique({
    where: {
      email
    }
  });
  const existingInvite = await prisma.invite.findFirst({
    where: {
      email
    }
  });
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existing || existingInvite || existingUser?.accessState === "active") {
    throw new Error("That email is already on the waitlist.");
  }

  const entry = await prisma.waitlistEntry.create({
    data: {
      email,
      userType: input.userType,
      githubHandle: input.githubHandle ?? null,
      company: input.company ?? null,
      agentName: input.agentName ?? null,
      agentFramework: input.agentFramework ?? null,
      operatorName: input.operatorName ?? null,
      notes: input.notes ?? null
    }
  });

  await sendWaitlistNotification({
    email,
    userType: input.userType,
    githubHandle: input.githubHandle ?? null,
    company: input.company ?? null,
    agentName: input.agentName ?? null,
    agentFramework: input.agentFramework ?? null,
    operatorName: input.operatorName ?? null
  });

  return mapEntry(entry);
};

export const approveWaitlistEntry = async ({ entryId, role, createdBy }: ApproveWaitlistInput) => {
  const token = crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  if (isDemoMode) {
    const entry = mockSnapshot.waitlistEntries.find((item) => item.id === entryId);
    if (!entry) {
      throw new Error("Waitlist entry not found.");
    }

    entry.status = "invited";
    entry.invitedRole = role;
    entry.updatedAt = new Date().toISOString();

    const invite: Invite = {
      id: `invite_${crypto.randomUUID()}`,
      email: entry.email,
      role,
      token,
      expiresAt: expiresAt.toISOString(),
      acceptedAt: null,
      createdBy,
      createdAt: new Date().toISOString()
    };

    mockSnapshot.invites.unshift(invite);
    await sendInviteEmail({
      email: invite.email,
      role,
      inviteUrl: `${env.appUrl}/invite/${invite.token}`
    });

    return {
      entry,
      invite
    };
  }

  const entry = await prisma.waitlistEntry.findUnique({
    where: {
      id: entryId
    }
  });

  if (!entry) {
    throw new Error("Waitlist entry not found.");
  }

  const updatedEntry = await prisma.waitlistEntry.update({
    where: {
      id: entry.id
    },
    data: {
      status: "invited",
      invitedRole: role
    }
  });

  const invite = await prisma.invite.create({
    data: {
      email: updatedEntry.email,
      role,
      token,
      expiresAt,
      createdBy
    }
  });

  await sendInviteEmail({
    email: invite.email,
    role,
    inviteUrl: `${env.appUrl}/invite/${invite.token}`
  });

  logInfo("waitlist_invite_created", {
    entryId,
    inviteId: invite.id,
    role
  });

  return {
    entry: mapEntry(updatedEntry),
    invite: mapInvite(invite)
  };
};

export const resendInvite = async (inviteId: string) => {
  if (isDemoMode) {
    const invite = mockSnapshot.invites.find((item) => item.id === inviteId);
    if (!invite) {
      throw new Error("Invite not found.");
    }

    await sendInviteEmail({
      email: invite.email,
      role: invite.role,
      inviteUrl: `${env.appUrl}/invite/${invite.token}`
    });

    return invite;
  }

  const invite = await prisma.invite.findUnique({
    where: {
      id: inviteId
    }
  });

  if (!invite) {
    throw new Error("Invite not found.");
  }

  await sendInviteEmail({
    email: invite.email,
    role: invite.role,
    inviteUrl: `${env.appUrl}/invite/${invite.token}`
  });

  return mapInvite(invite);
};

export const getInvitePreview = async (token: string) => {
  if (isDemoMode) {
    return mockSnapshot.invites.find((invite) => invite.token === token) ?? null;
  }

  const invite = await prisma.invite.findUnique({
    where: {
      token
    }
  });

  return invite ? mapInvite(invite) : null;
};
