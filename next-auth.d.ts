import type { AccessState, UserRole } from "@/lib/types";
import NextAuth, { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string | null;
      role: UserRole;
      accessState: AccessState;
      organizationId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
    accessState?: AccessState;
    organizationId?: string | null;
  }
}

export {};
