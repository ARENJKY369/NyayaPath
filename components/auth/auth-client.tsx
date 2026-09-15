"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/language-selector";

type AuthClientProps = {
  returnTo: string;
};

export function AuthClient({ returnTo }: AuthClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const safeReturnTo = useMemo(() => {
    if (!returnTo || returnTo.startsWith("//")) return "/workspace";
    return returnTo.startsWith("/") ? returnTo : "/workspace";
  }, [returnTo]);

  async function submitEmailForm() {
    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: isRegister ? "register" : "email-login",
          email,
          password,
          fullName,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to sign in.");
      }

      router.push(safeReturnTo);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPhoneForm() {
    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "phone-login",
          phone,
          otp,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to verify phone number.");
      }

      if (payload.ok) {
        router.push(safeReturnTo);
        router.refresh();
        return;
      }

      setStatus(payload.message ?? "Verification code sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to verify phone number.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "magic-link", email }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to send the magic link.");
      }

      setStatus(payload.message ?? "Magic link sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send the magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "demo-login" }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to sign in with demo account.");
      }

      router.push(safeReturnTo);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-brand">
            <div className="brand-mark">☰</div>
            <span>NyayaPath</span>
          </div>

          <div className="auth-kicker">CLARITY. BEFORE YOU COMMIT.</div>
          <h1>Know what your document means.</h1>
          <p>
            Understand important clauses, compare wording, and prepare your next step with
            source-linked document checks.
          </p>

          <div className="auth-pills">
            <span>Private by design</span>
            <span>Simple explanations</span>
            <span>Your control</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-topbar">
            <LanguageSelector />
          </div>

          <div className="auth-card">
            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p>Sign in to access your private NyayaPath workspace.</p>

            <div className="auth-switcher" role="tablist" aria-label="Authentication method">
              <button
                type="button"
                className={mode === "phone" ? "active" : ""}
                onClick={() => setMode("phone")}
              >
                Phone number
              </button>
              <button
                type="button"
                className={mode === "email" ? "active" : ""}
                onClick={() => setMode("email")}
              >
                Email
              </button>
            </div>

            <div className="auth-form">
              {mode === "phone" ? (
                <>
                  <label className="field-label">
                    Mobile number
                    <div className="phone-row">
                      <select aria-label="Country code" defaultValue="+91">
                        <option value="+91">+91</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        aria-label="Mobile number"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                    </div>
                  </label>

                  <label className="field-label">
                    Verification code
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                    />
                  </label>

                  <button type="button" className="primary-button" onClick={submitPhoneForm} disabled={loading}>
                    {loading ? "Verifying..." : phone && otp ? "Sign in with code" : "Send verification code"}
                  </button>
                </>
              ) : (
                <>
                  {isRegister ? (
                    <label className="field-label">
                      Full name
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </label>
                  ) : null}

                  <label className="field-label">
                    Email address
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    Password
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </label>

                  <button type="button" className="primary-button" onClick={submitEmailForm} disabled={loading}>
                    {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
                  </button>

                  <button type="button" className="secondary-button" onClick={handleMagicLink} disabled={loading || !email}>
                    Send magic link
                  </button>
                </>
              )}

              <div className="auth-divider">OR CONTINUE WITH</div>

              <div className="oauth-grid">
                <button type="button" className="oauth-button" onClick={handleDemoLogin} disabled={loading}>
                  <span className="oauth-mark">D</span>
                  Demo account
                </button>
              </div>

              <button type="button" className="secondary-button" onClick={() => setIsRegister((value) => !value)}>
                {isRegister ? "Already have an account? Sign in" : "Create a new account"}
              </button>

              <div className="privacy-box">
                <ShieldCheck size={18} />
                <span>
                  Your information stays under your control. Choose private session mode or save your history.
                </span>
              </div>

              {status ? <p className="auth-status">{status}</p> : null}

              <div className="auth-footer-note">
                By continuing, you agree to our Terms and Privacy Policy.
                <br />
                NyayaPath provides general information, not legal advice.
              </div>

              <Link href={safeReturnTo} className="link-button">
                Continue to protected workspace <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
