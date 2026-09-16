import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@repo/api";
import type {
  Session,
  User,
} from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountCreated: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  loading: boolean;
  user: UserProfile | null;
  session: Session | null;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

async function loadUserProfile(
  authUser: User,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      avatar_url,
      created_at
    `)
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to load user profile:",
      error,
    );
  }

  const firstName =
    data?.first_name ?? "";

  const lastName =
    data?.last_name ?? "";

  const fullName =
    [firstName, lastName]
      .filter(Boolean)
      .join(" ") ||
    authUser.email ||
    "Account";

  const createdAt =
    data?.created_at ??
    authUser.created_at;

  return {
    id: authUser.id,

    email:
      data?.email ??
      authUser.email ??
      "",

    displayName:
      firstName || fullName,

    fullName,

    firstName,

    lastName,

    phoneNumber:
      data?.phone ?? "",

    avatarUrl:
      data?.avatar_url ?? undefined,

    accountCreated: createdAt
      ? new Date(
          createdAt,
        ).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "",
  };
}

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [session, setSession] =
    useState<Session | null>(null);

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function applySession(
      nextSession: Session | null,
    ) {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile =
          await loadUserProfile(
            nextSession.user,
          );

        if (active) {
          setUser(profile);
        }
      } catch (error) {
        console.error(
          "Failed to apply user profile:",
          error,
        );

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    async function initializeAuth() {
      setLoading(true);

      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        await applySession(data.session);
      } catch (error) {
        console.error(
          "Failed to restore Supabase session:",
          error,
        );

        if (active) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!active) {
            return;
          }

          setLoading(true);

          /*
           * Run profile loading after the auth callback
           * finishes to avoid blocking Supabase auth.
           */
          window.setTimeout(() => {
            applySession(nextSession);
          }, 0);
        },
      );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(
    email: string,
    password: string,
  ) {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error(
        "Please enter your email address.",
      );
    }

    if (!password) {
      throw new Error(
        "Please enter your password.",
      );
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (error) {
      throw error;
    }
  }

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: Boolean(session),
        loading,
        user,
        session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
};