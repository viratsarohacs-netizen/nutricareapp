"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { practice } from "@/lib/config";
import type { SafeUser } from "@/lib/types";

export function SiteHeader({ user }: { user: SafeUser | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-cream/80 border-b border-brand-100">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand-800">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-500 text-white text-lg">
            🌿
          </span>
          <span className="leading-tight">
            {practice.name}
            <span className="block text-[11px] font-normal text-brand-600/70">
              {practice.credential}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/#services"
            className="hidden sm:inline px-3 py-2 rounded-lg hover:bg-brand-100 text-brand-800"
          >
            Services
          </Link>
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="px-3 py-2 rounded-lg hover:bg-brand-100 text-brand-800"
              >
                {user.role === "admin" ? "Admin" : "My portal"}
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg hover:bg-brand-100 text-brand-800"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 rounded-lg hover:bg-brand-100 text-brand-800"
            >
              Log in
            </Link>
          )}
          <Link
            href="/book"
            className="ml-1 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm"
          >
            Book a session
          </Link>
        </nav>
      </div>
    </header>
  );
}
