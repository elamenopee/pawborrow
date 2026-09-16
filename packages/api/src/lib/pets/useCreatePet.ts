import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPet, type CreatePetInput } from "./pet";

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pet: CreatePetInput) => createPet(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}