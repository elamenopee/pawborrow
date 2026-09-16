import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
  Tooltip,
} from "recharts";
import type { PetCategoryBreakdown } from "@repo/api";

interface PetsBreakdownProps {
  data: PetCategoryBreakdown[];
  totalPets: number;
}

export default function PetsBreakdown({
  data,
  totalPets,
}: PetsBreakdownProps) {
  const maximumValue = Math.max(
    1,
    ...data.map((item) => item.value),
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-gray-800">
        {totalPets.toLocaleString()} Available{" "}
        {totalPets === 1 ? "Pet" : "Pets"}
      </h2>

      <p className="mb-2 text-xs text-gray-400">
        Grouped by category
      </p>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center">
          <p className="text-sm text-gray-400">
            No available pets.
          </p>
        </div>
      ) : (
        <div className="grid min-h-56 grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="h-56">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RadialBarChart
                innerRadius="25%"
                outerRadius="100%"
                data={data}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, maximumValue]}
                  tick={false}
                />

                <RadialBar
                  dataKey="value"
                  background={{
                    fill: "#F5F1EC",
                  }}
                  cornerRadius={8}
                />

                <Tooltip
                  formatter={(value, _name, item) => {
                    const payload = item.payload as
                      | PetCategoryBreakdown
                      | undefined;

                    return [
                      `${Number(value)} pets (${
                        payload?.percentage ?? 0
                      }%)`,
                      payload?.name ?? "Category",
                    ];
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.fill,
                    }}
                  />

                  <span className="truncate text-gray-500">
                    {item.name}
                  </span>
                </div>

                <strong
                  className="shrink-0"
                  style={{
                    color: item.fill,
                  }}
                >
                  {item.value} ({item.percentage}%)
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}