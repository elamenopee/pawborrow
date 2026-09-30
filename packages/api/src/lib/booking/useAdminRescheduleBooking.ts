import { useMutation, useQueryClient } from "@tanstack/react-query";
import {adminRescheduleBooking, type RescheduleBookingInput} from "./booking";


export function useAdminRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RescheduleBookingInput) =>
      adminRescheduleBooking(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-bookings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
  });
}