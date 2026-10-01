import { supabase } from "../supabaseClient";

export interface DailySale {
  day: string;
  sales: number;
}

export interface PetCategoryBreakdown {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

export interface DashboardData {
  visitors: number;
  totalSales: number;
  bookings: number;
  pets: number;
  availablePets: number;
  dailySales: DailySale[];
  salesDateRange: string;
  petBreakdown: PetCategoryBreakdown[];
}

interface PaymentRecord {
  amount: number | string;
  payment_status: string;
  transaction_date: string;
}

interface PetRecord {
  status: string;
  category:
    | { category_name: string }
    | { category_name: string }[]
    | null;
}

const CATEGORY_COLORS = [
  "#FB923C",
  "#38BDF8",
  "#818CF8",
  "#1E293B",
  "#10B981",
  "#F472B6",
];

function isSuccessfulPayment(status: string): boolean {
  return ["paid", "completed", "successful", "success"].includes(
    status.trim().toLowerCase(),
  );
}

function getAmount(value: number | string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

// Philippine time is UTC+8.
function getPhilippineDateKey(date: Date): string {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function formatDateKey(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    usersResult,
    bookingsResult,
    petsResult,
    paymentsResult,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "customer")
      .eq("is_active", true),

    supabase
      .from("booking")
      .select("booking_id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("pet")
      .select(`
        status,
        category:pet_category (
          category_name
        )
      `),

    supabase
      .from("payment")
      .select(`
        amount,
        payment_status,
        transaction_date
      `),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (bookingsResult.error) throw bookingsResult.error;
  if (petsResult.error) throw petsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;

  const pets = (petsResult.data ?? []) as unknown as PetRecord[];

  const payments = (paymentsResult.data ?? []) as PaymentRecord[];

  const successfulPayments = payments.filter((payment) =>
    isSuccessfulPayment(payment.payment_status),
  );

  const totalSales = successfulPayments.reduce(
    (sum, payment) => sum + getAmount(payment.amount),
    0,
  );

  // Create seven date buckets, ending with today in Philippine time.
  const todayKey = getPhilippineDateKey(new Date());
  const today = new Date(`${todayKey}T00:00:00Z`);
  const salesByDate = new Map<string, number>();

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - daysAgo);

    salesByDate.set(date.toISOString().slice(0, 10), 0);
  }

  for (const payment of successfulPayments) {
    const paymentDate = new Date(payment.transaction_date);

    if (Number.isNaN(paymentDate.getTime())) continue;

    const key = getPhilippineDateKey(paymentDate);

    if (!salesByDate.has(key)) continue;

    salesByDate.set(
      key,
      (salesByDate.get(key) ?? 0) + getAmount(payment.amount),
    );
  }

  const dailySales: DailySale[] = Array.from(
    salesByDate.entries(),
    ([date, sales]) => ({
      day: formatDateKey(date),
      sales,
    }),
  );

  const availablePets = pets.filter(
    (pet) => pet.status.toLowerCase() === "available",
  );

  const categoryCounts = new Map<string, number>();

  for (const pet of availablePets) {
    const category = Array.isArray(pet.category)
      ? pet.category[0]
      : pet.category;

    const name = category?.category_name ?? "Uncategorized";

    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }

  const availablePetCount = availablePets.length;

  const petBreakdown: PetCategoryBreakdown[] = Array.from(
    categoryCounts.entries(),
    ([name, value], index) => ({
      name,
      value,
      percentage:
        availablePetCount > 0
          ? Math.round((value / availablePetCount) * 100)
          : 0,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }),
  );

  const dateKeys = Array.from(salesByDate.keys());

  return {
    visitors: usersResult.count ?? 0,
    totalSales,
    bookings: bookingsResult.count ?? 0,
    pets: pets.length,
    availablePets: availablePetCount,
    dailySales,
    salesDateRange:
      `${formatDateKey(dateKeys[0])} – ${formatDateKey(todayKey)}`,
    petBreakdown,
  };
}