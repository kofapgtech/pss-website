"use client";

import { useActionState } from "react";
import { submitLeadAction, type LeadFormState } from "@/lib/actions/leads";
import { buttonVariants } from "@/components/ui/button";

const initialState: LeadFormState = { success: false, error: "" };

export function NewsletterForm({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const [state, formAction, pending] = useActionState(submitLeadAction, initialState);

  const inputClasses =
    tone === "dark"
      ? "bg-inverse-on-surface/10 border-surface-variant/40 text-surface-bright placeholder:text-surface-variant"
      : "bg-surface-container-low border-outline-variant text-on-surface placeholder:text-on-surface-variant";

  if (state.success) {
    return (
      <p className={`text-sm font-semibold ${tone === "dark" ? "text-surface-bright" : "text-on-background"}`}>
        Thanks for joining the list — welcome to the porch. 🎉
      </p>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input type="hidden" name="type" value="newsletter" />
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="Enter your email"
          className={`w-full rounded-full border px-5 py-3 text-sm focus-ring ${inputClasses}`}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonVariants("primary", "md")}>
        {pending ? "Joining…" : "Join"}
      </button>
      {state.error && <p className="text-sm font-semibold text-error sm:basis-full">{state.error}</p>}
    </form>
  );
}
