import { useState } from "react";
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
  chevronBackOutline,
  star,
  starOutline,
} from "ionicons/icons";
import { useCreateReview } from "@repo/api";

import {
  getPetImage,
  handlePetImageError,
} from "../utils/petImage";
import "../style/Review.css";

type ReviewLocationState = {
  booking?: {
    booking_id: number;
    pet: {
      name: string;
      breed: string | null;
      image_url: string | null;
    } | null;
  };
};

const Review = () => {
  const { bookingId } = useParams<{
    bookingId: string;
  }>();

  const location = useLocation();
  const navigate = useNavigate();

  const locationState =
    location.state as ReviewLocationState | null;

  const booking = locationState?.booking;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const {
    mutate: submitReview,
    isPending,
    error,
  } = useCreateReview();

  function handleSubmit() {
    setValidationError("");
    setSuccessMessage("");

    if (rating === 0) {
      setValidationError(
        "Please select a rating before submitting.",
      );
      return;
    }

    if (!bookingId) {
      setValidationError("Booking ID is missing.");
      return;
    }

    const numericBookingId = Number(bookingId);

    if (
      !Number.isInteger(numericBookingId) ||
      numericBookingId <= 0
    ) {
      setValidationError(
        "The booking ID is invalid.",
      );
      return;
    }

    submitReview(
      {
        booking_id: numericBookingId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMessage(
            "Your review was submitted successfully!",
          );

          window.setTimeout(() => {
            navigate("/my-bookings", {
              replace: true,
              state: {
                reviewSubmitted: true,
              },
            });
          }, 1200);
        },

        onError: (submitError) => {
          console.error(
            "Failed to submit review:",
            submitError,
          );
        },
      },
    );
  }

  const displayedError =
    validationError ||
    (error instanceof Error
      ? error.message
      : error
        ? "Something went wrong while submitting your review."
        : "");

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="mobile-review-content"
      >
        <main className="mobile-review">
          <header className="mobile-review-header">
            <button
              type="button"
              className="mobile-review-back"
              aria-label="Go back"
              onClick={() => navigate("/my-bookings")}
              disabled={isPending}
            >
              <IonIcon icon={chevronBackOutline} />
            </button>

            <h1>Leave a Review</h1>
          </header>

          <section className="mobile-review-card">
            <p className="mobile-review-subtext">
              Tell us about your experience with{" "}
              <strong>
                {booking?.pet?.name ?? "this pet"}
              </strong>
              .
            </p>

            {booking?.pet && (
              <div className="mobile-review-pet">
                <img
                  src={getPetImage(
                    booking.pet.image_url,
                  )}
                  alt={booking.pet.name}
                  onError={handlePetImageError}
                />

                <div>
                  <h2>{booking.pet.name}</h2>

                  <p>
                    {booking.pet.breed ??
                      "Breed not specified"}
                  </p>
                </div>
              </div>
            )}

            <fieldset
              className="mobile-review-rating"
              disabled={isPending}
            >
              <legend>Your rating</legend>

              <div
                className="mobile-review-stars"
                aria-label="Select a rating"
              >
                {[1, 2, 3, 4, 5].map(
                  (starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      className="mobile-review-star"
                      onClick={() => {
                        setRating(starValue);
                        setValidationError("");
                      }}
                      aria-label={`Rate ${starValue} star${
                        starValue > 1 ? "s" : ""
                      }`}
                      aria-pressed={
                        rating === starValue
                      }
                    >
                      <IonIcon
                        icon={
                          starValue <= rating
                            ? star
                            : starOutline
                        }
                      />
                    </button>
                  ),
                )}
              </div>

              <p className="mobile-review-rating-label">
                {rating === 0
                  ? "Tap a star to rate"
                  : `${rating} out of 5 stars`}
              </p>
            </fieldset>

            <label
              className="mobile-review-label"
              htmlFor="mobile-review-comment"
            >
              Your review
            </label>

            <textarea
              id="mobile-review-comment"
              className="mobile-review-textarea"
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              placeholder="How was your experience?"
              maxLength={1000}
              disabled={isPending}
            />

            <p className="mobile-review-character-count">
              {comment.length}/1000
            </p>

            {displayedError && (
              <p
                className="mobile-review-error"
                role="alert"
              >
                {displayedError}
              </p>
            )}

            {successMessage && (
              <p
                className="mobile-review-success"
                role="status"
              >
                {successMessage}
              </p>
            )}

            <button
              type="button"
              className="mobile-review-submit"
              onClick={handleSubmit}
              disabled={
                rating === 0 ||
                isPending ||
                Boolean(successMessage)
              }
            >
              {isPending
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Review;