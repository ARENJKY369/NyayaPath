import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "nyayapath_session";

export type AuthSession = {
  userId: string;
  email?: string;
  phone?: string;
  issuedAt: number;
  expiresAt: number;
};

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? "development-auth-secret-change-me";
}

function safeEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function safeDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function createSignature(value: string): string {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("hex");
}

function serializeSession(session: AuthSession): string {
  const payload = JSON.stringify(session);
  const encoded = safeEncode(payload);
  const signature = createSignature(encoded);
  return `${encoded}.${signature}`;
}

function deserializeSession(raw: string | undefined): AuthSession | null {
  if (!raw) return null;

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;

  const expected = createSignature(encoded);
  if (!crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex"),
  )) {
    return null;
  }

  try {
    const parsed = JSON.parse(safeDecode(encoded)) as AuthSession;
    if (!parsed.userId || !parsed.expiresAt || parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, email?: string, phone?: string) {
  const cookieStore = await cookies();
  const now = Date.now();
  const session: AuthSession = {
    userId,
    email,
    phone,
    issuedAt: now,
    expiresAt: now + 1000 * 60 * 60 * 24 * 7,
  };

  cookieStore.set(AUTH_COOKIE_NAME, serializeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return session;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function readSessionFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return deserializeSession(value);
}

export async function assertAuthenticatedOrRedirect(returnTo?: string) {
  const session = await readSessionFromCookies();
  if (session) return session;

  const path = returnTo ?? "/workspace";
  redirect(`/auth?returnTo=${encodeURIComponent(path)}`);
}
