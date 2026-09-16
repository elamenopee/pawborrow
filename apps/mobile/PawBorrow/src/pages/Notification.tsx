import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import {
  chevronBackOutline,
  checkmarkCircle,
  closeCircle,
  timeOutline,
} from "ionicons/icons";
import { useNavigate } from "react-router-dom";
import {
  useBookings,
  type Booking,
} from "@repo/api";

import "../style/Notification.css";

type BookingNotification = {
  id: string;
  type:
    | "confirmed"
    | "cancelled"
    | "pending"
    | "completed";
  message: string;
  createdAt: string;
  timestamp: number;
};

function formatNotificationDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    date.toDateString() ===
    today.toDateString()
  ) {
    return "Today";
  }

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatReservationDate(
  value: string,
) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string | null) {
  if (!value) {
    return "the selected time";
  }

  const [hourText, minuteText] =
    value.split(":");

  const hour = Number(hourText);
  const minute = Number(minuteText ?? "0");

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return value;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function createNotification(
  booking: Booking,
): BookingNotification {
  const status =
    booking.status.toLowerCase();

  const petName =
    booking.pet?.name ?? "your pet";

  const date = formatReservationDate(
    booking.reservation_date,
  );

  const time = formatTime(
    booking.time_slot,
  );

  let type: BookingNotification["type"] =
    "pending";

  let message = `Your booking with ${petName} for ${date} at ${time} is waiting for confirmation.`;

  if (status === "confirmed") {
    type = "confirmed";
    message = `Your booking with ${petName} is confirmed for ${date} at ${time}.`;
  } else if (status === "cancelled") {
    type = "cancelled";
    message = `Your booking with ${petName} for ${date} at ${time} was cancelled.`;
  } else if (status === "completed") {
    type = "completed";
    message = `Your booking with ${petName} on ${date} has been completed.`;
  }

  const timestamp = new Date(
    booking.created_at,
  ).getTime();

  return {
    id: `booking-${booking.booking_id}`,
    type,
    message,
    createdAt: formatNotificationDate(
      booking.created_at,
    ),
    timestamp: Number.isNaN(timestamp)
      ? 0
      : timestamp,
  };
}

export const Notification = () => {
  const navigate = useNavigate();

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBookings();

  const notifications = bookings
    .map(createNotification)
    .sort(
      (first, second) =>
        second.timestamp - first.timestamp,
    );

  const groups = notifications.reduce<
    Record<string, BookingNotification[]>
  >((result, notification) => {
    const date = notification.createdAt;

    if (!result[date]) {
      result[date] = [];
    }

    result[date].push(notification);

    return result;
  }, {});

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="notifications-content"
      >
        <div className="notifications">
          <header className="notifications-header">
            <button
              type="button"
              className="notifications-back"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <IonIcon
                icon={chevronBackOutline}
              />
            </button>

            <h1>Notifications</h1>
          </header>

          {isLoading && (
            <p className="notifications-empty">
              Loading notifications...
            </p>
          )}

          {isError && (
            <div className="notifications-empty">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load notifications."}
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
            notifications.length === 0 && (
              <p className="notifications-empty">
                No notifications yet.
              </p>
            )}

          {!isLoading &&
            !isError &&
            Object.entries(groups).map(
              ([date, group]) => (
                <div
                  className="notifications-section"
                  key={date}
                >
                  <p className="notifications-date">
                    {date}
                  </p>

                  <div className="notifications-card">
                    {group.map(
                      (notification) => {
                        const isCancelled =
                          notification.type ===
                          "cancelled";

                        const isPending =
                          notification.type ===
                          "pending";

                        return (
                          <div
                            className="notifications-row"
                            key={
                              notification.id
                            }
                          >
                            <span
                              className="notifications-icon"
                              style={
                                isCancelled
                                  ? {
                                      background:
                                        "#fbe2e1",
                                      color:
                                        "#e0433d",
                                    }
                                  : isPending
                                    ? {
                                        background:
                                          "#fff3cd",
                                        color:
                                          "#9a6700",
                                      }
                                    : undefined
                              }
                            >
                              <IonIcon
                                icon={
                                  isCancelled
                                    ? closeCircle
                                    : isPending
                                      ? timeOutline
                                      : checkmarkCircle
                                }
                              />
                            </span>

                            <p>
                              {
                                notification.message
                              }
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ),
            )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Notification;