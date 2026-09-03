import { createHmac } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[\s=-]/g, "");
  let bits = "";
  for (const char of clean) {
    const value = BASE32.indexOf(char);
    if (value < 0) throw new Error("Secret TOTP inválido");
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/** TOTP RFC 6238 (HMAC-SHA1, 30s, 6 dígitos). */
export function generateTotp(secret: string, nowMs = Date.now(), stepSec = 30, digits = 6): string {
  const key = decodeBase32(secret);
  const counter = Math.floor(Math.floor(nowMs / 1000) / stepSec);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 0x1_0000_0000), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  const mod = 10 ** digits;
  return String(code % mod).padStart(digits, "0");
}
