import { redirect } from "next/navigation";
import { readSessionFromCookies } from "@/lib/auth-session";
import { LanguageSelector } from "@/components/language-selector";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await readSessionFromCookies();

  if (!session) {
    redirect("/auth?returnTo=%2Fsettings");
  }

  return (
    <main className="settings-shell">
      <LanguageSelector />
      <h1>Account settings</h1>
      <p>Account settings and security controls will be added after the provider is configured.</p>
    </main>
  );
}
