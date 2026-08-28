import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContentFrame } from "@/components/content-frame";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pridesouthside.org"),
  title: {
    default: "Pride South Side — LoveWell",
    template: "%s | Pride South Side",
  },
  description:
    "LoveWell is the digital front porch of Pride South Side: a collective of LGBTQ+ serving and allied organizations bringing health, economic, and cultural resources to the South and Southwest Sides of Chicago.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <SiteHeader />
        <ContentFrame>{children}</ContentFrame>
        <SiteFooter />
      </body>
    </html>
  );
}
