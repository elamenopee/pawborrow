import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bell,
  CheckCheck,
  LogOut,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  signOut,
  subscribeToNotifications,
  type Notification,
} from "@repo/api";

type HeaderProps = {
  title: string;
};

const ADMIN_NOTIFICATION_TYPES =
  new Set([
    "booking_created",
    "booking_status_changed",
    "payment_submitted",
    "review_created",
    "pet_unavailable",
  ]);

function isAdminNotification(
  notification: Notification,
): boolean {
  return ADMIN_NOTIFICATION_TYPES.has(
    notification.notification_type,
  );
}

function formatNotificationTime(
  createdAt: string,
): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

export default function Header({
  title,
}: HeaderProps) {
  const navigate = useNavigate();

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(true);

  const [
    notificationsError,
    setNotificationsError,
  ] = useState("");

  const [signingOut, setSigningOut] =
    useState(false);

  const [
    markingAllRead,
    setMarkingAllRead,
  ] = useState(false);

  const loadNotifications =
    useCallback(async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const result =
          await getNotifications();

        setNotifications(
          result.filter(
            isAdminNotification,
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error,
        );

        setNotificationsError(
          error instanceof Error
            ? error.message
            : "Failed to load notifications.",
        );
      } finally {
        setNotificationsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let unsubscribe:
      | (() => void)
      | undefined;

    let cancelled = false;

    async function connectRealtime() {
      try {
        const cleanup =
          await subscribeToNotifications(
            (notification) => {
              if (
                !isAdminNotification(
                  notification,
                )
              ) {
                return;
              }

              setNotifications(
                (current) => [
                  notification,
                  ...current.filter(
                    (item) =>
                      item.notification_id !==
                      notification.notification_id,
                  ),
                ],
              );
            },
          );

        if (cancelled) {
          cleanup();
          return;
        }

        unsubscribe = cleanup;
      } catch (error) {
        console.error(
          "Notification subscription failed:",
          error,
        );
      }
    }

    void connectRealtime();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target,
        )
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          target,
        )
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.is_read,
    );

  const unreadCount =
    unreadNotifications.length;

  async function handleNotificationClick(
    notification: Notification,
  ) {
    if (notification.is_read) {
      return;
    }

    try {
      await markNotificationAsRead(
        notification.notification_id,
      );

      setNotifications((current) =>
        current.map((item) =>
          item.notification_id ===
          notification.notification_id
            ? {
                ...item,
                is_read: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    }
  }

  async function handleMarkAllRead() {
    if (
      unreadNotifications.length === 0
    ) {
      return;
    }

    setMarkingAllRead(true);

    try {
      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            markNotificationAsRead(
              notification.notification_id,
            ),
        ),
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error,
      );
    } finally {
      setMarkingAllRead(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Sign out failed:",
        error,
      );

      setSigningOut(false);
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
      <h1 className="text-lg font-bold tracking-wide text-gray-800">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div
          className="relative"
          ref={notificationRef}
        >
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50"
            aria-label="Admin notifications"
            aria-expanded={
              notificationsOpen
            }
            onClick={() => {
              setNotificationsOpen(
                (current) => !current,
              );

              setProfileOpen(false);
            }}
          >
            <Bell size={16} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Admin Notifications
                  </p>

                  <p className="text-xs text-gray-400">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    disabled={
                      markingAllRead
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600 disabled:opacity-50"
                    onClick={() => {
                      void handleMarkAllRead();
                    }}
                  >
                    <CheckCheck size={14} />

                    {markingAllRead
                      ? "Updating…"
                      : "Mark all read"}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {notificationsLoading && (
                  <p className="px-3 py-5 text-center text-sm text-gray-400">
                    Loading notifications…
                  </p>
                )}

                {notificationsError && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-sm text-rose-500">
                      {notificationsError}
                    </p>

                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-sky-500"
                      onClick={() => {
                        void loadNotifications();
                      }}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!notificationsLoading &&
                  !notificationsError &&
                  notifications.length ===
                    0 && (
                    <p className="px-3 py-5 text-center text-sm text-gray-400">
                      No admin notifications
                      yet.
                    </p>
                  )}

                {!notificationsLoading &&
                  !notificationsError &&
                  notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={
                          notification.notification_id
                        }
                        className={`mb-1 block w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-50 ${
                          notification.is_read
                            ? ""
                            : "bg-rose-50"
                        }`}
                        onClick={() => {
                          void handleNotificationClick(
                            notification,
                          );
                        }}
                      >
                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                          )}

                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {
                                notification.title
                              }
                            </p>

                            <p className="mt-0.5 text-sm text-gray-600">
                              {
                                notification.message
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {formatNotificationTime(
                                notification.created_at,
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ),
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div
          className="relative"
          ref={profileRef}
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-300 text-sm font-bold text-white transition hover:bg-rose-400"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen(
                (current) => !current,
              );

              setNotificationsOpen(false);
            }}
          >
            PB
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="text-sm font-semibold text-gray-800">
                  PawBorrow Admin
                </p>

                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>

              <button
                type="button"
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={16} />
                Settings
              </button>

              <button
                type="button"
                disabled={signingOut}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                onClick={() => {
                  setProfileOpen(false);
                  void handleSignOut();
                }}
              >
                <LogOut size={16} />

                {signingOut
                  ? "Signing out…"
                  : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}