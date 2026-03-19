import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const hasGithubProvider = env.githubId.length > 0 && env.githubSecret.length > 0;

export const authOptions: NextAuthOptions = {
  adapter: env.databaseUrl ? PrismaAdapter(prisma) : undefined,
  secret: env.authSecret,
  session: {
    strategy: env.databaseUrl ? "database" : "jwt"
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
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token?.sub;
      }

      return session;
    }
  },
  pages: {
    signIn: "/"
  }
};
