import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import {
  chevronBackOutline,
  calendarOutline,
  timeOutline,
  cardOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  type CreateBookingInput,
} from "@repo/api";

import { mockCards } from "../data/paymentMethods";
import "../style/BookingReview.css";

type BookingDraft = {
  petId: number;
  photo: string;
  name: string;
  category: string;
  subtitle: string;
  reservationDate: string;
  timeSlot: string;
  durationMinutes: number;
  displayDate: string;
  displayTime: string;
  detail?: string;
};

type BookingReviewState = {
  draft?: BookingDraft;
  selectedCardId?: string;
  returnTo?: string;
} & Partial<BookingDraft>;

type CreatedBooking = {
  booking_id?: number;
  status?: string;
  reservation_date?: string;
  time_slot?: string | null;
  duration_minutes?: number | null;
};

const BookingReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const locationState =
    location.state as BookingReviewState | undefined;

  /*
   * Supports both navigation formats:
   *
   * 1. PetDetails:
   *    navigate("/booking-review", { state: bookingDraft })
   *
   * 2. PaymentMethods:
   *    navigate("/booking-review", {
   *      state: { draft, selectedCardId, returnTo }
   *    })
   */
  const draft: BookingDraft | undefined =
    locationState?.draft ??
    (locationState?.petId
      ? (locationState as BookingDraft)
      : undefined);

  const returnTo =
    locationState?.returnTo ?? "/dashboard";

  const [selectedCardId, setSelectedCardId] =
    useState(
      locationState?.selectedCardId ??
        mockCards[0]?.id ??
        "",
    );

  const selectedCard = mockCards.find(
    (card) => card.id === selectedCardId,
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleBack = () => {
    navigate(returnTo, {
      replace: true,
    });
  };

  const handlePaymentSelect = () => {
    if (!draft) return;

    navigate("/payment-methods", {
      state: {
        draft,
        selectedCardId,
        returnTo,
      },
    });
  };

  const handleConfirm = async () => {
    if (!draft || isSubmitting) return;

    if (!selectedCard) {
      setError(
        "Please select a payment method before confirming.",
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const input: CreateBookingInput = {
      pet_id: draft.petId,
      reservation_date: draft.reservationDate,
      time_slot: draft.timeSlot,
      duration_minutes: draft.durationMinutes,
    };

    try {
      const result = await createBooking(input);

      /*
       * Supports a Supabase RPC returning either:
       * - one booking object
       * - an array containing one booking object
       */
      const createdBooking = (
        Array.isArray(result) ? result[0] : result
      ) as CreatedBooking | undefined;

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pets"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      navigate("/booking-confirmation", {
        state: {
          bookingId: createdBooking?.booking_id,
          status:
            createdBooking?.status ?? "pending",
          photo: draft.photo,
          name: draft.name,
          category: draft.category,
          subtitle: draft.subtitle,
          date: draft.displayDate,
          time: draft.displayTime,
          reservationDate:
            createdBooking?.reservation_date ??
            draft.reservationDate,
          timeSlot:
            createdBooking?.time_slot ??
            draft.timeSlot,
          durationMinutes:
            createdBooking?.duration_minutes ??
            draft.durationMinutes,
        },
        replace: true,
      });
    } catch (err) {
      console.error(
        "Failed to create booking:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="booking-review-content"
        >
          <div className="booking-review-empty">
            <p>Nothing to review.</p>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard", {
                  replace: true,
                })
              }
            >
              Back to Home
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
        className="booking-review-content"
      >
        <div className="booking-review">
          <header className="booking-review-header">
            <button
              type="button"
              className="booking-review-back"
              aria-label="Go back"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <IonIcon icon={chevronBackOutline} />
            </button>

            <h1>Confirm Booking</h1>
          </header>

          <div className="booking-review-card">
            <img
              src={draft.photo}
              alt={draft.name}
            />

            <div>
              <p className="booking-review-name">
                {draft.name}
              </p>

              <p className="booking-review-subtitle">
                {draft.category} • {draft.subtitle}
              </p>
            </div>
          </div>

          <div className="booking-review-details">
            <div className="booking-review-row">
              <span className="booking-review-row-label">
                <IonIcon icon={calendarOutline} />
                Date
              </span>

              <span className="booking-review-row-value">
                {draft.displayDate}
              </span>
            </div>

            <div className="booking-review-row">
              <span className="booking-review-row-label">
                <IonIcon icon={timeOutline} />
                Time
              </span>

              <span className="booking-review-row-value">
                {draft.displayTime}
              </span>
            </div>

            <div className="booking-review-row">
              <span className="booking-review-row-label">
                Duration
              </span>

              <span className="booking-review-row-value">
                {draft.durationMinutes} minutes
              </span>
            </div>

            {draft.detail && (
              <div className="booking-review-row">
                <span className="booking-review-row-label">
                  Details
                </span>

                <span className="booking-review-row-value">
                  {draft.detail}
                </span>
              </div>
            )}
          </div>

          <p className="booking-review-section-title">
            Payment Method
          </p>

          {mockCards.length === 0 ? (
            <button
              type="button"
              className="booking-review-payment booking-review-payment--empty"
              onClick={handlePaymentSelect}
              disabled={isSubmitting}
            >
              <span className="booking-review-payment-icon">
                <IonIcon icon={cardOutline} />
              </span>

              <span className="booking-review-payment-label">
                Add a payment method
              </span>

              <IonIcon
                icon={chevronForwardOutline}
                className="booking-review-payment-arrow"
              />
            </button>
          ) : (
            <button
              type="button"
              className="booking-review-payment"
              onClick={handlePaymentSelect}
              disabled={isSubmitting}
            >
              <span className="booking-review-payment-icon">
                <IonIcon icon={cardOutline} />
              </span>

              <div className="booking-review-payment-info">
                <p className="booking-review-payment-brand">
                  {selectedCard?.brand ??
                    "Select payment method"}
                </p>

                {selectedCard && (
                  <p className="booking-review-payment-number">
                    •••• {selectedCard.last4}
                  </p>
                )}
              </div>

              <IonIcon
                icon={chevronForwardOutline}
                className="booking-review-payment-arrow"
              />
            </button>
          )}

          {error && (
            <p
              className="booking-review-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <p className="booking-review-note">
            Please review your booking details
            carefully. You can go back to change the
            date or time before confirming.
          </p>
        </div>

        <div className="booking-review-footer">
          <button
            type="button"
            className="booking-review-cancel"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </button>

          <button
            type="button"
            className="booking-review-confirm"
            onClick={handleConfirm}
            disabled={
              !selectedCard || isSubmitting
            }
          >
            {isSubmitting
              ? "Booking..."
              : "Confirm Booking"}
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BookingReview;