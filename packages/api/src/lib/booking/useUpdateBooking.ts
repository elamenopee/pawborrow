import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBookingStatus,
} from "../booking/booking";

import type { BookingStatus } from "../booking/booking";

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: number;
      status: BookingStatus;
    }) =>
      updateBookingStatus(bookingId, status),

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