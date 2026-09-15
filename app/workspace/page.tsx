import Link from "next/link";
import { redirect } from "next/navigation";
import { readSessionFromCookies } from "@/lib/auth-session";
import { LanguageSelector } from "@/components/language-selector";

export const dynamic = "force-dynamic";

export default async function WorkspaceRoute() {
  const session = await readSessionFromCookies();

  if (!session) {
    redirect("/auth?returnTo=%2Fworkspace");
  }

  return (
    <main className="workspace-protected-shell">
      <LanguageSelector />
      <div className="workspace-protected-card">
        <h1>Protected workspace</h1>
        <p>Your authenticated NyayaPath workspace is ready to load after provider configuration.</p>
        <p>
          This project is currently using the secure session foundation, and the actual
          provider-backed authentication flow is configured separately by environment settings.
        </p>
        <div className="workspace-actions">
          <Link href="/auth">Back to authentication</Link>
          <Link href="/">Public landing page</Link>
        </div>
      </div>
    </main>
  );
}
