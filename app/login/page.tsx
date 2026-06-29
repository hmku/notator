"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured, tryCreateClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Notator</h1>
        <p className="text-sm text-[var(--muted)]">
          Supabase is not configured. You can use the app locally without signing in.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0f1115]"
        >
          Continue locally
        </button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = tryCreateClient();
    if (!supabase) {
      setError("Supabase client unavailable");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Private scratchpad for your music ideas.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            />
          </label>

          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0f1115] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
