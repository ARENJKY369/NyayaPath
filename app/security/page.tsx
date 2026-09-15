import { redirect } from "next/navigation";
import { readSessionFromCookies } from "@/lib/auth-session";
import { LanguageSelector } from "@/components/language-selector";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await readSessionFromCookies();

  if (!session) {
    redirect("/auth?returnTo=%2Fsecurity");
  }

  return (
    <main className="security-shell">
      <LanguageSelector />
      <h1>Security settings</h1>
      <p>Two-factor authentication, recovery codes, and session management will be added here.</p>
    </main>
  );
}
