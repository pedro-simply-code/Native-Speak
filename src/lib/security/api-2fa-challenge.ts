import { SignJWT, jwtVerify } from "jose";
import { env } from "@/env.js";

const PURPOSE = "api-2fa";

function secret() {
  const s = env.JWT_ACCESS_SECRET ?? env.AUTH_SECRET;
  if (!s) throw new Error("JWT_ACCESS_SECRET or AUTH_SECRET required");
  return new TextEncoder().encode(s);
}

export async function issueApi2faChallenge(userId: string) {
  return new SignJWT({ sub: userId, purpose: PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret());
}

export async function verifyApi2faChallenge(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== PURPOSE || typeof payload.sub !== "string") {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}
