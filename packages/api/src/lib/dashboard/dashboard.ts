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
    | {
        category_name: string;
      }
    | {
        category_name: string;
      }[]
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
  const normalizedStatus = status.toLowerCase();

  return [
    "paid",
    "completed",
    "successful",
    "success",
  ].includes(normalizedStatus);
}

function formatCurrencyDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = new Date();
  const startDate = new Date();

  startDate.setDate(today.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const [
    usersResult,
    bookingsResult,
    petsResult,
    bookingPaymentsResult,
    productPaymentsResult,
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

    supabase
      .from("product_payment")
      .select(`
        amount,
        payment_status,
        transaction_date
      `),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (bookingsResult.error) throw bookingsResult.error;
  if (petsResult.error) throw petsResult.error;
  if (bookingPaymentsResult.error) {
    throw bookingPaymentsResult.error;
  }
  if (productPaymentsResult.error) {
    throw productPaymentsResult.error;
  }

  const pets =
    (petsResult.data ?? []) as unknown as PetRecord[];

  const bookingPayments =
    (bookingPaymentsResult.data ??
      []) as unknown as PaymentRecord[];

  const productPayments =
    (productPaymentsResult.data ??
      []) as unknown as PaymentRecord[];

  const successfulPayments = [
    ...bookingPayments,
    ...productPayments,
  ].filter((payment) =>
    isSuccessfulPayment(payment.payment_status),
  );

  const totalSales = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const salesByDate = new Map<string, number>();

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + offset);

    const key = date.toISOString().slice(0, 10);

    salesByDate.set(key, 0);
  }

  successfulPayments.forEach((payment) => {
    const paymentDate = new Date(
      payment.transaction_date,
    );

    if (
      Number.isNaN(paymentDate.getTime()) ||
      paymentDate < startDate
    ) {
      return;
    }

    const key = paymentDate.toISOString().slice(0, 10);

    if (!salesByDate.has(key)) return;

    salesByDate.set(
      key,
      (salesByDate.get(key) ?? 0) +
        Number(payment.amount),
    );
  });

  const dailySales = Array.from(
    salesByDate.entries(),
  ).map(([date, sales]) => ({
    day: formatCurrencyDate(
      new Date(`${date}T00:00:00`),
    ),
    sales,
  }));

  const availablePets = pets.filter(
    (pet) =>
      pet.status.toLowerCase() === "available",
  );

  const categoryCounts = new Map<string, number>();

  availablePets.forEach((pet) => {
    const categoryRelation = Array.isArray(pet.category)
      ? pet.category[0]
      : pet.category;

    const categoryName =
      categoryRelation?.category_name ?? "Uncategorized";

    categoryCounts.set(
      categoryName,
      (categoryCounts.get(categoryName) ?? 0) + 1,
    );
  });

  const availablePetCount = availablePets.length;

  const petBreakdown = Array.from(
    categoryCounts.entries(),
  ).map(([name, value], index) => ({
    name,
    value,
    percentage:
      availablePetCount > 0
        ? Math.round((value / availablePetCount) * 100)
        : 0,
    fill:
      CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return {
    visitors: usersResult.count ?? 0,
    totalSales,
    bookings: bookingsResult.count ?? 0,
    pets: pets.length,
    availablePets: availablePetCount,
    dailySales,
    salesDateRange: `${formatCurrencyDate(
      startDate,
    )} – ${formatCurrencyDate(today)}`,
    petBreakdown,
  };
}