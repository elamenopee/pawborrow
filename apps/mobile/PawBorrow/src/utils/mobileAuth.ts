import {
  Capacitor,
  type PluginListenerHandle,
} from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

import {
  supabase,
  signInWithGoogle as signInWithGoogleWeb,
} from "@repo/api";

const MOBILE_CALLBACK = "pawborrow://auth/callback";

// Prevent duplicate exchanges when Android delivers the same
// callback through both appUrlOpen and getLaunchUrl.
const codeExchanges = new Map<string, Promise<void>>();

async function completeGoogleLogin(
  rawUrl: string,
): Promise<void> {
  const url = new URL(rawUrl);

  if (
    url.protocol !== "pawborrow:" ||
    url.hostname !== "auth" ||
    url.pathname !== "/callback" ||
    url.port ||
    url.username ||
    url.password
  ) {
    return;
  }

  const fragment = new URLSearchParams(
    url.hash.slice(1),
  );

  const oauthError =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error") ??
    fragment.get("error_description") ??
    fragment.get("error");

  if (oauthError) {
    throw new Error(
      `Google sign-in failed: ${oauthError}`,
    );
  }

  const code = url.searchParams.get("code");

  if (!code) {
    throw new Error(
      "No login code was returned. Check that " +
        "VITE_MOBILE_AUTH_PKCE=true, rebuild, and try again.",
    );
  }

  let exchange = codeExchanges.get(code);

  if (!exchange) {
    exchange = (async () => {
      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }
    })();

    codeExchanges.set(code, exchange);
  }

  await exchange;

  // Android returns to the app through the manifest intent filter.
  // Browser.close() is only used here for iOS.
  if (Capacitor.getPlatform() === "ios") {
    await Browser.close().catch(() => undefined);
  }
}

export async function signInWithGoogleMobile(): Promise<void> {
  // Keep normal browser login when running through Vite.
  if (!Capacitor.isNativePlatform()) {
    await signInWithGoogleWeb();
    return;
  }

  if (
    import.meta.env.VITE_MOBILE_AUTH_PKCE !== "true"
  ) {
    throw new Error(
      "Mobile authentication is not configured. " +
        "Set VITE_MOBILE_AUTH_PKCE=true and rebuild the app.",
    );
  }

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: MOBILE_CALLBACK,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error(
      "Google did not return a sign-in URL.",
    );
  }

  await Browser.open({
    url: data.url,
  });
}

export function listenForMobileAuth(
  onError: (message: string) => void,
): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  let stopped = false;
  let listener: PluginListenerHandle | undefined;

  function reportError(error: unknown) {
    if (stopped) return;

    onError(
      error instanceof Error
        ? error.message
        : "Unable to complete Google sign-in. Please try again.",
    );
  }

  async function handleUrl(url: string) {
    if (stopped) return;

    try {
      await completeGoogleLogin(url);
    } catch (error) {
      reportError(error);
    }
  }

  async function start() {
    // Handles callbacks while the app is already running.
    const handle = await App.addListener(
      "appUrlOpen",
      ({ url }) => {
        void handleUrl(url);
      },
    );

    if (stopped) {
      await handle.remove();
      return;
    }

    listener = handle;

    // Handles callbacks that launch a closed app.
    const launch = await App.getLaunchUrl();

    if (!stopped && launch?.url) {
      await handleUrl(launch.url);
    }
  }

  void start().catch(reportError);

  return () => {
    stopped = true;
    void listener?.remove().catch(() => undefined);
  };
}