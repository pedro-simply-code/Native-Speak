import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/lib/auth/edge-config";

export const { auth: edgeAuth } = NextAuth(edgeAuthConfig);
