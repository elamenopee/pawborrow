import { supabase } from "./supabaseClient";

function getRedirectUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
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
  redirectPath = "/dashboard",
) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: false,
      emailRedirectTo: getRedirectUrl(redirectPath),
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle(
  redirectPath = "/dashboard",
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getRedirectUrl(redirectPath),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  redirectPath = "/dashboard",
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
      },
      emailRedirectTo: getRedirectUrl(redirectPath),
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}