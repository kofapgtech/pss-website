import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-on-background">Privacy Policy</h1>
      <div className="prose mt-8 flex flex-col gap-4 text-on-surface-variant">
        <p>
          Information you submit through Pride South Side and LoveWell forms — including
          newsletter sign-ups, partner inquiries, directory upgrade requests, and vendor
          applications — is used only to respond to your request and to keep you informed about
          Pride South Side and LoveWell programming. We do not sell or share your contact
          information with third parties.
        </p>
        <p>
          Event participants are notified that their photo or likeness may be captured at Pride
          South Side events and used as part of event promotion.
        </p>
        <p>
          Pride South Side is a fiscal program of the Center on Halsted. Questions about this
          policy or your data can be sent to{" "}
          <a href="mailto:hello@pridesouthside.org" className="font-semibold text-primary">
            hello@pridesouthside.org
          </a>
          .
        </p>
      </div>
    </Section>
  );
}
