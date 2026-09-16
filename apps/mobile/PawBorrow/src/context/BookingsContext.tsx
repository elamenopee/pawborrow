import { notifications } from "ionicons/icons";
import { createContext, useContext, useState, ReactNode } from "react";

export interface Booking {
  id: string;
  type: "pet" | "doctor";
  category: string;
  name: string;
  subtitle: string;
  detail?: string;
  photo: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

export interface AppNotification {
  id: string;
  type: "confirmed" | "cancelled";
  message: string;
  createdAt: string; // real calendar date this event happened, e.g. "13 February"
  isRead: boolean;
}

interface BookingsContextValue {
  bookings: Booking[];
  notifications: AppNotification[];
  addBooking: (booking: Omit<Booking, "id" | "status">) => Booking;
  cancelBooking: (id: string) => void;
  markNotificationsAsRead: () => void;
}

const BookingsContext = createContext<BookingsContextValue | undefined>(
  undefined,
);

const formatToday = () =>
  new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long" });

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addBooking = (booking: Omit<Booking, "id" | "status">) => {
    const newBooking: Booking = {
      ...booking,
      id: `${Date.now()}`,
      status: "Upcoming",
    };
    setBookings((prev) => [newBooking, ...prev]);

    setNotifications((prev) => [
      {
        id: `${Date.now()}-confirmed`,
        type: "confirmed",
        message: `Your booking with ${newBooking.name} is confirmed for ${newBooking.date} at ${newBooking.time}.`,
        createdAt: formatToday(),
        isRead: false,
      },
      ...prev,
    ]);

    return newBooking;
  };

  const cancelBooking = (id: string) => {
    const cancelled = bookings.find((b) => b.id === id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b)),
    );

    if (cancelled) {
      setNotifications((prev) => [
        {
          id: `${Date.now()}-cancelled`,
          type: "cancelled",
          message: `Your booking with ${cancelled.name} was cancelled.`,
          createdAt: formatToday(),
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        notifications,
        addBooking,
        cancelBooking,
        markNotificationsAsRead,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingsContext);
  if (!ctx)
    throw new Error("useBookings must be used within a BookingsProvider");
  return ctx;
};
