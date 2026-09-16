import { useState } from "react";
import PetCard from "./PetCard";
import PetBookingModal from "./PetBookingModal";
import type { Pet } from "@repo/api";

type PetSortOption =
  | "latest"
  | "name";

interface Props {
  pets: Pet[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  pageSize: number;
  likedPetIds: Set<number>;
  onToggleLike: (petId: number) => void;
  isUpdatingLike: boolean;
  sortOrder: PetSortOption;
  onSortChange: (
    value: PetSortOption,
  ) => void;
}

export default function PetsGrid({
  pets,
  page,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
  likedPetIds,
  onToggleLike,
  isUpdatingLike,
  sortOrder,
  onSortChange,
}: Props) {
  const [selectedPet, setSelectedPet] =
    useState<Pet | null>(null);

  const start =
    totalCount === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const end = Math.min(
    page * pageSize,
    totalCount,
  );

  return (
    <div className="pets-grid-wrap">
      <div className="pets-grid-header">
        <span>
          Showing {start}-{end} of{" "}
          {totalCount} results
        </span>

        <select
          value={sortOrder}
          onChange={(event) =>
            onSortChange(
              event.target
                .value as PetSortOption,
            )
          }
          aria-label="Sort pets"
        >
          <option value="latest">
            Sort by latest
          </option>

          <option value="name">
            Sort by name
          </option>
        </select>
      </div>

      {pets.length === 0 ? (
        <p className="text-sm text-gray-500">
          No pets found.
        </p>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onSelect={setSelectedPet}
              isLiked={likedPetIds.has(
                pet.id,
              )}
              onToggleLike={() =>
                onToggleLike(pet.id)
              }
              isUpdatingLike={
                isUpdatingLike
              }
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pets-pagination">
          <div className="pets-pagination-numbers">
            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={
                  pageNumber === page
                    ? "active"
                    : ""
                }
                onClick={() =>
                  onPageChange(pageNumber)
                }
                aria-current={
                  pageNumber === page
                    ? "page"
                    : undefined
                }
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pets-pagination-next"
            disabled={page === totalPages}
            onClick={() =>
              onPageChange(
                Math.min(
                  page + 1,
                  totalPages,
                ),
              )
            }
          >
            Next →
          </button>
        </div>
      )}

      <PetBookingModal
        pet={selectedPet}
        onClose={() =>
          setSelectedPet(null)
        }
      />
    </div>
  );
}