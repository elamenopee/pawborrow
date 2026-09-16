import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePet } from "./pet";

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (petId: number) => deletePet(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}