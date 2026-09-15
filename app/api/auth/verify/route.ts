import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserByPhone, issueVerificationToken, verifyAndConsumeToken } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const type = typeof body.type === "string" ? body.type : "email";
  const email = typeof body.email === "string" ? body.email : "";
  const phone = typeof body.phone === "string" ? body.phone : "";

  if (type === "email") {
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const token = issueVerificationToken({ userId: user.id, type: "email", ttlMs: 10 * 60 * 1000 });
    return NextResponse.json({ ok: true, message: "Verification email sent.", token });
  }

  if (type === "phone") {
    const user = getUserByPhone(phone) ?? { id: "demo_phone_user", phone };
    const token = issueVerificationToken({ userId: user.id, type: "phone", ttlMs: 10 * 60 * 1000 });
    return NextResponse.json({ ok: true, message: "Verification code sent.", token });
  }

  if (type === "otp-verify") {
    const userId = typeof body.userId === "string" ? body.userId : "";
    const token = typeof body.token === "string" ? body.token : "";
    const verified = verifyAndConsumeToken({ userId, type: "phone", token });
    return verified
      ? NextResponse.json({ ok: true, verified: true })
      : NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 });
  }

  return NextResponse.json({ error: "Unsupported verification type." }, { status: 400 });
}
