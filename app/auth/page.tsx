import { AuthClient } from "@/components/auth/auth-client";

type PageProps = {
  searchParams?: Promise<{ returnTo?: string | string[] }> | { returnTo?: string | string[] };
};

export default async function AuthPage({ searchParams }: PageProps) {
  const params = (await Promise.resolve(searchParams ?? {})) as { returnTo?: string | string[] };
  const rawReturnTo = params.returnTo;
  const returnTo = Array.isArray(rawReturnTo) ? rawReturnTo[0] : rawReturnTo ?? "/workspace";

  return <AuthClient returnTo={returnTo} />;
}
