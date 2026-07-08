import type { MealDay } from "./types";

// Starter plan templates for the meal-plan builder — load, then tweak.
// Pure data; edit freely or add new templates.

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  notes: string;
  days: MealDay[];
}

const d = (
  day: string,
  breakfast: string,
  lunch: string,
  snack: string,
  dinner: string
): MealDay => ({ day, meals: { breakfast, lunch, snack, dinner } });

export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: "weightloss-veg",
    name: "Weight Loss — Veg (7 days)",
    description: "Balanced ~1,400 kcal vegetarian week, Indian home-cooked.",
    notes: "2.5–3L water daily. 20-min walk after dinner. No sugar in tea/coffee.",
    days: [
      d("Monday", "Veg poha + green tea", "2 roti + dal + sabzi + salad", "1 fruit (apple / guava)", "Moong dal khichdi + curd"),
      d("Tuesday", "Oats porridge with nuts & seeds", "1 cup brown rice + rajma + salad", "Buttermilk (1 glass)", "2 roti + mixed veg + salad"),
      d("Wednesday", "Besan chilla (2) + mint chutney", "2 roti + palak paneer + salad", "Roasted makhana (1 cup)", "Vegetable soup + grilled paneer (80g)"),
      d("Thursday", "2 idli + sambar", "Quinoa vegetable pulao + raita", "Green tea + 4 almonds", "1 millet roti + dal + sabzi"),
      d("Friday", "Moong dal cheela + curd", "2 roti + lauki chana dal + salad", "Coconut water", "Veg daliya + buttermilk"),
      d("Saturday", "Veg upma + buttermilk", "1 cup rice + sambar + veg poriyal", "Sprouts bhel", "2 besan chilla + green chutney"),
      d("Sunday", "Ragi dosa + tomato chutney", "Millet khichdi + kadhi", "1 fruit (orange / papaya)", "Palak soup + 1 roti + sabzi"),
    ],
  },
  {
    id: "pcos",
    name: "PCOS-friendly (7 days)",
    description: "Low-GI, anti-inflammatory focus; steady protein through the day.",
    notes:
      "Avoid refined flour & sugar. Add 1 tsp flax/chia daily. Strength training 3×/week helps insulin sensitivity.",
    days: [
      d("Monday", "Moong dal cheela + curd", "2 roti (multigrain) + dal + sabzi + salad", "Roasted chana (1 handful)", "Grilled paneer (80g) + sautéed vegetables"),
      d("Tuesday", "Sprouts salad + lemon water", "Quinoa vegetable pulao + raita", "Green tea + 4 almonds + 2 walnuts", "Moong dal khichdi + curd"),
      d("Wednesday", "2 egg omelette + 1 multigrain toast", "1 cup brown rice + rajma + cucumber salad", "Buttermilk (1 glass)", "Vegetable soup + 1 millet roti + sabzi"),
      d("Thursday", "Besan chilla (2) + mint chutney", "2 roti + palak paneer + salad", "Roasted makhana (1 cup)", "Grilled chicken/tofu (100g) + salad"),
      d("Friday", "Oats porridge with seeds (no sugar)", "Millet khichdi + kadhi", "1 fruit (low-GI: guava / apple)", "2 besan chilla + green chutney"),
      d("Saturday", "Ragi dosa + tomato chutney", "2 roti + bhindi sabzi + dal + curd", "Sprouts bhel", "Palak soup + grilled paneer (80g)"),
      d("Sunday", "Veg daliya", "1 cup rice + fish/chana curry + salad", "Coconut water", "Oats vegetable khichdi"),
    ],
  },
  {
    id: "diabetes",
    name: "Diabetes-friendly (7 days)",
    description: "Low-GI carbs, portion-controlled, even meal spacing.",
    notes:
      "Eat every 3–4 hours; never skip meals. 15-min walk after each main meal. Monitor fasting sugar weekly.",
    days: [
      d("Monday", "Veg daliya", "2 roti (multigrain) + dal + sabzi + salad", "Roasted chana (1 handful)", "Moong dal khichdi + curd"),
      d("Tuesday", "Moong dal cheela + curd", "Millet khichdi + kadhi", "Buttermilk (1 glass)", "Vegetable soup + 1 roti + sabzi"),
      d("Wednesday", "2 idli + sambar (no chutney sugar)", "2 roti + lauki chana dal + salad", "1 small guava / apple", "Grilled fish/paneer (100g) + sautéed veg"),
      d("Thursday", "Besan chilla (2) + mint chutney", "1 cup brown rice + rajma + salad", "Green tea + 4 almonds", "1 millet roti + dal + sabzi"),
      d("Friday", "Oats porridge (no sugar) + nuts", "2 roti + palak paneer + salad", "Roasted makhana (1 cup)", "Veg daliya + buttermilk"),
      d("Saturday", "Sprouts salad + lemon water", "1 cup rice + sambar + veg poriyal", "Vegetable soup", "2 besan chilla + green chutney"),
      d("Sunday", "Ragi dosa + tomato chutney", "2 roti + bhindi sabzi + dal + curd", "1 boiled egg / handful peanuts", "Palak soup + grilled paneer (80g)"),
    ],
  },
  {
    id: "detox-3day",
    name: "Light Reset (3 days)",
    description: "Short, gentle reset — light meals, high hydration.",
    notes: "3L water. Herbal teas. Early dinner (before 8 pm). No packaged food.",
    days: [
      d("Day 1", "Fruit bowl + soaked almonds", "Moong dal khichdi + salad", "Coconut water", "Vegetable soup + steamed veg"),
      d("Day 2", "Veg daliya", "1 cup rice + dal + poriyal", "Buttermilk (1 glass)", "Palak soup + 1 roti"),
      d("Day 3", "Oats porridge with fruit", "Quinoa pulao + raita", "Green tea + makhana", "Moong dal khichdi + curd"),
    ],
  },
];
