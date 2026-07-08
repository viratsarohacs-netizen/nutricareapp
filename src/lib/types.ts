export type Role = "patient" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — plain text. Real app: Supabase Auth / hashed.
  role: Role;
  phone?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, "password">;

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceCents: number;
  popular?: boolean;
}

export type BookingStatus = "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid";

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: BookingStatus;
  payment: PaymentStatus;
  amountCents: number;
  notes?: string;
  createdAt: string;
}

export type DocType = "plan" | "report" | "note";

export interface DietDoc {
  id: string;
  patientId: string;
  title: string;
  type: DocType;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  patientId: string;
  sender: "patient" | "nutritionist";
  text: string;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number | null;
  note?: string | null;
  createdAt: string;
}

export interface Intake {
  patientId: string;
  age?: number | null;
  heightCm?: number | null;
  startWeightKg?: number | null;
  goalWeightKg?: number | null;
  activityLevel?: string | null; // sedentary | light | moderate | active
  dietPref?: string | null; // veg | non-veg | vegan | eggetarian
  conditions?: string | null;
  allergies?: string | null;
  goals?: string | null;
  updatedAt?: string | null;
}

export interface MealDay {
  day: string; // "Day 1" / "Monday"
  meals: {
    breakfast?: string;
    lunch?: string;
    snack?: string;
    dinner?: string;
  };
}

export interface MealPlan {
  id: string;
  patientId: string;
  title: string;
  days: MealDay[];
  notes?: string | null;
  createdBy: string;
  createdAt: string;
}

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface FoodLog {
  id: string;
  patientId: string;
  date: string;
  mealType: MealType;
  description: string;
  createdAt: string;
}

export interface DailyHabit {
  id: string;
  patientId: string;
  date: string;
  waterGlasses: number;
  sleepHours?: number | null;
  exercised: boolean;
  followedPlan: boolean;
}

export interface Review {
  id: string;
  patientId: string;
  name: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
}

export interface DB {
  users: User[];
  services: Service[];
  bookings: Booking[];
  docs: DietDoc[];
  messages: Message[];
}
