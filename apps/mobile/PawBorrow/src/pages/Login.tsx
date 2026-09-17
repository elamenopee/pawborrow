import {
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  logoGoogle,
} from "ionicons/icons";

import { useAuth } from "../context/AuthContext";
import { signInWithGoogle } from "@repo/api";
import logo from "/images/logo.png";
import "../style/Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(
        "Please enter your email and password.",
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(
        normalizedEmail,
        password,
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      console.error(
        "Login failed:",
        loginError,
      );

      setError(
        loginError instanceof Error
          ? loginError.message
          : "Incorrect email or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      /*
       * Supabase opens the Google login page.
       * Do not navigate manually here because
       * Google redirects the user afterward.
       */
      await signInWithGoogle();
    } catch (googleError) {
      console.error(
        "Google login failed:",
        googleError,
      );

      setError(
        googleError instanceof Error
          ? googleError.message
          : "Unable to sign in with Google.",
      );

      setGoogleLoading(false);
    }
  }

  const isBusy =
    loading || googleLoading;

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="login-content"
      >
        <form
          className="login-wrap"
          onSubmit={handleLogin}
        >
          <h1 className="login-title">
            Login
          </h1>

          <img
            className="login-logo"
            src={logo}
            alt="PawBorrow logo"
          />

          <div className="login-field">
            <label htmlFor="email">
              Email
            </label>

            <div className="login-input-wrap">
              <IonIcon
                icon={mailOutline}
                className="login-input-icon"
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );
                  setError("");
                }}
                disabled={isBusy}
              />
            </div>

            <div className="outer-login-password-wrap">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-password-wrap">
                <IonIcon
                  icon={lockClosedOutline}
                  className="login-input-icon"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    );
                    setError("");
                  }}
                  disabled={isBusy}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  disabled={isBusy}
                >
                  <IonIcon
                    icon={
                      showPassword
                        ? eyeOffOutline
                        : eyeOutline
                    }
                  />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p
              className="login-error"
              role="alert"
            >
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
            {loading
              ? "LOGGING IN..."
              : "LOGIN"}
          </button>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isBusy}
          >
            <IonIcon icon={logoGoogle} />

            <span>
              {googleLoading
                ? "CONNECTING..."
                : "CONTINUE WITH GOOGLE"}
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
            By continuing, you agree to
            our
            <br />

            <button
              type="button"
              className="login-terms-link"
              onClick={() =>
                navigate(
                  "/terms-of-service",
                )
              }
              disabled={isBusy}
            >
              Terms of Service
            </button>

            {" and "}

            <button
              type="button"
              className="login-terms-link"
              onClick={() =>
                navigate(
                  "/privacy-policy",
                )
              }
              disabled={isBusy}
            >
              Privacy Policy
            </button>
          </p>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Login;