import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "portfolio_admin";
const SESSION_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;

export function adminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);
}

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPassword(password: unknown) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  return typeof password === "string" && Boolean(expectedPassword) && constantTimeEqual(password, expectedPassword!);
}

export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ expiresAt: Date.now() + SESSION_LENGTH_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token?: string) {
  if (!token || !adminAuthConfigured()) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  try {
    if (!constantTimeEqual(signature, sign(payload))) return false;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { expiresAt?: unknown };
    return typeof session.expiresAt === "number" && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}
