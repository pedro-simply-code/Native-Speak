import { TOTP, Secret } from "otpauth";
import { encryptSecret, decryptSecret } from "@/lib/security/crypto";

const ISSUER = "Native Speak";

export function createTotpSecret() {
  const secret = new Secret({ size: 20 });
  return secret.base32;
}

export function totpForSecret(secretBase32: string) {
  return new TOTP({
    issuer: ISSUER,
    label: "Native Speak",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function verifyTotpCode(secretBase32: string, token: string) {
  const totp = totpForSecret(secretBase32);
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

export function totpUri(secretBase32: string, email: string) {
  const totp = totpForSecret(secretBase32);
  totp.label = email;
  return totp.toString();
}

export function sealTotpSecret(secretBase32: string) {
  return encryptSecret(secretBase32);
}

export function openTotpSecret(enc: string | null | undefined) {
  if (!enc) return null;
  return decryptSecret(enc);
}
