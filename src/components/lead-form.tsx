"use client";

import { useActionState } from "react";
import { submitLeadAction, type LeadFormState } from "@/lib/actions/leads";
import { buttonVariants } from "@/components/ui/button";
import type { LeadType } from "@/lib/types";

const initialState: LeadFormState = { success: false, error: "" };

const inputClasses =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-ring";
const labelClasses = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-on-surface-variant";

export function LeadForm({
  type,
  meta,
  metaLabel = "Which service are you interested in?",
  metaOptions,
  showOrganization = false,
  showPhone = false,
  showMessage = true,
  messageLabel = "Tell us more",
  submitLabel = "Submit",
  successMessage = "Thanks — our team will be in touch soon.",
}: {
  type: LeadType;
  meta?: string;
  metaLabel?: string;
  metaOptions?: string[];
  showOrganization?: boolean;
  showPhone?: boolean;
  showMessage?: boolean;
  messageLabel?: string;
  submitLabel?: string;
  successMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(submitLeadAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center">
        <span className="material-symbols-outlined mb-2 text-3xl text-primary">check_circle</span>
        <p className="font-semibold text-on-background">{successMessage}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="type" value={type} />
      {meta && !metaOptions && <input type="hidden" name="meta" value={meta} />}

      {metaOptions && metaOptions.length > 0 && (
        <div>
          <label className={labelClasses} htmlFor="lead-meta">
            {metaLabel}
          </label>
          <select
            id="lead-meta"
            name="meta"
            defaultValue={meta ?? metaOptions[0]}
            className={inputClasses}
          >
            {metaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="lead-name">
            Full name
          </label>
          <input id="lead-name" name="name" required className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="lead-email">
            Email
          </label>
          <input id="lead-email" type="email" name="email" required className={inputClasses} />
        </div>
      </div>

      {(showOrganization || showPhone) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {showOrganization && (
            <div>
              <label className={labelClasses} htmlFor="lead-org">
                Organization
              </label>
              <input id="lead-org" name="organization" className={inputClasses} />
            </div>
          )}
          {showPhone && (
            <div>
              <label className={labelClasses} htmlFor="lead-phone">
                Phone
              </label>
              <input id="lead-phone" name="phone" type="tel" className={inputClasses} />
            </div>
          )}
        </div>
      )}

      {showMessage && (
        <div>
          <label className={labelClasses} htmlFor="lead-message">
            {messageLabel}
          </label>
          <textarea id="lead-message" name="message" rows={4} className={inputClasses} />
        </div>
      )}

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonVariants("primary", "lg")}>
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
