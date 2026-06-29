import { practice } from "./config";

export interface DayOption {
  date: string; // YYYY-MM-DD
  label: string; // "Mon, Jun 24"
  weekday: number;
}

export function upcomingDays(): DayOption[] {
  const { bookingHorizonDays } = practice.availability;
  const workingDays: number[] = [...practice.availability.workingDays];
  const out: DayOption[] = [];
  const today = new Date();
  for (let i = 1; i <= bookingHorizonDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const wd = d.getDay();
    if (!workingDays.includes(wd)) continue;
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      weekday: wd,
    });
  }
  return out;
}

export function allSlotsForDay(): string[] {
  const { startHour, endHour, slotMinutes } = practice.availability;
  const out: string[] = [];
  for (let m = startHour * 60; m + slotMinutes <= endHour * 60; m += slotMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    out.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return out;
}

export function formatMoney(cents: number): string {
  if (cents === 0) return "Free";
  const major = Math.round(cents / 100);
  return `${practice.currencySymbol}${major.toLocaleString("en-IN")}`;
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatDateLong(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
