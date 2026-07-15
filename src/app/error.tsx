"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="text-6xl">🍋</div>
      <h1 className="mt-4 text-3xl font-bold text-brand-900">Something went sour</h1>
      <p className="mt-2 text-brand-800/70">
        An unexpected error occurred. It&apos;s been noted — please try again.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 rounded-lg bg-white ring-1 ring-brand-200 text-brand-800 font-medium hover:bg-brand-50"
        >
          Go home
        </a>
      </div>
    </main>
  );
}
