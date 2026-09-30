import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@repo/api";

// ========================================
// Authentication User
// ========================================

type AuthUser = {
  id: string;
  email?: string | null;
  created_at: string;
};

// ========================================
// Session
// ========================================

type Session = {
  user: AuthUser;
};

// ========================================
// User Profile
// ========================================

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

// ========================================
// Auth Context
// ========================================

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

// ========================================
// Load User Profile
// ========================================
//
// Gets the authenticated user's profile
// from public.user_profiles.
//
// Relationship:
//
// auth.users.id
//      ↓
// user_profiles.id
//
// ========================================

async function loadUserProfile(
  authUser: AuthUser,
): Promise<UserProfile> {
  const {
    data,
    error,
  } = await supabase
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

  // ========================================
  // Basic User Information
  // ========================================

  const firstName =
    data?.first_name ?? "";

  const lastName =
    data?.last_name ?? "";

  // ========================================
  // Full Name
  // ========================================

  const fullName =
    [firstName, lastName]
      .filter(Boolean)
      .join(" ") ||
    authUser.email ||
    "Account";

  // ========================================
  // Account Created
  // ========================================

  const createdAt =
    data?.created_at ??
    authUser.created_at;

  // ========================================
  // Return Profile
  // ========================================

  return {
    id: authUser.id,

    email:
      data?.email ??
      authUser.email ??
      "",

    displayName:
      firstName ||
      fullName,

    fullName,

    firstName,

    lastName,

    phoneNumber:
      data?.phone ?? "",

    avatarUrl:
      data?.avatar_url ??
      undefined,

    accountCreated: createdAt
      ? new Date(
          createdAt,
        ).toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          },
        )
      : "",
  };
}

// ========================================
// Auth Provider
// ========================================

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

  // ========================================
  // Apply Session
  // ========================================

  useEffect(() => {
    let active = true;

    async function applySession(
      nextSession: Session | null,
    ) {
      if (!active) {
        return;
      }

      // Store session
      setSession(nextSession);

      // ======================================
      // No Session
      // ======================================

      if (!nextSession?.user) {
        setUser(null);
        setLoading(false);

        return;
      }

      // ======================================
      // Load Profile
      // ======================================

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

    // ========================================
    // Initialize Authentication
    // ========================================

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

        await applySession(
          data.session,
        );
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

    // ========================================
    // Listen For Authentication Changes
    // ========================================

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!active) {
            return;
          }

          setLoading(true);

          /*
           * Run profile loading after the
           * auth callback finishes.
           *
           * This avoids making another Supabase
           * request directly inside the callback.
           */
          window.setTimeout(() => {
            applySession(
              nextSession,
            );
          }, 0);
        },
      );

    // ========================================
    // Cleanup
    // ========================================

    return () => {
      active = false;

      subscription.unsubscribe();
    };
  }, []);

  // ========================================
  // Login
  // ========================================

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

    const {
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email: normalizedEmail,
          password,
        },
      );

    if (error) {
      throw error;
    }

    /*
     * We don't manually set user here.
     *
     * Supabase will trigger onAuthStateChange(),
     * which will load the user_profiles row.
     */
  }

  // ========================================
  // Logout
  // ========================================

  async function logout() {
    const {
      error,
    } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);

    setUser(null);

    setLoading(false);
  }

  // ========================================
  // Provider
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn:
          Boolean(session),

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

// ========================================
// useAuth
// ========================================

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