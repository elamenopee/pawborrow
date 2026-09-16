import {
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  chevronBackOutline,
  heart,
  heartOutline,
} from "ionicons/icons";
import {
  useAddLikedPet,
  useLikedPets,
  usePets,
  useRemoveLikedPet,
} from "@repo/api";

import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";
import {
  matchesSearch,
} from "../utils/search";
import {
  getPetImage,
  handlePetImageError,
} from "../utils/petImage";
import "../style/BreedPets.css";

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

function formatLabel(
  value: string,
): string {
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

const BreedPets: React.FC = () => {
  const {
    animalId,
    breedId,
  } = useParams<{
    animalId: string;
    breedId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] =
    useState("");

  const {
    data: pets = [],
    isLoading: petsLoading,
    isError: petsError,
    error: petsErrorDetails,
    refetch: refetchPets,
  } = usePets();

  const {
    data: likedPets = [],
    isLoading: likedPetsLoading,
    isError: likedPetsError,
  } = useLikedPets(Boolean(user));

  const {
    mutate: addLikedPet,
    isPending: isAddingLikedPet,
  } = useAddLikedPet();

  const {
    mutate: removeLikedPet,
    isPending: isRemovingLikedPet,
  } = useRemoveLikedPet();

  const likedPetIds = useMemo(() => {
    return new Set(
      likedPets.map((likedPet) =>
        Number(likedPet.pet_id),
      ),
    );
  }, [likedPets]);

  const breedPets = useMemo(() => {
    if (!animalId || !breedId) {
      return [];
    }

    return pets.filter((pet) => {
      const categoryMatches =
        createSlug(pet.category) ===
        animalId;

      const breedMatches =
        createSlug(
          pet.breed ?? "",
        ) === breedId;

      return (
        categoryMatches &&
        breedMatches
      );
    });
  }, [
    pets,
    animalId,
    breedId,
  ]);

  const filteredBreedPets =
    useMemo(() => {
      return breedPets.filter((pet) =>
        matchesSearch(
          `${pet.name} ${
            pet.breed ?? ""
          }`,
          searchTerm,
        ),
      );
    }, [
      breedPets,
      searchTerm,
    ]);

  const isUpdatingLike =
    isAddingLikedPet ||
    isRemovingLikedPet;

  const isLoading =
    petsLoading ||
    (Boolean(user) &&
      likedPetsLoading);

  const breedName =
    breedPets[0]?.breed ??
    formatLabel(
      breedId ?? "pets",
    );

  function handleToggleLike(
    event: MouseEvent<HTMLButtonElement>,
    petId: number,
  ) {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (isUpdatingLike) {
      return;
    }

    if (likedPetIds.has(petId)) {
      removeLikedPet(petId, {
        onError: (error) => {
          console.error(
            "Failed to unlike pet:",
            error,
          );
        },
      });

      return;
    }

    addLikedPet(petId, {
      onError: (error) => {
        console.error(
          "Failed to like pet:",
          error,
        );
      },
    });
  }

  function handleOpenPet(
    petId: number,
  ) {
    navigate(
      `/dashboard/pet/${petId}`,
    );
  }

  if (petsError) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="breed-pets-content"
        >
          <div className="breed-pets-not-found">
            <p>
              {petsErrorDetails instanceof
              Error
                ? petsErrorDetails.message
                : "Failed to load pets."}
            </p>

            <button
              type="button"
              onClick={() => {
                void refetchPets();
              }}
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/pet-category",
                )
              }
            >
              Back to Pets
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="breed-pets-content"
      >
        <div className="breed-pets">
          <header className="breed-pets-header">
            <button
              type="button"
              className="breed-pets-back"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>{breedName}</h1>
          </header>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search pets..."
          />

          {isLoading && (
            <p className="breed-pets-empty">
              Loading pets...
            </p>
          )}

          {!isLoading &&
            likedPetsError && (
              <p className="breed-pets-empty">
                Failed to load liked pets.
                You can still browse pets.
              </p>
            )}

          {!isLoading &&
            breedPets.length === 0 && (
              <div className="breed-pets-not-found">
                <p>
                  No {breedName} pets are
                  available yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/breed-selection/${
                        animalId ?? ""
                      }`,
                    )
                  }
                >
                  Back to Breeds
                </button>
              </div>
            )}

          {!isLoading &&
            breedPets.length > 0 &&
            filteredBreedPets.length ===
              0 && (
              <p className="breed-pets-empty">
                No pets match your search.
              </p>
            )}

          {!isLoading &&
            filteredBreedPets.length >
              0 && (
              <div className="breed-pets-grid">
                {filteredBreedPets.map(
                  (pet) => {
                    const isLiked =
                      likedPetIds.has(
                        pet.id,
                      );

                    const status =
                      pet.status
                        .trim()
                        .toLowerCase();

                    return (
                      <div
                        className="breed-pets-card"
                        key={pet.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${pet.name}`}
                        onClick={() =>
                          handleOpenPet(
                            pet.id,
                          )
                        }
                        onKeyDown={(
                          event,
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();

                            handleOpenPet(
                              pet.id,
                            );
                          }
                        }}
                      >
                        <button
                          type="button"
                          className={`breed-pets-like ${
                            isLiked
                              ? "is-liked"
                              : ""
                          }`}
                          aria-label={
                            isLiked
                              ? `Unlike ${pet.name}`
                              : `Like ${pet.name}`
                          }
                          onClick={(
                            event,
                          ) =>
                            handleToggleLike(
                              event,
                              pet.id,
                            )
                          }
                          disabled={
                            isUpdatingLike
                          }
                        >
                          <IonIcon
                            icon={
                              isLiked
                                ? heart
                                : heartOutline
                            }
                          />
                        </button>

                        <img
                          src={getPetImage(
                            pet.image,
                          )}
                          alt={pet.name}
                          loading="lazy"
                          onError={
                            handlePetImageError
                          }
                        />

                        <span>
                          {pet.name}
                        </span>

                        <small>
                          {status ===
                          "available"
                            ? "Available"
                            : status ===
                                "booked"
                              ? "Booked"
                              : "Unavailable"}
                        </small>
                      </div>
                    );
                  },
                )}
              </div>
            )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BreedPets;