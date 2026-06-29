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

export interface DB {
  users: User[];
  services: Service[];
  bookings: Booking[];
  docs: DietDoc[];
  messages: Message[];
}
