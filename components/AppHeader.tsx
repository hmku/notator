"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { tryCreateClient, isSupabaseConfigured } from "@/lib/supabaseClient";

export function AppHeader({
  title,
  backHref,
  right,
}: {
  title: string;
  backHref?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();

  async function signOut() {
    const supabase = tryCreateClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              Back
            </Link>
          ) : null}
          <h1 className="truncate text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {right}
          {isSupabaseConfigured() ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
