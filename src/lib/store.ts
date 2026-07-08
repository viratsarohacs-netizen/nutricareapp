import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import type {
  Booking,
  DietDoc,
  Message,
  Service,
  User,
  DocType,
  BookingStatus,
  PaymentStatus,
  ProgressLog,
  Intake,
  MealPlan,
  FoodLog,
  DailyHabit,
  Review,
  MealType,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Data layer — Supabase. The whole app talks only to these functions; they map
// snake_case DB rows to the app's camelCase domain types. RLS is enforced by the
// request-scoped server client; the admin client is used only where we must read
// across patients (slot availability) or create confirmed users (signup).
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function toService(r: any): Service {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    durationMin: r.duration_min,
    priceCents: r.price_cents,
    popular: r.popular,
  };
}

function toBooking(r: any): Booking {
  return {
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    patientEmail: r.patient_email,
    serviceId: r.service_id,
    serviceName: r.service_name,
    date: r.date,
    time: r.time,
    status: r.status as BookingStatus,
    payment: r.payment as PaymentStatus,
    amountCents: r.amount_cents,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

function toDoc(r: any): DietDoc {
  return {
    id: r.id,
    patientId: r.patient_id,
    title: r.title,
    type: r.type as DocType,
    content: r.content,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

function toMessage(r: any): Message {
  return {
    id: r.id,
    patientId: r.patient_id,
    sender: r.sender,
    text: r.text,
    createdAt: r.created_at,
  };
}

function toUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    password: "",
    role: r.role,
    phone: r.phone ?? undefined,
    createdAt: r.created_at,
  };
}

// ── Services ─────────────────────────────────────────────────────────────────
export async function listServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").order("sort");
  return (data ?? []).map(toService);
}

export async function findService(id: string): Promise<Service | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  return data ? toService(data) : null;
}

// ── Bookings ─────────────────────────────────────────────────────────────────
// Cross-patient read — must bypass RLS to compute true availability. Returns
// ONLY taken time strings, never patient data.
export async function bookedSlots(date: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select("time, status")
    .eq("date", date)
    .neq("status", "cancelled");
  return (data ?? []).map((r: any) => r.time);
}

export async function listBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("date")
    .order("time");
  return (data ?? []).map(toBooking);
}

export async function listBookingsForPatient(patientId: string): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("patient_id", patientId)
    .order("date")
    .order("time");
  return (data ?? []).map(toBooking);
}

export async function createBooking(
  b: Omit<Booking, "id" | "createdAt" | "status">
): Promise<Booking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      patient_id: b.patientId,
      patient_name: b.patientName,
      patient_email: b.patientEmail,
      service_id: b.serviceId,
      service_name: b.serviceName,
      date: b.date,
      time: b.time,
      payment: b.payment,
      amount_cents: b.amountCents,
      notes: b.notes ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toBooking(data);
}

export async function updateBooking(
  id: string,
  patch: Partial<Booking>
): Promise<Booking | null> {
  const supabase = await createClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.payment !== undefined) dbPatch.payment = patch.payment;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.time !== undefined) dbPatch.time = patch.time;
  const { data, error } = await supabase
    .from("bookings")
    .update(dbPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return toBooking(data);
}

// ── Diet docs ────────────────────────────────────────────────────────────────
export async function listDocsForPatient(patientId: string): Promise<DietDoc[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diet_docs")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toDoc);
}

export async function createDoc(
  d: Omit<DietDoc, "id" | "createdAt">
): Promise<DietDoc | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diet_docs")
    .insert({
      patient_id: d.patientId,
      title: d.title,
      type: d.type,
      content: d.content,
      created_by: d.createdBy,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toDoc(data);
}

// ── Messages ─────────────────────────────────────────────────────────────────
export async function listMessagesForPatient(patientId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at");
  return (data ?? []).map(toMessage);
}

export async function createMessage(
  m: Omit<Message, "id" | "createdAt">
): Promise<Message | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ patient_id: m.patientId, sender: m.sender, text: m.text })
    .select("*")
    .single();
  if (error || !data) return null;
  return toMessage(data);
}

// ── Patients / users (admin) ─────────────────────────────────────────────────
export async function listPatients(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "patient")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toUser);
}

// Creates a confirmed patient auth user (no email-verification friction).
// The DB trigger creates the matching profile row. Returns the new user id.
export async function createPatient(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ id: string } | { error: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name, phone: input.phone ?? null, role: "patient" },
  });
  if (error || !data.user) {
    const msg = error?.message ?? "Could not create account.";
    return {
      error: /already|exist/i.test(msg)
        ? "An account with this email already exists."
        : msg,
    };
  }
  return { id: data.user.id };
}

// ── Progress logs ────────────────────────────────────────────────────────────
function toProgress(r: any): ProgressLog {
  return {
    id: r.id,
    patientId: r.patient_id,
    date: r.date,
    weightKg: Number(r.weight_kg),
    waistCm: r.waist_cm != null ? Number(r.waist_cm) : null,
    note: r.note ?? null,
    createdAt: r.created_at,
  };
}

export async function listProgress(patientId: string): Promise<ProgressLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("progress_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("date");
  return (data ?? []).map(toProgress);
}

export async function addProgress(input: {
  patientId: string;
  date: string;
  weightKg: number;
  waistCm?: number | null;
  note?: string | null;
}): Promise<ProgressLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("progress_logs")
    .insert({
      patient_id: input.patientId,
      date: input.date,
      weight_kg: input.weightKg,
      waist_cm: input.waistCm ?? null,
      note: input.note ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toProgress(data);
}

// ── Intake ───────────────────────────────────────────────────────────────────
function toIntake(r: any): Intake {
  return {
    patientId: r.patient_id,
    age: r.age,
    heightCm: r.height_cm != null ? Number(r.height_cm) : null,
    startWeightKg: r.start_weight_kg != null ? Number(r.start_weight_kg) : null,
    goalWeightKg: r.goal_weight_kg != null ? Number(r.goal_weight_kg) : null,
    activityLevel: r.activity_level,
    dietPref: r.diet_pref,
    conditions: r.conditions,
    allergies: r.allergies,
    goals: r.goals,
    updatedAt: r.updated_at,
  };
}

export async function getIntake(patientId: string): Promise<Intake | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("intakes")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();
  return data ? toIntake(data) : null;
}

export async function upsertIntake(input: Intake): Promise<Intake | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intakes")
    .upsert(
      {
        patient_id: input.patientId,
        age: input.age ?? null,
        height_cm: input.heightCm ?? null,
        start_weight_kg: input.startWeightKg ?? null,
        goal_weight_kg: input.goalWeightKg ?? null,
        activity_level: input.activityLevel ?? null,
        diet_pref: input.dietPref ?? null,
        conditions: input.conditions ?? null,
        allergies: input.allergies ?? null,
        goals: input.goals ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id" }
    )
    .select("*")
    .single();
  if (error || !data) return null;
  return toIntake(data);
}

// ── Meal plans ───────────────────────────────────────────────────────────────
function toMealPlan(r: any): MealPlan {
  return {
    id: r.id,
    patientId: r.patient_id,
    title: r.title,
    days: r.days ?? [],
    notes: r.notes ?? null,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

export async function listMealPlans(patientId: string): Promise<MealPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toMealPlan);
}

export async function createMealPlan(
  p: Omit<MealPlan, "id" | "createdAt">
): Promise<MealPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_plans")
    .insert({
      patient_id: p.patientId,
      title: p.title,
      days: p.days,
      notes: p.notes ?? null,
      created_by: p.createdBy,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toMealPlan(data);
}

// ── Food journal ─────────────────────────────────────────────────────────────
function toFoodLog(r: any): FoodLog {
  return {
    id: r.id,
    patientId: r.patient_id,
    date: r.date,
    mealType: r.meal_type as MealType,
    description: r.description,
    createdAt: r.created_at,
  };
}

export async function listFoodLogs(patientId: string, limit = 40): Promise<FoodLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("food_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toFoodLog);
}

export async function addFoodLog(input: {
  patientId: string;
  date: string;
  mealType: MealType;
  description: string;
}): Promise<FoodLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .insert({
      patient_id: input.patientId,
      date: input.date,
      meal_type: input.mealType,
      description: input.description,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toFoodLog(data);
}

// ── Daily habits ─────────────────────────────────────────────────────────────
function toHabit(r: any): DailyHabit {
  return {
    id: r.id,
    patientId: r.patient_id,
    date: r.date,
    waterGlasses: r.water_glasses,
    sleepHours: r.sleep_hours != null ? Number(r.sleep_hours) : null,
    exercised: r.exercised,
    followedPlan: r.followed_plan,
  };
}

export async function listHabits(patientId: string, limit = 14): Promise<DailyHabit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toHabit);
}

export async function upsertHabit(input: {
  patientId: string;
  date: string;
  waterGlasses?: number;
  sleepHours?: number | null;
  exercised?: boolean;
  followedPlan?: boolean;
}): Promise<DailyHabit | null> {
  const supabase = await createClient();
  // fetch existing so partial updates merge instead of clobber
  const { data: existing } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("patient_id", input.patientId)
    .eq("date", input.date)
    .maybeSingle();

  const row = {
    patient_id: input.patientId,
    date: input.date,
    water_glasses: input.waterGlasses ?? existing?.water_glasses ?? 0,
    sleep_hours: input.sleepHours !== undefined ? input.sleepHours : existing?.sleep_hours ?? null,
    exercised: input.exercised ?? existing?.exercised ?? false,
    followed_plan: input.followedPlan ?? existing?.followed_plan ?? false,
  };
  const { data, error } = await supabase
    .from("daily_habits")
    .upsert(row, { onConflict: "patient_id,date" })
    .select("*")
    .single();
  if (error || !data) return null;
  return toHabit(data);
}

// ── Reviews ──────────────────────────────────────────────────────────────────
function toReview(r: any): Review {
  return {
    id: r.id,
    patientId: r.patient_id,
    name: r.name,
    rating: r.rating,
    text: r.text,
    approved: r.approved,
    createdAt: r.created_at,
  };
}

// Public (landing page) — RLS exposes only approved rows to anonymous readers.
export async function listApprovedReviews(limit = 6): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toReview);
}

export async function listAllReviews(): Promise<Review[]> {
  const supabase = await createClient(); // admin sees all via RLS
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toReview);
}

export async function getMyReview(patientId: string): Promise<Review | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();
  return data ? toReview(data) : null;
}

export async function submitReview(input: {
  patientId: string;
  name: string;
  rating: number;
  text: string;
}): Promise<Review | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      patient_id: input.patientId,
      name: input.name,
      rating: input.rating,
      text: input.text,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toReview(data);
}

export async function setReviewApproval(id: string, approved: boolean): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
  return !error;
}
