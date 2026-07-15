import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { practice } from "@/lib/config";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCurrentUser } from "@/lib/session";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const SITE = "https://nutricare-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${practice.name} — ${practice.credential}`,
    template: `%s`,
  },
  description: `${practice.tagline} Online nutrition consultations, personalised Indian meal plans, and ongoing support for weight loss, PCOS, thyroid, and diabetes.`,
  keywords: [
    "dietitian",
    "nutritionist",
    "online diet consultation",
    "weight loss diet plan",
    "PCOS diet",
    "diabetes diet",
    "Indian meal plan",
  ],
  openGraph: {
    type: "website",
    url: SITE,
    siteName: practice.name,
    title: `${practice.name} — ${practice.credential}`,
    description: practice.tagline,
  },
  twitter: {
    card: "summary",
    title: `${practice.name} — ${practice.credential}`,
    description: practice.tagline,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>

        <footer className="mt-24 border-t border-brand-100 bg-cream">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="grid gap-8 sm:grid-cols-3 text-sm">
              <div>
                <p className="font-semibold text-brand-900">🌿 {practice.name}</p>
                <p className="mt-1 text-brand-800/70">{practice.credential}</p>
                <p className="mt-1 text-brand-800/70">{practice.location}</p>
              </div>
              <div>
                <p className="font-semibold text-brand-900">Quick links</p>
                <ul className="mt-1 space-y-1 text-brand-800/70">
                  <li><Link href="/book" className="hover:text-brand-600">Book a session</Link></li>
                  <li><Link href="/#services" className="hover:text-brand-600">Services & pricing</Link></li>
                  <li><Link href="/login" className="hover:text-brand-600">Patient portal</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-900">Legal</p>
                <ul className="mt-1 space-y-1 text-brand-800/70">
                  <li><Link href="/privacy" className="hover:text-brand-600">Privacy policy</Link></li>
                  <li><Link href="/terms" className="hover:text-brand-600">Terms of service</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-brand-600">Medical disclaimer</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-brand-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-brand-800/60">
              <p>© {new Date().getFullYear()} {practice.name}. All rights reserved.</p>
              <p>
                {practice.email}
                {practice.phone && !practice.phone.includes("xxx") ? ` · ${practice.phone}` : ""}
              </p>
            </div>
          </div>
        </footer>

        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
