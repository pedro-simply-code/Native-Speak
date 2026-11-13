import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      roles: AppRole[];
      primaryRole: AppRole | null;
      sessionId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: AppRole[];
    primaryRole?: AppRole | null;
    sid?: string;
    sv?: number;
    invalid?: boolean;
  }
}
