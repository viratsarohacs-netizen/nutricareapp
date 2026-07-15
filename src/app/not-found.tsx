import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="text-6xl">🥦</div>
      <h1 className="mt-4 text-3xl font-bold text-brand-900">Page not found</h1>
      <p className="mt-2 text-brand-800/70">
        Looks like this page isn&apos;t on the menu. Let&apos;s get you back to something
        nourishing.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium"
        >
          Go home
        </Link>
        <Link
          href="/book"
          className="px-5 py-2.5 rounded-lg bg-white ring-1 ring-brand-200 text-brand-800 font-medium hover:bg-brand-50"
        >
          Book a session
        </Link>
      </div>
    </main>
  );
}
