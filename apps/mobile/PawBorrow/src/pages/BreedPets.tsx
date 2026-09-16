import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";

import {
  chevronBackOutline,
  heart,
  heartOutline,
} from "ionicons/icons";

import { useEffect, useState } from "react";

import { animalBreeds } from "../data/breeds";
import { pets } from "../data/pets";

import SearchBar from "../components/SearchBar";

import { matchesSearch } from "../assets/images/utils/search";

import {
  useAuth,
  getUserScopedStorageKey,
} from "../context/AuthContext";

import "../style/BreedPets.css";

const BreedPets = () => {
  /* =====================================
     ROUTER
  ===================================== */

  const {
    animalId,
    breedId,
  } = useParams<{
    animalId: string;
    breedId: string;
  }>();

  const navigate = useNavigate();

  /* =====================================
     AUTH
  ===================================== */

  const { user } = useAuth();

  /* =====================================
     USER-SCOPED STORAGE
  ===================================== */

  const likedPetsStorageKey =
    getUserScopedStorageKey(
      "pawborrow-liked-pets",
      user?.email
    );

  /* =====================================
     STATE
  ===================================== */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [likedPetIds, setLikedPetIds] =
    useState<string[]>([]);

  /* =====================================
     LOAD LIKED PETS
  ===================================== */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          likedPetsStorageKey
        );

      setLikedPetIds(
        stored
          ? JSON.parse(stored)
          : []
      );
    } catch {
      setLikedPetIds([]);
    }
  }, [likedPetsStorageKey]);

  /* =====================================
     SAVE LIKED PETS
  ===================================== */

  useEffect(() => {
    localStorage.setItem(
      likedPetsStorageKey,
      JSON.stringify(likedPetIds)
    );
  }, [
    likedPetIds,
    likedPetsStorageKey,
  ]);

  /* =====================================
     FIND CATEGORY
  ===================================== */

  const category =
    animalBreeds.find(
      (category) =>
        category.id === animalId
    );

  /* =====================================
     FIND BREED
  ===================================== */

  const breed =
    category?.breeds.find(
      (breed) =>
        breed.id === breedId
    );

  /* =====================================
     GET PETS FOR BREED
  ===================================== */

  const breedPets =
    pets.filter(
      (pet) =>
        pet.breedId === breedId
    );

  /* =====================================
     SEARCH
  ===================================== */

  const filteredBreedPets =
    breedPets.filter((pet) =>
      matchesSearch(
        pet.name,
        searchTerm
      )
    );

  /* =====================================
     TOGGLE LIKE
  ===================================== */

  const toggleLike = (
    event: React.MouseEvent<HTMLButtonElement>,
    petId: string
  ) => {
    // Prevent the card's onClick
    // from navigating to pet details.
    event.stopPropagation();

    setLikedPetIds((current) => {
      if (current.includes(petId)) {
        return current.filter(
          (id) => id !== petId
        );
      }

      return [
        ...current,
        petId,
      ];
    });
  };

  /* =====================================
     BREED NOT FOUND
  ===================================== */

  if (!breed) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="breed-pets-content"
        >
          <div className="breed-pets-not-found">
            <p>
              Breed not found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Back to Home
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  /* =====================================
     PAGE
  ===================================== */

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="breed-pets-content"
      >
        <div className="breed-pets">

          {/* =============================
              HEADER
          ============================= */}

          <header className="breed-pets-header">

            <button
              type="button"
              className="breed-pets-back"
              aria-label="Go back"
              onClick={() =>
                navigate(-1)
              }
            >
              <IonIcon
                icon={
                  chevronBackOutline
                }
              />
            </button>

            <h1>
              {breed.name}
            </h1>

          </header>

          {/* =============================
              SEARCH
          ============================= */}

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="search pets..."
          />

          {/* =============================
              NO PETS
          ============================= */}

          {breedPets.length === 0 ? (
            <p className="breed-pets-empty">
              No {breed.name} pets
              available yet.
            </p>
          ) : filteredBreedPets.length ===
            0 ? (
            <p className="breed-pets-empty">
              No pets found.
            </p>
          ) : (

            /* ===========================
               PET GRID
            =========================== */

            <div className="breed-pets-grid">

              {filteredBreedPets.map(
                (pet) => {

                  const isLiked =
                    likedPetIds.includes(
                      pet.id
                    );

                  return (
                    <div
                      className="breed-pets-card"
                      key={pet.id}
                      onClick={() =>
                        navigate(
                          `/dashboard/pet/${pet.id}`
                        )
                      }
                    >

                      {/* =================
                          LIKE BUTTON
                      ================= */}

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
                        onClick={(event) =>
                          toggleLike(
                            event,
                            pet.id
                          )
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

                      {/* =================
                          PET IMAGE
                      ================= */}

                      <img
                        src={pet.image}
                        alt={pet.name}
                      />

                      {/* =================
                          PET NAME
                      ================= */}

                      <span>
                        {pet.name}
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default BreedPets;