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

function safeNumber(
  value: number | null | undefined,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : 0;
}

function formatCurrency(
  value: number | null | undefined,
): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNumber(value));
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Failed to load dashboard data.";
}

export default function Dashboard() {
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboard();

  const dailySales = Array.isArray(dashboard?.dailySales)
    ? dashboard.dailySales
    : [];

  const petBreakdown = Array.isArray(dashboard?.petBreakdown)
    ? dashboard.petBreakdown
    : [];

  return (
    <div className="flex-1 bg-gray-50">
      <Header title="DASHBOARD" />

      <div className="p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            onClick={() => void refetch()}
            disabled={isFetching}
            className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading && !dashboard && (
          <div
            className="flex min-h-72 items-center justify-center"
            role="status"
          >
            <p className="text-sm text-gray-500">
              Loading dashboard...
            </p>
          </div>
        )}

        {isError && (
          <div
            className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            <p>{getErrorMessage(error)}</p>

            {dashboard && (
              <p className="mt-1">
                Showing previously loaded data. Click Refresh to try
                again.
              </p>
            )}
          </div>
        )}

        {!isLoading && !isError && !dashboard && (
          <div className="flex min-h-72 items-center justify-center">
            <p className="text-sm text-gray-500">
              No dashboard data was returned.
            </p>
          </div>
        )}

        {dashboard && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Users}
                value={safeNumber(
                  dashboard.visitors,
                ).toLocaleString("en-PH")}
                label="Customers"
                colorClass="bg-orange-400"
              />

              <StatCard
                icon={LineChart}
                value={formatCurrency(dashboard.totalSales)}
                label="Sales"
                colorClass="bg-sky-400"
              />

              <StatCard
                icon={CheckCircle2}
                value={safeNumber(
                  dashboard.bookings,
                ).toLocaleString("en-PH")}
                label="Bookings"
                colorClass="bg-emerald-400"
              />

              <StatCard
                icon={PawPrint}
                value={safeNumber(
                  dashboard.pets,
                ).toLocaleString("en-PH")}
                label="Pets"
                colorClass="bg-indigo-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DailySalesChart
                data={dailySales}
                totalSales={safeNumber(dashboard.totalSales)}
                dateRange={dashboard.salesDateRange ?? ""}
              />

              <PetsBreakdown
                data={petBreakdown}
                totalPets={safeNumber(dashboard.availablePets)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}