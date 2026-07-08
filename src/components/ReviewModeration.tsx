"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/types";

export function ReviewModeration({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setApproval(id: string, approved: boolean) {
    setBusyId(id);
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    setBusyId(null);
    router.refresh();
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-brand-600/60">No patient reviews yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl ring-1 ring-brand-100 p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-brand-900">{r.name}</span>
              <span className="ml-2 text-amber-400 text-sm">{"★".repeat(r.rating)}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                r.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {r.approved ? "Published" : "Pending"}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-brand-800/80">“{r.text}”</p>
          <button
            onClick={() => setApproval(r.id, !r.approved)}
            disabled={busyId === r.id}
            className={`mt-2 text-xs font-medium hover:underline disabled:opacity-50 ${
              r.approved ? "text-amber-600" : "text-green-600"
            }`}
          >
            {busyId === r.id ? "Saving…" : r.approved ? "Unpublish" : "Approve & publish"}
          </button>
        </li>
      ))}
    </ul>
  );
}
