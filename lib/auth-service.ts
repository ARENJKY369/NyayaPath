import crypto from "node:crypto";

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  passwordHash?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
};

export type VerificationTokenType = "email" | "phone" | "magic_link" | "totp";

type StoredVerificationToken = {
  id: string;
  userId: string;
  type: VerificationTokenType;
  tokenHash: string;
  expiresAt: number;
  usedAt?: number | null;
  createdAt: number;
};

const userStore = new Map<string, AuthUser>();
const verificationStore = new Map<string, StoredVerificationToken>();

export function getAuthUserPublic(user: AuthUser | null | undefined) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\s+/g, "").replace(/[^\d+]/g, "").trim();
}

export function createId(prefix = "auth") {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

export function createHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password: string) {
  return crypto
    .pbkdf2Sync(password, process.env.AUTH_SECRET ?? "development-auth-secret-change-me", 120000, 32, "sha256")
    .toString("hex");
}

export function verifyPassword(password: string, storedHash: string) {
  return crypto.timingSafeEqual(
    Buffer.from(hashPassword(password), "hex"),
    Buffer.from(storedHash, "hex"),
  );
}

export function createSessionToken() {
  return crypto.randomInt(100000, 999999).toString();
}

export function getUserById(userId: string) {
  return userStore.get(userId) ?? null;
}

export function getUserByEmail(email: string) {
  const value = normalizeEmail(email);
  return [...userStore.values()].find((user) => user.email === value) ?? null;
}

export function getUserByPhone(phone: string) {
  const value = normalizePhone(phone);
  return [...userStore.values()].find((user) => user.phone === value) ?? null;
}

export function upsertUser(user: AuthUser) {
  userStore.set(user.id, user);
  return user;
}

export function createUser(input: {
  email?: string;
  phone?: string;
  fullName?: string;
  password?: string;
}) {
  const email = input.email ? normalizeEmail(input.email) : undefined;
  const phone = input.phone ? normalizePhone(input.phone) : undefined;

  if (email && getUserByEmail(email)) {
    throw new Error("An account with that email already exists.");
  }

  if (phone && getUserByPhone(phone)) {
    throw new Error("An account with that phone number already exists.");
  }

  const user: AuthUser = {
    id: createId("user"),
    email,
    phone,
    fullName: input.fullName?.trim() || undefined,
    passwordHash: input.password ? hashPassword(input.password) : undefined,
    emailVerified: !email,
    phoneVerified: !phone,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  upsertUser(user);
  return user;
}

export function issueVerificationToken(input: {
  userId: string;
  type: VerificationTokenType;
  ttlMs?: number;
}) {
  const token = createSessionToken();
  const expiresAt = Date.now() + (input.ttlMs ?? 10 * 60 * 1000);
  const record: StoredVerificationToken = {
    id: createId("token"),
    userId: input.userId,
    type: input.type,
    tokenHash: createHash(token),
    expiresAt,
    createdAt: Date.now(),
  };

  verificationStore.set(`${input.userId}:${input.type}`, record);
  return token;
}

export function verifyAndConsumeToken(input: {
  userId: string;
  type: VerificationTokenType;
  token: string;
}) {
  const record = verificationStore.get(`${input.userId}:${input.type}`);
  if (!record) return null;

  if (record.expiresAt < Date.now()) {
    verificationStore.delete(`${input.userId}:${input.type}`);
    return null;
  }

  if (record.tokenHash !== createHash(input.token)) {
    return null;
  }

  if (record.usedAt) {
    return null;
  }

  record.usedAt = Date.now();
  verificationStore.set(`${input.userId}:${input.type}`, record);
  return getUserById(record.userId);
}

export function emailLogin(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user || !user.passwordHash) return null;

  if (!verifyPassword(password, user.passwordHash)) return null;

  const updated = { ...user, lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  upsertUser(updated);
  return updated;
}

export function phoneTokenLogin(phone: string, otp: string) {
  const user = getUserByPhone(phone);
  if (!user) return null;

  const record = verificationStore.get(`${user.id}:phone`);
  if (!record) return null;
  if (record.expiresAt < Date.now()) return null;
  if (record.tokenHash !== createHash(otp)) return null;

  const updated = { ...user, phoneVerified: true, lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  upsertUser(updated);
  verificationStore.delete(`${user.id}:phone`);
  return updated;
}

export function magicLinkLogin(token: string) {
  for (const record of verificationStore.values()) {
    if (record.type !== "magic_link") continue;
    if (record.expiresAt < Date.now()) continue;
    if (record.tokenHash !== createHash(token)) continue;

    const user = getUserById(record.userId);
    if (!user) continue;

    const updated = { ...user, emailVerified: true, lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    upsertUser(updated);
    verificationStore.delete(`${user.id}:magic_link`);
    return updated;
  }

  return null;
}

export function ensureDemoUser() {
  const email = "demo@nyayapath.local";
  let user = getUserByEmail(email);
  if (!user) {
    user = createUser({
      email,
      fullName: "Demo User",
      password: "demo-password",
    });
  }
  return user;
}
