import {
  Users,
  LineChart,
  CheckCircle2,
  PawPrint,
} from "lucide-react";
import { useDashboard } from "@repo/api";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import DailySalesChart from "../components/DailySalesChart";
import PetsBreakdown from "../components/PetsBreakdown";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Dashboard() {
  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useDashboard();

  return (
    <div className="flex-1 bg-gray-50">
      <Header title="DASHBOARD" />

      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Dashboard Overview
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Live information from the PawBorrow database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading && (
          <div className="flex min-h-72 items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading dashboard...
            </p>
          </div>
        )}

        {error && (
          <div
            className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard data."}
          </div>
        )}

        {!isLoading && !error && dashboard && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Users}
                value={dashboard.visitors.toLocaleString()}
                label="Customers"
                colorClass="bg-orange-400"
              />

              <StatCard
                icon={LineChart}
                value={formatCurrency(
                  dashboard.totalSales,
                )}
                label="Sales"
                colorClass="bg-sky-400"
              />

              <StatCard
                icon={CheckCircle2}
                value={dashboard.bookings.toLocaleString()}
                label="Bookings"
                colorClass="bg-emerald-400"
              />

              <StatCard
                icon={PawPrint}
                value={dashboard.pets.toLocaleString()}
                label="Pets"
                colorClass="bg-indigo-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DailySalesChart
                data={dashboard.dailySales}
                totalSales={dashboard.totalSales}
                dateRange={dashboard.salesDateRange}
              />

              <PetsBreakdown
                data={dashboard.petBreakdown}
                totalPets={dashboard.availablePets}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}