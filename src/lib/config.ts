// ─────────────────────────────────────────────────────────────────────────────
// Practice configuration — EDIT THIS to rebrand the whole site.
// (Name, tagline, services, contact, etc. all read from here.)
// ─────────────────────────────────────────────────────────────────────────────

export const practice = {
  name: "Dt. Pragya Choudhary",
  credential: "Clinical Dietitian & Nutritionist",
  // Photo shown in the hero. Save the image to public/pragya.jpg (set to "" to use the emoji fallback).
  heroPhoto: "/pragya.jpg",
  tagline: "Science-backed nutrition for lasting weight loss & better health.",
  intro:
    "I'm a clinical dietitian who helps people manage PCOS, thyroid, diabetes, and weight through personalised Indian meal plans and 1:1 online consultations — no fad diets, no starving, just results that last.",
  email: "dieticianpragya@gmail.com",
  phone: "+91 98xxx xxxxx",
  location: "Online · India",
  currency: "INR",
  currencySymbol: "₹",
  // Weekly availability used to generate bookable slots (24h, local time).
  availability: {
    workingDays: [1, 2, 3, 4, 5], // Mon–Fri (0 = Sun)
    startHour: 9,
    endHour: 17,
    slotMinutes: 60,
    bookingHorizonDays: 21, // how far ahead patients can book
  },
} as const;

export type ServiceId = string;
