import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";

import {getPetImage,handlePetImageError,} from "../utils/petImage";
import "../style/BookingConfirmation.css";

type BookingConfirmationState = {
  bookingId?: number;
  status?: string;
  photo?: string;
  name?: string;
  category?: string;
  subtitle?: string;
  date?: string;
  time?: string;
  reservationDate?: string;
  timeSlot?: string | null;
  durationMinutes?: number | null;
};

function formatStatus(status?: string) {
  if (!status) {
    return "Pending";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()
  );
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking =
    location.state as
      | BookingConfirmationState
      | undefined;

  if (!booking?.name) {
    return (
      <IonPage>
        <IonContent
          fullscreen
          className="booking-confirmation-content"
        >
          <div className="booking-confirmation-empty">
            <p>No booking found.</p>

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

  const displayDate =
    booking.date ??
    booking.reservationDate ??
    "Date not specified";

  const displayTime =
    booking.time ??
    booking.timeSlot ??
    "Time not specified";

  const statusLabel = formatStatus(
    booking.status,
  );

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="booking-confirmation-content"
      >
        <div className="booking-confirmation">
          <IonIcon
            icon={checkmarkCircle}
            className="booking-confirmation-check"
          />

          <h1>Booking Submitted!</h1>

          <p className="booking-confirmation-subtitle">
            Your booking has been successfully
            submitted and is now visible in your
            bookings.
          </p>

          <div className="booking-confirmation-card">
            <img
                  src={getPetImage(
                    booking.photo,
                  )}
                  alt={booking.name}
                  onError={handlePetImageError}
                />

            <div>
              <p className="booking-confirmation-name">
                {booking.name}
              </p>

              <p className="booking-confirmation-detail">
                {booking.category
                  ? `${booking.category} • `
                  : ""}

                {booking.subtitle ??
                  "Breed not specified"}
              </p>

              <p className="booking-confirmation-detail">
                {displayDate} • {displayTime}
              </p>

              {booking.durationMinutes && (
                <p className="booking-confirmation-detail">
                  Duration:{" "}
                  {booking.durationMinutes} minutes
                </p>
              )}

              <p className="booking-confirmation-detail">
                Status:{" "}
                <strong>{statusLabel}</strong>
              </p>

              {booking.bookingId && (
                <p className="booking-confirmation-detail">
                  Booking #{booking.bookingId}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="booking-confirmation-btn"
            onClick={() =>
              navigate("/my-bookings", {
                replace: true,
              })
            }
          >
            View My Bookings
          </button>

          <button
            type="button"
            className="booking-confirmation-btn booking-confirmation-btn--outline"
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
};

export default BookingConfirmation;