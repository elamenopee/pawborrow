import {
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  calendarOutline,
  chevronBackOutline,
  timeOutline,
} from "ionicons/icons";
import { usePets } from "@repo/api";

import {
  getPetImage,
  handlePetImageError,
} from "../utils/petImage";
import "../style/PetDetails.css";

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(
  dateValue: string,
): string {
  if (!dateValue) {
    return "";
  }

  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatDisplayTime(
  timeValue: string,
): string {
  if (!timeValue) {
    return "";
  }

  const date = new Date(
    `1970-01-01T${timeValue}:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return timeValue;
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

const PetDetails: React.FC = () => {
  const { petId } = useParams<{
    petId: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: pets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePets();

  const pet = useMemo(() => {
    const numericPetId = Number(petId);

    if (
      !Number.isInteger(numericPetId) ||
      numericPetId <= 0
    ) {
      return undefined;
    }

    return pets.find(
      (item) =>
        item.id === numericPetId,
    );
  }, [pets, petId]);

  const [
    reservationDate,
    setReservationDate,
  ] = useState("");

  const [startTime, setStartTime] =
    useState("09:00");

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState(60);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  if (isLoading) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="pet-details-content"
        >
          <div className="pet-details-not-found">
            <p>Loading pet...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (isError) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="pet-details-content"
        >
          <div className="pet-details-not-found">
            <p>
              {error instanceof Error
                ? error.message
                : "Failed to load pet."}
            </p>

            <button
              type="button"
              onClick={() => {
                void refetch();
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

  if (!pet) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="pet-details-content"
        >
          <div className="pet-details-not-found">
            <p>Pet not found.</p>

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

  const currentPet = pet;

  const normalizedStatus =
    currentPet.status
      .trim()
      .toLowerCase();

  const isAvailable =
    normalizedStatus === "available";

  function clearValidationError() {
    setValidationError("");
  }

  function handleBookNow() {
    clearValidationError();

    if (!isAvailable) {
      setValidationError(
        "This pet is currently unavailable.",
      );
      return;
    }

    if (!reservationDate) {
      setValidationError(
        "Please select a reservation date.",
      );
      return;
    }

    if (reservationDate < getToday()) {
      setValidationError(
        "The reservation date cannot be in the past.",
      );
      return;
    }

    if (!startTime) {
      setValidationError(
        "Please select a start time.",
      );
      return;
    }

    if (
      durationMinutes < 30 ||
      durationMinutes % 15 !== 0
    ) {
      setValidationError(
        "Duration must be at least 30 minutes and use 15-minute increments.",
      );
      return;
    }

    navigate("/booking-review", {
      state: {
        petId: currentPet.id,
        photo: getPetImage(
          currentPet.image,
        ),
        name: currentPet.name,
        category: currentPet.category,
        subtitle:
          currentPet.breed ??
          "Unknown breed",
        reservationDate,
        timeSlot: startTime,
        durationMinutes,
        displayDate:
          formatDisplayDate(
            reservationDate,
          ),
        displayTime:
          formatDisplayTime(
            startTime,
          ),
        detail:
          `${durationMinutes} minutes`,
        returnTo: location.pathname,
      },
    });
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="pet-details-content"
      >
        <div className="pet-details-photo-wrap">
          <img
            src={getPetImage(
              currentPet.image,
            )}
            alt={currentPet.name}
            onError={handlePetImageError}
          />

          <button
            type="button"
            className="pet-details-back"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            <IonIcon
              icon={chevronBackOutline}
            />
          </button>

          <h1 className="pet-details-photo-title">
            Pet
          </h1>
        </div>

        <div className="pet-details-sheet">
          <p className="pet-details-label">
            Name
          </p>

          <h2 className="pet-details-name">
            {currentPet.name}
          </h2>

          <div className="pet-details-stats">
            <div className="pet-details-stat">
              <p className="pet-details-stat-label">
                Category
              </p>

              <p className="pet-details-stat-value">
                {currentPet.category}
              </p>
            </div>

            <div className="pet-details-stat">
              <p className="pet-details-stat-label">
                Breed
              </p>

              <p className="pet-details-stat-value">
                {currentPet.breed ??
                  "Not specified"}
              </p>
            </div>

            <div className="pet-details-stat">
              <p className="pet-details-stat-label">
                Status
              </p>

              <p className="pet-details-stat-value">
                {isAvailable
                  ? "Available"
                  : normalizedStatus ===
                      "booked"
                    ? "Booked"
                    : "Unavailable"}
              </p>
            </div>
          </div>

          <h3 className="pet-details-section-title">
            Personality
          </h3>

          <p className="pet-details-about">
            {currentPet.personality
              .length > 0
              ? currentPet.personality.join(
                  ", ",
                )
              : "No personality information provided."}
          </p>

          <div className="pet-details-days-header">
            <h3 className="pet-details-section-title">
              Reservation Date
            </h3>

            <span className="pet-details-month">
              <IonIcon
                icon={calendarOutline}
              />

              {reservationDate
                ? formatDisplayDate(
                    reservationDate,
                  )
                : "Select a date"}
            </span>
          </div>

          <input
            type="date"
            min={getToday()}
            value={reservationDate}
            className="pet-details-date-input"
            disabled={!isAvailable}
            onChange={(event) => {
              setReservationDate(
                event.target.value,
              );

              clearValidationError();
            }}
          />

          <h3 className="pet-details-section-title">
            Start Time
          </h3>

          <div className="pet-details-time-input-wrap">
            <IonIcon
              icon={timeOutline}
            />

            <input
              type="time"
              value={startTime}
              className="pet-details-time-input"
              disabled={!isAvailable}
              onChange={(event) => {
                setStartTime(
                  event.target.value,
                );

                clearValidationError();
              }}
            />
          </div>

          <h3 className="pet-details-section-title">
            Duration
          </h3>

          <div className="pet-details-duration">
            <button
              type="button"
              aria-label="Decrease duration"
              onClick={() => {
                setDurationMinutes(
                  (current) =>
                    Math.max(
                      30,
                      current - 15,
                    ),
                );

                clearValidationError();
              }}
              disabled={
                !isAvailable ||
                durationMinutes <= 30
              }
            >
              −
            </button>

            <span>
              {durationMinutes} minutes
            </span>

            <button
              type="button"
              aria-label="Increase duration"
              onClick={() => {
                setDurationMinutes(
                  (current) =>
                    current + 15,
                );

                clearValidationError();
              }}
              disabled={!isAvailable}
            >
              +
            </button>
          </div>

          {validationError && (
            <p
              className="pet-details-error"
              role="alert"
            >
              {validationError}
            </p>
          )}

          <button
            type="button"
            className="pet-details-book-btn"
            onClick={handleBookNow}
            disabled={!isAvailable}
          >
            {isAvailable
              ? "Book Now"
              : normalizedStatus ===
                  "booked"
                ? "Already Booked"
                : "Unavailable"}
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PetDetails;