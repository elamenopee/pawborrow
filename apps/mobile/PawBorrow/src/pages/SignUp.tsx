import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { IonContent, IonPage, IonIcon } from "@ionic/react";
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
  logoGoogle,
} from "ionicons/icons";

import { signUp } from "@repo/api";

const logo = "/images/logo.png";

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

export default function SignUp() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBusy = loading || googleLoading;
  const formDisabled = isBusy || Boolean(success);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formDisabled) return;

    setError("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Uses your existing shared registration function.
      await signUp(
        normalizedEmail,
        password,
        trimmedFirstName,
        trimmedLastName,
      );

      setPassword("");
      setConfirmPassword("");

      setSuccess(
        "Registration submitted. If email confirmation is required, " +
          "check your inbox before logging in.",
      );
    } catch (registrationError) {
      setError(
        getErrorMessage(
          registrationError,
          "Unable to register. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    if (isBusy) return;

    setError("");
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
    } catch (googleError) {
      setError(
        getErrorMessage(
          googleError,
          "Unable to sign up with Google.",
        ),
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <form
          className="login-wrap"
          onSubmit={handleRegister}
          style={{ paddingBottom: "40px" }}
        >
          <h1 className="login-title">Sign Up</h1>

          <img
            className="login-logo"
            src="/images/logo.png"
            alt="PawBorrow logo"
          />

          <div className="login-field">
            <label htmlFor="signup-first-name">First Name</label>

            <div className="login-input-wrap">
              <IonIcon
                icon={personOutline}
                className="login-input-icon"
                aria-hidden="true"
              />

              <input
                id="signup-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setError("");
                }}
                required
                disabled={formDisabled}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="signup-last-name">Last Name</label>

            <div className="login-input-wrap">
              <IonIcon
                icon={personOutline}
                className="login-input-icon"
                aria-hidden="true"
              />

              <input
                id="signup-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setError("");
                }}
                required
                disabled={formDisabled}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="signup-email">Email</label>

            <div className="login-input-wrap">
              <IonIcon
                icon={mailOutline}
                className="login-input-icon"
                aria-hidden="true"
              />

              <input
                id="signup-email"
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
                disabled={formDisabled}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="signup-password">Password</label>

            <div className="login-password-wrap">
              <IonIcon
                icon={lockClosedOutline}
                className="login-input-icon"
                aria-hidden="true"
              />

              <input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                required
                disabled={formDisabled}
              />

              <button
                type="button"
                className="login-password-toggle"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                disabled={formDisabled}
              >
                <IonIcon
                  icon={showPassword ? eyeOffOutline : eyeOutline}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="signup-confirm-password">
              Confirm Password
            </label>

            <div className="login-password-wrap">
              <IonIcon
                icon={lockClosedOutline}
                className="login-input-icon"
                aria-hidden="true"
              />

              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                required
                disabled={formDisabled}
              />

              <button
                type="button"
                className="login-password-toggle"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                disabled={formDisabled}
              >
                <IonIcon
                  icon={
                    showConfirmPassword ? eyeOffOutline : eyeOutline
                  }
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                color: "#16834a",
                textAlign: "center",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={formDisabled}
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

          <p className="login-footer">
            Already have an account?{" "}
            <button
              type="button"
              className="login-terms-link"
              onClick={() => navigate("/login")}
              disabled={isBusy}
            >
              Log In
            </button>
          </p>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleSignup}
            disabled={isBusy}
          >
            <IonIcon icon={logoGoogle} aria-hidden="true" />
            <span>
              {googleLoading ? "CONNECTING..." : "SIGN UP WITH GOOGLE"}
            </span>
          </button>

          <p className="login-footer">
            By creating an account, you agree to our
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