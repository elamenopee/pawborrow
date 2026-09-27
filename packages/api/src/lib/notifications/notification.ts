import { supabase } from "../supabaseClient";

export interface Notification {
  notification_id: number;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  booking_id: number | null;
  is_read: boolean;
  created_at: string;
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  return user.id;
}

export async function getNotifications(): Promise<
  Notification[]
> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("notification")
    .update({
      is_read: true,
    })
    .eq(
      "notification_id",
      notificationId,
    )
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("notification")
    .update({
      is_read: true,
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}

export async function subscribeToNotifications(
  onNotification: (
    notification: Notification,
  ) => void,
): Promise<() => void> {
  const userId = await requireUserId();

  const channel = supabase
    .channel(
      `notifications-${userId}`,
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notification",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(
          payload.new as Notification,
        );
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(
      channel,
    );
  };
}