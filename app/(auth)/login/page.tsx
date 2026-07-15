"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/field";

const DEMO = [
  { label: "Admin", email: "admin@revora.test" },
  { label: "Carrier", email: "james-carter@revora.test" },
  { label: "Customer", email: "customer@revora.test" },
];

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-strong mb-1">Welcome back</h1>
      <p className="text-muted mb-6 text-sm">Log in to your REVORA MOVE account.</p>

      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remember" className="accent-brand" defaultChecked /> Remember me
        </label>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log In"}
        </Button>
      </form>

      <div className="flex items-center justify-between mt-4 text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-brand-dark">Forgot password?</Link>
        <Link href="/register" className="font-medium text-brand-dark hover:underline">Become a partner</Link>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface-soft p-4">
        <p className="text-xs font-semibold text-muted mb-2">Demo logins · password: <code className="text-ink">password123</code></p>
        <div className="flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <span key={d.email} className="text-xs bg-white border border-line rounded-full px-2.5 py-1">
              <span className="font-semibold text-ink">{d.label}:</span>{" "}
              <span className="text-muted">{d.email}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
