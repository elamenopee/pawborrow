import { useNavigate } from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import {
  chevronBackOutline,
  heartDislikeOutline,
  heart,
  pawOutline,
} from "ionicons/icons";
import {
  useLikedPets,
  useRemoveLikedPet,
} from "@repo/api";

import { useAuth } from "../context/AuthContext";
import {getPetImage, handlePetImageError,} from "../utils/petImage";
import "../style/LikedPets.css";

const LikedPets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: likedPets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useLikedPets(Boolean(user));

  const {
    mutate: removeLikedPet,
    isPending: isRemoving,
    variables: removingPetId,
    error: removeError,
  } = useRemoveLikedPet();

  function handleRemovePet(
    petId: number,
  ) {
    removeLikedPet(petId, {
      onError: (error) => {
        console.error(
          "Failed to remove liked pet:",
          error,
        );
      },
    });
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="liked-pets-content"
      >
        <div className="liked-pets">
          <header className="liked-pets-header">
            <button
              type="button"
              className="liked-pets-back"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>Liked Pets</h1>
          </header>

          {isLoading && (
            <p className="liked-pets-loading">
              Loading liked pets...
            </p>
          )}

          {isError && (
            <div className="liked-pets-empty">
              <div className="liked-pets-empty-icon">
                <IonIcon
                  icon={heartDislikeOutline}
                />
              </div>

              <h2>Unable to load liked pets</h2>

              <p>
                {error instanceof Error
                  ? error.message
                  : "Something went wrong while loading your liked pets."}
              </p>

              <button
                type="button"
                className="liked-pets-button"
                onClick={() => refetch()}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            likedPets.length === 0 && (
              <div className="liked-pets-empty">
                <div className="liked-pets-empty-icon">
                  <IonIcon
                    icon={
                      heartDislikeOutline
                    }
                  />
                </div>

                <h2>No liked pets yet</h2>

                <p>
                  Browse available pets and
                  save the ones you love.
                </p>

                <button
                  type="button"
                  className="liked-pets-button"
                  onClick={() =>
                    navigate("/pet-category")
                  }
                >
                  <IonIcon
                    icon={pawOutline}
                  />
                  Browse Pets
                </button>
              </div>
            )}

          {!isLoading &&
            !isError &&
            likedPets.length > 0 && (
              <div className="liked-pets-grid">
                {likedPets.map(
                  (likedPet) => {
                    const pet =
                      likedPet.pet;

                    if (!pet) {
                      return null;
                    }

                    const normalizedStatus =
                      pet.status
                        ?.toLowerCase()
                        .trim() ?? "";

                    const isAvailable =
                      normalizedStatus ===
                      "available";

                    const isThisPetRemoving =
                      isRemoving &&
                      Number(
                        removingPetId,
                      ) === pet.pet_id;

                    return (
                      <div
                        className="liked-pet-item"
                        key={
                          likedPet.liked_pet_id
                        }
                      >
                        <button
                          type="button"
                          className="liked-pet-main"
                          onClick={() =>
                            navigate(
                              `/dashboard/pet/${pet.pet_id}`,
                            )
                          }
                        >
                          <div className="liked-pet-image-wrap">
                            <img
                                  src={getPetImage(
                                    pet.image_url,
                                  )}
                                  alt={pet.name}
                                  loading="lazy"
                                  onError={handlePetImageError}
                                />

                            <span
                              className={`liked-pet-status ${
                                isAvailable
                                  ? "liked-pet-status--available"
                                  : "liked-pet-status--unavailable"
                              }`}
                            >
                              {isAvailable
                                ? "Available"
                                : normalizedStatus ===
                                    "booked"
                                  ? "Booked"
                                  : "Unavailable"}
                            </span>
                          </div>

                          <span className="liked-pet-name">
                            {pet.name}
                          </span>

                          <span className="liked-pet-breed">
                            {pet.breed ??
                              "Breed not specified"}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="liked-pet-remove"
                          aria-label={`Unlike ${pet.name}`}
                          onClick={() =>
                            handleRemovePet(
                              pet.pet_id,
                            )
                          }
                          disabled={
                            isThisPetRemoving
                          }
                        >
                          <IonIcon
                            icon={heart}
                          />

                          <span>
                            {isThisPetRemoving
                              ? "Removing..."
                              : "Unlike"}
                          </span>
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            )}

          {removeError && (
            <p
              className="liked-pets-error"
              role="alert"
            >
              {removeError instanceof Error
                ? removeError.message
                : "Failed to remove the liked pet."}
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LikedPets;