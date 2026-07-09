import { NextResponse } from "next/server";
import { submitReview, setReviewApproval } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import { notifyReviewSubmitted, isTestEmail } from "@/lib/email";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { rating, text } = await req.json();
  const r = Number(rating);
  if (!r || r < 1 || r > 5 || !text?.trim()) {
    return NextResponse.json({ error: "Rating (1–5) and review text required." }, { status: 400 });
  }
  const review = await submitReview({
    patientId: user.id,
    name: user.name,
    rating: r,
    text: text.trim().slice(0, 600),
  });
  if (!review) {
    return NextResponse.json(
      { error: "Could not submit — you may have already left a review." },
      { status: 409 }
    );
  }
  if (!isTestEmail(user.email)) await notifyReviewSubmitted(review);
  return NextResponse.json({ ok: true, review });
}

// Admin: approve / unapprove
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, approved } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await setReviewApproval(id, !!approved);
  if (!ok) return NextResponse.json({ error: "Could not update." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
