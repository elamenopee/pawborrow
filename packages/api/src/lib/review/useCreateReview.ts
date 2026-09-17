import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createReview } from "./review";
import type {
  CreateReviewInput,
} from "./review";

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateReviewInput,
    ) => createReview(input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["admin-reviews"],
        }),
      ]);
    },
  });
}