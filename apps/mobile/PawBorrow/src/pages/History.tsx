import { useMemo } from "react";
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
  useBookings,
  type Booking,
} from "@repo/api";
import {getPetImage, handlePetImageError,} from "../utils/petImage";
import "../style/History.css";

function formatDate(dateValue: string) {
  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(
  timeValue: string | null,
) {
  if (!timeValue) {
    return "Time not specified";
  }

  const [hourText, minuteText] =
    timeValue.split(":");

  const hour = Number(hourText);
  const minute = Number(
    minuteText ?? "0",
  );

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return timeValue;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function formatStatus(status: string) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()
  );
}

const History = () => {
  const navigate = useNavigate();

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBookings();

  const groups = useMemo(() => {
    return bookings.reduce<
      Record<string, Booking[]>
    >((result, booking) => {
      const date = formatDate(
        booking.reservation_date,
      );

      if (!result[date]) {
        result[date] = [];
      }

      result[date].push(booking);

      return result;
    }, {});
  }, [bookings]);

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="booking-history-content"
      >
        <div className="booking-history">
          <header className="booking-history-header">
            <button
              type="button"
              className="booking-history-back"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>Booking History</h1>
          </header>

          {isLoading && (
            <p className="booking-history-empty">
              Loading booking history...
            </p>
          )}

          {isError && (
            <div className="booking-history-empty">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load booking history."}
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
              <p className="booking-history-empty">
                No bookings yet.
              </p>
            )}

          {!isLoading &&
            !isError &&
            Object.entries(groups).map(
              ([date, group]) => (
                <div
                  className="booking-history-section"
                  key={date}
                >
                  <p className="booking-history-date">
                    {date}
                  </p>

                  {group.map((booking) => {
                    const normalizedStatus =
                      booking.status.toLowerCase();

                    return (
                      <div
                        className="booking-history-card"
                        key={
                          booking.booking_id
                        }
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

                        <div className="booking-history-info">
                          <p className="booking-history-line">
                            <strong>
                              {booking.pet?.name ??
                                "Unknown pet"}
                            </strong>
                          </p>

                          <p className="booking-history-line">
                            Breed:{" "}
                            {booking.pet?.breed ??
                              "Not specified"}
                          </p>

                          <p className="booking-history-line">
                            <IonIcon
                              icon={
                                calendarOutline
                              }
                            />{" "}
                            {date}
                          </p>

                          <p className="booking-history-line">
                            <IonIcon
                              icon={timeOutline}
                            />{" "}
                            {formatTime(
                              booking.time_slot,
                            )}
                          </p>

                          {booking.duration_minutes && (
                            <p className="booking-history-line">
                              Duration:{" "}
                              {
                                booking.duration_minutes
                              }{" "}
                              minutes
                            </p>
                          )}

                          <span
                            className={`booking-history-status booking-history-status--${normalizedStatus}`}
                          >
                            {formatStatus(
                              booking.status,
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
            )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default History;