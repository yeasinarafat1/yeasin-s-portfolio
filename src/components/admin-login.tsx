"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await loginAdmin(password);
      if (!result.ok) {
        setError(result.error ?? "Sign-in failed. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the sign-in service. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <a className="admin-brand-mark admin-login-mark" href="/" aria-label="Back to portfolio">Y<span>.</span></a>
        <p className="admin-eyebrow">PORTFOLIO STUDIO</p>
        <h1>Welcome back</h1>
        <p className="admin-login-copy">Sign in to manage your portfolio content.</p>
        {configured ? (
          <form onSubmit={submit}>
            <label className="admin-field" htmlFor="admin-password"><span>Admin password</span>
              <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <p className="admin-login-error" role="alert">{error}</p>}
            <button className="admin-button admin-button--primary admin-login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</button>
          </form>
        ) : (
          <p className="admin-login-error" role="alert">Admin sign-in is not configured. Add ADMIN_PASSWORD and a 32 character ADMIN_SESSION_SECRET to your local environment file.</p>
        )}
        <a className="admin-login-back" href="/">← Back to portfolio</a>
      </section>
    </main>
  );
}
