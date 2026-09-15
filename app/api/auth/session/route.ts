import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, clearSessionCookie, readSessionFromCookies } from "@/lib/auth-session";
import { getUserByEmail, getUserByPhone, emailLogin, phoneTokenLogin, magicLinkLogin, createUser, issueVerificationToken, ensureDemoUser } from "@/lib/auth-service";

export async function GET() {
  const session = await readSessionFromCookies();
  return NextResponse.json({
    authenticated: Boolean(session),
    user: session ? { userId: session.userId, email: session.email, phone: session.phone } : null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const method = typeof body.method === "string" ? body.method : "login";

  if (method === "demo-login") {
    const user = ensureDemoUser();
    await setSessionCookie(user.id, user.email, user.phone);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, phone: user.phone } });
  }

  if (method === "email-login") {
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const user = emailLogin(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setSessionCookie(user.id, user.email, user.phone);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, phone: user.phone } });
  }

  if (method === "register") {
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName : "";

    try {
      const user = createUser({ email, password, fullName });
      await setSessionCookie(user.id, user.email, user.phone);
      return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, phone: user.phone } });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 400 });
    }
  }

  if (method === "phone-login") {
    const phone = typeof body.phone === "string" ? body.phone : "";
    const otp = typeof body.otp === "string" ? body.otp : "";
    const user = getUserByPhone(phone) ?? (phone ? createUser({ phone }) : null);

    if (!user) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const verifiedUser = phoneTokenLogin(phone, otp);
    if (!verifiedUser) {
      const code = issueVerificationToken({ userId: user.id, type: "phone", ttlMs: 10 * 60 * 1000 });
      return NextResponse.json({ ok: false, message: "Verification code sent.", code });
    }

    await setSessionCookie(verifiedUser.id, verifiedUser.email, verifiedUser.phone);
    return NextResponse.json({ ok: true, user: { id: verifiedUser.id, email: verifiedUser.email, phone: verifiedUser.phone } });
  }

  if (method === "magic-link") {
    const email = typeof body.email === "string" ? body.email : "";
    const user = getUserByEmail(email) ?? createUser({ email });
    const token = issueVerificationToken({ userId: user.id, type: "magic_link", ttlMs: 15 * 60 * 1000 });
    return NextResponse.json({ ok: true, message: "Magic link created.", token });
  }

  if (method === "magic-link-confirm") {
    const token = typeof body.token === "string" ? body.token : "";
    const user = magicLinkLogin(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired magic link." }, { status: 401 });
    }

    await setSessionCookie(user.id, user.email, user.phone);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, phone: user.phone } });
  }

  return NextResponse.json({ error: "Unsupported auth method." }, { status: 400 });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
