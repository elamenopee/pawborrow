import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useLikedPets,
  useRemoveLikedPet,
  type LikedPet,
} from "@repo/api";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import "@/styles/Favorites.css";

interface LikedPetCardProps {
  likedPet: LikedPet;
  onDelete: (petId: number) => void;
  isDeleting: boolean;
}

function LikedPetCard({
  likedPet,
  onDelete,
  isDeleting,
}: LikedPetCardProps) {
  const navigate = useNavigate();
  const pet = likedPet.pet;

  if (!pet) return null;

  const normalizedStatus =
    pet.status?.toLowerCase() ?? "";

  const isAvailable =
    normalizedStatus === "available";

  const statusLabel =
    normalizedStatus === "available"
      ? "Available"
      : normalizedStatus === "booked"
        ? "Booked"
        : normalizedStatus === "unavailable"
          ? "Unavailable"
          : pet.status || "Unknown";

  const statusClass = isAvailable
    ? "liked-card__status--available"
    : normalizedStatus === "booked"
      ? "liked-card__status--booked"
      : "liked-card__status--unavailable";

  function handleBookAgain() {
    if (!pet || !isAvailable) return;

    const hourlyRate = Number(
      pet.category?.hourly_rate ?? 0,
    );

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate <= 0
    ) {
      console.error(
        "This pet does not have a valid hourly rate.",
      );
      return;
    }

    navigate("/booking", {
      state: {
        pet: {
          id: pet.pet_id,
          name: pet.name,
          breed: pet.breed ?? "",
          image:
            pet.image_url ??
            "/images/pet-placeholder.jpg",
          status: pet.status,
          category:
            pet.category?.category_name ?? "",
          hourlyRate,
        },
      },
    });
  }

  return (
    <div
      className={`liked-card ${
        !isAvailable ? "liked-card--unavailable" : ""
      }`}
    >
      <div className="liked-card__image">
        <img
          src={
            pet.image_url ??
            "/images/pet-placeholder.jpg"
          }
          alt={pet.name}
        />

        <span
          className={`liked-card__status ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="liked-card__body">
        <div className="liked-card__title-row">
          <h3>{pet.name}</h3>

          <button
            type="button"
            className="liked-card__heart"
            aria-label={`Unlike ${pet.name}`}
            onClick={() => onDelete(pet.pet_id)}
            disabled={isDeleting}
          >
            <Heart
              size={18}
              fill="#f26d6d"
              stroke="#f26d6d"
            />
          </button>
        </div>

        <div className="liked-card__meta-block">
          <p className="liked-card__meta">
            Breed: {pet.breed ?? "Not specified"}
          </p>

          {pet.category?.category_name && (
            <p className="liked-card__meta">
              Category:{" "}
              {pet.category.category_name}
            </p>
          )}

          <p className="liked-card__meta">
            Status: <strong>{statusLabel}</strong>
          </p>
        </div>

        <p className="liked-card__booked">
          Liked{" "}
          {new Date(
            likedPet.created_at,
          ).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="liked-card__actions">
          <button
            type="button"
            className="btn btn--book-again"
            onClick={handleBookAgain}
            disabled={!isAvailable}
          >
            {isAvailable ? "Book Now" : statusLabel}
          </button>

          <button
            type="button"
            className="btn btn--delete"
            onClick={() => onDelete(pet.pet_id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Removing..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LikedPets() {
  const {
    data: likedPets = [],
    isLoading,
    error,
  } = useLikedPets();

  const {
    mutate: removePet,
    isPending: isDeleting,
    error: deleteError,
  } = useRemoveLikedPet();

  function handleDelete(petId: number) {
    removePet(petId, {
      onSuccess: () => {
        console.log(
          "Pet removed from liked pets:",
          petId,
        );
      },

      onError: (removeError) => {
        console.error(
          "Failed to remove liked pet:",
          removeError,
        );
      },
    });
  }

  const displayedError =
    error ?? deleteError;

  return (
    <>
      <Navbar />

      <main className="favorites-page">
        <div className="favorites-tabs">
          <Link
            to="/bookings"
            className="favorites-tab"
          >
            Booking History
          </Link>

          <Link
            to="/favorites"
            className="favorites-tab is-active"
          >
            Pets You Liked
          </Link>
        </div>

        <section className="favorites-section">
          <h1 className="favorites-heading">
            Pets You Liked
          </h1>

          {isLoading && (
            <p className="favorites-empty">
              Loading liked pets...
            </p>
          )}

          {displayedError && (
            <p
              className="favorites-empty"
              role="alert"
            >
              {displayedError instanceof Error
                ? displayedError.message
                : "Failed to load liked pets."}
            </p>
          )}

          {!isLoading &&
            !displayedError &&
            likedPets.length === 0 && (
              <p className="favorites-empty">
                You haven't liked any pets yet.
              </p>
            )}

          {!isLoading &&
            !displayedError &&
            likedPets.length > 0 && (
              <div className="liked-grid">
                {likedPets.map((likedPet) => (
                  <LikedPetCard
                    key={likedPet.liked_pet_id}
                    likedPet={likedPet}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
        </section>
      </main>

      <Footer />
    </>
  );
}