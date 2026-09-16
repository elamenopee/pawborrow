import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@repo/api";

/* =====================================
   TYPES
===================================== */

type AuthUser =
  Awaited<
    ReturnType<typeof supabase.auth.getUser>
  >["data"]["user"];

type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

/* =====================================
   CONTEXT
===================================== */

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/* =====================================
   USER-SCOPED STORAGE KEY
===================================== */

export const getUserScopedStorageKey = (
  baseKey: string,
  email?: string
): string => {
  if (!email) {
    return baseKey;
  }

  return `${baseKey}-${email}`;
};

/* =====================================
   AUTH PROVIDER
===================================== */

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  /* ===================================
     CHECK INITIAL SESSION
  =================================== */

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Error checking session:",
            error
          );
        }

        if (!mounted) {
          return;
        }

        console.log(
          "Initial Supabase session:",
          session
        );

        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error(
          "Authentication error:",
          error
        );

        if (!mounted) {
          return;
        }

        setUser(null);
        setIsLoggedIn(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    /* =================================
       LISTEN FOR AUTH CHANGES
    ================================= */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        console.log(
          "Auth event:",
          event
        );

        console.log(
          "Auth session:",
          session
        );

        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
      }
    );

    /* =================================
       CLEANUP
    ================================= */

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ===================================
     LOGOUT
  =================================== */

  const logout = async () => {
    console.log("Logging out...");

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      throw error;
    }

    console.log(
      "Supabase session removed."
    );

    setUser(null);
    setIsLoggedIn(false);
  };

  /* ===================================
     PROVIDER
  =================================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =====================================
   useAuth HOOK
===================================== */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};