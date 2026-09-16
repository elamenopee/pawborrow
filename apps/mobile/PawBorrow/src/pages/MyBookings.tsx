import { useNavigate } from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import {
  chevronBackOutline,
  calendarOutline,
  timeOutline,
} from "ionicons/icons";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useBookings,
  updateBookingStatus,
  type Booking,
} from "@repo/api";

import {getPetImage, handlePetImageError,} from "../utils/petImage";
import "../style/MyBookings.css";

function formatBookingDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBookingTime(time: string | null) {
  if (!time) {
    return "Time not specified";
  }

  const [hoursText, minutesText] = time.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText ?? "0");

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function canCancelBooking(booking: Booking) {
  const status = booking.status.toLowerCase();

  return (
    status === "pending" ||
    status === "confirmed"
  );
}

const MyBookings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBookings();

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) =>
      updateBookingStatus(
        bookingId,
        "cancelled",
      ),

    onSuccess: async () => {
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
    },
  });

  function handleCancelBooking(
    bookingId: number,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) {
      return;
    }

    cancelBookingMutation.mutate(bookingId);
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="my-bookings-content"
      >
        <div className="my-bookings">
          <header className="my-bookings-header">
            <button
              type="button"
              className="my-bookings-back"
              aria-label="Go back"
              onClick={() => navigate("/profile")}
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>My Bookings</h1>
          </header>

          {isLoading && (
            <p className="my-bookings-empty">
              Loading your bookings...
            </p>
          )}

          {isError && (
            <div className="my-bookings-empty">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load your bookings."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            bookings.length === 0 && (
              <p className="my-bookings-empty">
                You have no bookings yet.
              </p>
            )}

          {!isLoading &&
            !isError &&
            bookings.length > 0 && (
              <div className="my-bookings-list">
                {bookings.map((booking) => {
                  const normalizedStatus =
                    booking.status.toLowerCase();

                  const isCancelling =
                    cancelBookingMutation.isPending &&
                    cancelBookingMutation.variables ===
                      booking.booking_id;

                  return (
                    <div
                      className="my-bookings-card"
                      key={booking.booking_id}
                    >
                     <img
                            src={getPetImage(
                              booking.pet?.image_url,
                            )}
                            alt={
                              booking.pet?.name ??
                              "Pet"
                            }
                            loading="lazy"
                            onError={handlePetImageError}
                          />

                      <div className="my-bookings-info">
                        <p className="my-bookings-name">
                          {booking.pet?.name ??
                            "Unknown pet"}
                        </p>

                        <p className="my-bookings-subtitle">
                          {booking.pet?.breed ??
                            "Breed not specified"}
                        </p>

                        <div className="my-bookings-meta">
                          <span>
                            <IonIcon
                              icon={
                                calendarOutline
                              }
                            />

                            {formatBookingDate(
                              booking.reservation_date,
                            )}
                          </span>

                          <span>
                            <IonIcon
                              icon={timeOutline}
                            />

                            {formatBookingTime(
                              booking.time_slot,
                            )}
                          </span>
                        </div>

                        {booking.duration_minutes && (
                          <p className="my-bookings-subtitle">
                            Duration:{" "}
                            {
                              booking.duration_minutes
                            }{" "}
                            minutes
                          </p>
                        )}

                        <span
                          className={`my-bookings-status my-bookings-status--${normalizedStatus}`}
                        >
                          {getStatusLabel(
                            booking.status,
                          )}
                        </span>
                      </div>

                      {canCancelBooking(
                        booking,
                      ) && (
                        <button
                          type="button"
                          className="my-bookings-cancel"
                          onClick={() =>
                            handleCancelBooking(
                              booking.booking_id,
                            )
                          }
                          disabled={isCancelling}
                        >
                          {isCancelling
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          {cancelBookingMutation.isError && (
            <p
              className="my-bookings-error"
              role="alert"
            >
              {cancelBookingMutation.error instanceof
              Error
                ? cancelBookingMutation.error
                    .message
                : "Failed to cancel the booking."}
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MyBookings;