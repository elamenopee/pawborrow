import { useMemo } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { usePets } from "@repo/api";

import {
  getPetImage,
  handlePetImageError,
} from "../utils/petImage";
import "../style/BreedSelection.css";

function createSlug(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCategoryLabel(
  value?: string,
): string {
  if (!value) {
    return "Pet";
  }

  return value
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

type BreedItem = {
  id: string;
  name: string;
  photo: string | null;
  count: number;
};

const BreedSelection: React.FC = () => {
  const { animalId } = useParams<{
    animalId: string;
  }>();

  const navigate = useNavigate();

  const {
    data: pets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePets();

  const normalizedAnimalId =
    animalId ?? "";

  const categoryPets = useMemo(() => {
    return pets.filter((pet) => {
      return (
        createSlug(pet.category) ===
        normalizedAnimalId
      );
    });
  }, [
    pets,
    normalizedAnimalId,
  ]);

  const breeds = useMemo(() => {
    const breedMap =
      new Map<string, BreedItem>();

    categoryPets.forEach((pet) => {
      if (!pet.breed?.trim()) {
        return;
      }

      const breedName =
        pet.breed.trim();

      const breedId =
        createSlug(breedName);

      const existingBreed =
        breedMap.get(breedId);

      if (existingBreed) {
        existingBreed.count += 1;

        if (
          !existingBreed.photo &&
          pet.image
        ) {
          existingBreed.photo =
            pet.image;
        }

        return;
      }

      breedMap.set(breedId, {
        id: breedId,
        name: breedName,
        photo: pet.image,
        count: 1,
      });
    });

    return Array.from(
      breedMap.values(),
    ).sort((first, second) =>
      first.name.localeCompare(
        second.name,
      ),
    );
  }, [categoryPets]);

  const categoryLabel =
    categoryPets[0]?.category ??
    formatCategoryLabel(animalId);

  function handleSelectBreed(
    breedId: string,
  ) {
    navigate(
      `/breed-pets/${normalizedAnimalId}/${breedId}`,
    );
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="breed-content"
      >
        <div className="breed">
          <header className="breed-header">
            <button
              type="button"
              className="breed-back"
              aria-label="Back to pet categories"
              onClick={() =>
                navigate("/pet-category")
              }
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>
              {categoryLabel} Breeds
            </h1>
          </header>

          {isLoading && (
            <p className="breed-message">
              Loading breeds...
            </p>
          )}

          {isError && (
            <div className="breed-not-found">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load breeds."}
              </p>

              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            breeds.length === 0 && (
              <div className="breed-not-found">
                <p>
                  No available breeds were
                  found for this category.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/pet-category",
                    )
                  }
                >
                  Back to Categories
                </button>
              </div>
            )}

          {!isLoading &&
            !isError &&
            breeds.length > 0 && (
              <div className="breed-grid">
                {breeds.map((breed) => (
                  <button
                    type="button"
                    className="breed-card"
                    key={breed.id}
                    aria-label={`Browse ${breed.name}`}
                    onClick={() =>
                      handleSelectBreed(
                        breed.id,
                      )
                    }
                  >
                    <img
                      src={getPetImage(
                        breed.photo,
                      )}
                      alt={breed.name}
                      loading="lazy"
                      onError={
                        handlePetImageError
                      }
                    />

                    <span>
                      {breed.name}
                    </span>

                    <small>
                      {breed.count}{" "}
                      {breed.count === 1
                        ? "pet"
                        : "pets"}
                    </small>
                  </button>
                ))}
              </div>
            )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BreedSelection;