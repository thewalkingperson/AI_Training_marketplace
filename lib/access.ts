import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { mockSnapshot } from "@/lib/mock-data";
import type { AccessState, User, UserRole } from "@/lib/types";

export class ApiAccessError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiAccessError";
  }
}

const mapViewer = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessState: AccessState;
  image?: string | null;
  organizationId?: string | null;
}): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  accessState: user.accessState,
  image: user.image ?? undefined,
  organizationId: user.organizationId ?? null
});

export const isAdminEmail = (email?: string | null) =>
  Boolean(email && env.adminEmails.includes(email.toLowerCase()));

export const getCurrentViewer = async (): Promise<User | null> => {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!email) {
    return null;
  }

  if (isDemoMode) {
    const sessionUser = session?.user;

    if (sessionUser?.id && sessionUser.role && sessionUser.accessState) {
      return mapViewer({
        id: sessionUser.id,
        name: sessionUser.name ?? email,
        email,
        role: sessionUser.role,
        accessState: sessionUser.accessState,
        image: sessionUser.image ?? null,
        organizationId: sessionUser.organizationId ?? null
      });
    }

    const demoUser = mockSnapshot.users.find((user) => user.email === email) ?? null;
    return demoUser ? mapViewer(demoUser) : null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  return user ? mapViewer(user) : null;
};

export const requireBetaAccess = async (roles?: UserRole[]) => {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/?auth=sign-in");
  }

  if (viewer.accessState === "blocked") {
    redirect("/?auth=blocked");
  }

  if (viewer.accessState !== "active") {
    redirect("/?auth=invite-required");
  }

  if (roles && !roles.includes(viewer.role)) {
    redirect("/?auth=forbidden");
  }

  return viewer;
};

export const requireApiAccess = async (roles?: UserRole[]) => {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    throw new ApiAccessError(401, "Authentication required.");
  }

  if (viewer.accessState === "blocked") {
    throw new ApiAccessError(403, "Your account is blocked.");
  }

  if (viewer.accessState !== "active") {
    throw new ApiAccessError(403, "Invite-required beta access only.");
  }

  if (roles && !roles.includes(viewer.role)) {
    throw new ApiAccessError(403, "You do not have access to this action.");
  }

  return viewer;
};
