import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailySale {
  day: string;
  sales: number;
}

interface DailySalesChartProps {
  data?: DailySale[] | null;
  totalSales?: number | null;
  dateRange?: string | null;
}

function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export default function DailySalesChart({
  data = [],
  totalSales = 0,
  dateRange = "",
}: DailySalesChartProps) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">
            Daily Sales
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            {dateRange ?? ""}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">
            Total Sales
          </p>

          <p className="mt-1 text-lg font-bold text-gray-800">
            {formatCurrency(totalSales ?? 0)}
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-gray-400">
            No sales data available.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 11,
                }}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 11,
                }}
                tickFormatter={(value: number) =>
                  `₱${value.toLocaleString("en-PH")}`
                }
                width={75}
              />

              <Tooltip
                cursor={{
                  stroke: "#D1D5DB",
                  strokeDasharray: "4 4",
                }}
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Sales",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#F97316"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#F97316",
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}