import { supabase } from "./supabaseClient";

function getRedirectUrl(path = "/dashboard"): string {
  return `${window.location.origin}${path}`;
}

export async function signIn(
  email: string,
  password: string,
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmail(
  email: string,
) {
  const { data, error } =
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo:
          getRedirectUrl("/dashboard"),
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithGoogle() {
  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          getRedirectUrl("/dashboard"),
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  const { data, error } =
    await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name:
            `${firstName.trim()} ${lastName.trim()}`,
        },
        emailRedirectTo:
          getRedirectUrl("/dashboard"),
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}