import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/env.js";

function keyMaterial() {
  const secret =
    env.AUTH_SECRET ??
    (env.NODE_ENV === "production"
      ? ""
      : "dev-only-auth-secret-min-32-chars-long!");
  return createHash("sha256").update(`${secret}:ns:enc:v1`).digest();
}

export function encryptSecret(plain: string): string {
  const key = keyMaterial();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptSecret(enc: string): string | null {
  try {
    const key = keyMaterial();
    const buf = Buffer.from(enc, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    return null;
  }
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
