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
