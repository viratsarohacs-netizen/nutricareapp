import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { practice } from "@/lib/config";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/session";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${practice.name} — ${practice.credential}`,
  description: practice.tagline,
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
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-brand-800/70 flex flex-col sm:flex-row justify-between gap-4">
            <p>
              © {new Date().getFullYear()} {practice.name}. {practice.credential}.
            </p>
            <p>
              {practice.email}
              {practice.phone && !practice.phone.includes("xxx")
                ? ` · ${practice.phone}`
                : ""}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
