import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { mockSnapshot } from "@/lib/mock-data";

const hasGithubProvider = env.githubId.length > 0 && env.githubSecret.length > 0;
const isAdminEmail = (email?: string | null) =>
  Boolean(email && env.adminEmails.includes(email.toLowerCase()));

const findDemoInvite = (email: string) =>
  mockSnapshot.invites.find((invite) => invite.email.toLowerCase() === email.toLowerCase()) ?? null;

const findDemoUser = (email: string) =>
  mockSnapshot.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;

const hasLiveInvite = async (email: string) =>
  prisma.invite.findFirst({
    where: {
      email,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

const syncAccessProfile = async (input: {
  email: string;
  name?: string | null;
  image?: string | null;
}) => {
  const email = input.email.toLowerCase();

  if (isDemoMode) {
    const demoUser = findDemoUser(email);
    const demoInvite = findDemoInvite(email);
    return {
      userId: demoUser?.id ?? null,
      role: demoUser?.role ?? demoInvite?.role ?? (isAdminEmail(email) ? "admin" : "contributor"),
      accessState:
        demoUser?.accessState ??
        (isAdminEmail(email) ? "active" : "active"),
      organizationId: demoUser?.organizationId ?? null
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });
  const invite = await hasLiveInvite(email);

  const role = isAdminEmail(email)
    ? "admin"
    : invite?.role ?? existingUser?.role ?? "contributor";
  const accessState =
    existingUser?.accessState === "blocked"
      ? "blocked"
      : "active";

  const user = await prisma.user.upsert({
    where: {
      email
    },
    update: {
      name: input.name ?? existingUser?.name ?? email,
      image: input.image ?? existingUser?.image,
      role,
      accessState
    },
    create: {
      id: existingUser?.id ?? crypto.randomUUID(),
      name: input.name ?? email,
      email,
      image: input.image ?? null,
      role,
      accessState
    }
  });

  if (invite && !invite.acceptedAt) {
    await prisma.invite.update({
      where: {
        id: invite.id
      },
      data: {
        acceptedAt: new Date()
      }
    });

    await prisma.waitlistEntry.updateMany({
      where: {
        email
      },
      data: {
        status: "invited",
        invitedRole: role
      }
    });
  }

  return {
    userId: user.id,
    role: user.role,
    accessState: user.accessState,
    organizationId: user.organizationId ?? null
  };
};

export const authOptions: NextAuthOptions = {
  adapter: env.databaseUrl ? PrismaAdapter(prisma) : undefined,
  secret: env.authSecret,
  session: {
    strategy: "jwt"
  },
  providers: hasGithubProvider
    ? [
        GitHub({
          clientId: env.githubId,
          clientSecret: env.githubSecret
        })
      ]
    : [],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();

      if (!email) {
        return "/?auth=sign-in";
      }

      if (isAdminEmail(email)) {
        return true;
      }

      if (isDemoMode) {
        const demoUser = findDemoUser(email);
        if (demoUser?.accessState === "active") {
          return true;
        }

      if (demoUser?.accessState === "blocked") {
        return "/?auth=blocked";
      }

      return true;
    }

      const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (existingUser?.accessState === "blocked") {
        return "/?auth=blocked";
      }

      if (existingUser?.accessState === "active") {
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.toLowerCase();
      if (!email) {
        return token;
      }

      const access = await syncAccessProfile({
        email,
        name: user?.name ?? token.name,
        image:
          (typeof user?.image === "string" ? user.image : null) ??
          (typeof token.picture === "string" ? token.picture : null)
      });

      token.sub = access.userId ?? token.sub;
      token.email = email;
      token.role = access.role;
      token.accessState = access.accessState;
      token.organizationId = access.organizationId;

      return token;
    },
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token?.sub;
        session.user.role = typeof token?.role === "string" ? token.role : "contributor";
        session.user.accessState =
          typeof token?.accessState === "string" ? token.accessState : "waitlisted";
        session.user.organizationId =
          typeof token?.organizationId === "string" ? token.organizationId : null;
      }

      return session;
    }
  },
  pages: {
    signIn: "/"
  }
};
