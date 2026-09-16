import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "./dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboardData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}