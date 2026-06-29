import { createClient } from "./supabase/server";
import type { SafeUser, User } from "./types";

export function toSafe(u: User): SafeUser {
  const { password: _pw, ...rest } = u;
  void _pw;
  return rest;
}

// The current logged-in user, composed from the Supabase auth session + profile.
export async function getCurrentUser(): Promise<SafeUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email || user.email || "",
    role: profile.role,
    phone: profile.phone ?? undefined,
    createdAt: profile.created_at,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ role: "patient" | "admin" } | { error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  const u = await getCurrentUser();
  return { role: u?.role ?? "patient" };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
