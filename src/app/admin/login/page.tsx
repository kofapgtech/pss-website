"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { LogoLockup } from "@/components/logo";

const initialState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-container-low px-4">
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <LogoLockup wordmarkClassName="text-base" />
        </div>
        <h1 className="mb-1 text-center font-heading text-xl font-bold text-on-background">
          Staff Admin
        </h1>
        <p className="mb-6 text-center text-sm text-on-surface-variant">
          Sign in to manage the Directory, PopOuts, WeShop, and Front Porch.
        </p>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Admin password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm focus-ring"
            />
          </div>
          {state?.error && <p className="text-sm font-semibold text-error">{state.error}</p>}
          <button type="submit" disabled={pending} className={`${buttonVariants("primary", "lg")} w-full`}>
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
