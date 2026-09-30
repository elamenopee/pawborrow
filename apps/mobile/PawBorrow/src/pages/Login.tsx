import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { IonContent, IonPage, IonIcon } from "@ionic/react";
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  logoGoogle,
} from "ionicons/icons";

import { useAuth } from "../context/AuthContext";
import {
  signInWithGoogleMobile as signInWithGoogle,
} from "../utils/mobileAuth";

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isBusy = loading || googleLoading;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(normalizedEmail, password);
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      setError(
        getErrorMessage(
          loginError,
          "Unable to sign in. Please check your email and password.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (isBusy) return;

    setError("");
    setGoogleLoading(true);

    try {
      // The shared authentication function starts the OAuth redirect.
      await signInWithGoogle();
    } catch (googleError) {
      setError(
        getErrorMessage(
          googleError,
          "Unable to sign in with Google.",
        ),
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <form className="login-wrap" onSubmit={handleLogin}>
          <h1 className="login-title">Login</h1>

          <img
            className="login-logo"
            src="/images/logo.png"
            alt="PawBorrow logo"
          />

          <div className="login-field">
            <label htmlFor="login-email">Email</label>

            <div className="login-input-wrap">
              <IonIcon
                icon={mailOutline}
                className="login-input-icon"
                aria-hidden="true"
              />

              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                required
                disabled={isBusy}
              />
            </div>

            <div className="outer-login-password-wrap">
              <label htmlFor="login-password">Password</label>

              <div className="login-password-wrap">
                <IonIcon
                  icon={lockClosedOutline}
                  className="login-input-icon"
                  aria-hidden="true"
                />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  required
                  disabled={isBusy}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={isBusy}
                >
                  <IonIcon
                    icon={showPassword ? eyeOffOutline : eyeOutline}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <div className="login-forgot">
            Forgot Password?{" "}
            <button
              type="button"
              className="login-terms-link"
              onClick={() =>
                setError(
                  "Please contact the administrator to reset your password.",
                )
              }
              disabled={isBusy}
            >
              Click Here
            </button>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isBusy}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

          <p className="login-footer">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="login-terms-link"
              onClick={() => navigate("/signup")}
              disabled={isBusy}
            >
              Sign Up
            </button>
          </p>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isBusy}
          >
            <IonIcon icon={logoGoogle} aria-hidden="true" />
            <span>
              {googleLoading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
            </span>
          </button>

          <p className="login-footer">
            Don&apos;t have an account?{" "}

            <button
              type="button"
              className="login-terms-link"
              onClick={() => navigate("/signup")}
              disabled={isBusy}
            >
              Sign Up
            </button>
          </p>

          <p className="login-footer">
            By continuing, you agree to our
            <br />

            <button
              type="button"
              className="login-terms-link"
              onClick={() => navigate("/terms-of-service")}
              disabled={isBusy}
            >
              Terms of Service
            </button>

            {" and "}

            <button
              type="button"
              className="login-terms-link"
              onClick={() => navigate("/privacy-policy")}
              disabled={isBusy}
            >
              Privacy Policy
            </button>
          </p>
        </form>
      </IonContent>
    </IonPage>
  );
}