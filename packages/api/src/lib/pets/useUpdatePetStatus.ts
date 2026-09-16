import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePetStatus, type PetStatus } from "./pet";

export function useUpdatePetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, status }: { petId: number; status: PetStatus }) =>
      updatePetStatus(petId, status),

    onSuccess: () => {
      // "pets" covers the customer-facing list, ["pets","admin"] the admin one.
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}