import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePet, type UpdatePetInput } from "./pet";

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, updates }: { petId: number; updates: UpdatePetInput }) =>
      updatePet(petId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}