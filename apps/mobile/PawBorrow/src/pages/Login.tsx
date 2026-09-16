import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";

import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
} from "ionicons/icons";

import logo from "../assets/images/logo.png";

import {
  signIn,
  signInWithGoogle,
} from "@repo/api";

const Login = () => {
  const navigate = useNavigate();

  // -------------------------
  // Form state
  // -------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // -------------------------
  // UI state
  // -------------------------
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  // -------------------------
  // Error state
  // -------------------------
  const [error, setError] =
    useState("");

  // -------------------------
  // Email + Password Login
  // -------------------------
  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    // Validate fields
    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      await signIn(
        email.trim(),
        password
      );

      /*
       * Supabase has successfully created
       * the authenticated session.
       *
       * AuthContext's onAuthStateChange()
       * will also detect this session.
       */

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Google Login
  // -------------------------
  const handleGoogleLogin = async () => {
    setError("");

    try {
      setGoogleLoading(true);

      await signInWithGoogle();

      /*
       * Do NOT navigate here.
       *
       * signInWithGoogle() redirects the
       * browser to Google.
       *
       * After authentication, Supabase
       * redirects back to the application.
       *
       * AuthContext's onAuthStateChange()
       * detects the new session.
       */
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google login failed."
      );

      setGoogleLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="bg-white"
      >
        <div className="min-h-screen w-full bg-white">

          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5">

            {/* =================================
                HEADER
            ================================= */}
            <div className="flex flex-col items-center pt-24">

              {/* Title */}
              <h1 className="text-[36px] font-bold leading-none text-[#f58220]">
                Login
              </h1>

              {/* Logo */}
              <div className="mt-5 flex w-full justify-center">
                <img
                  src={logo}
                  alt="PawBorrow"
                  className="h-auto w-[260px] object-contain"
                />
              </div>

            </div>

            {/* =================================
                LOGIN FORM
            ================================= */}
            <form
              onSubmit={handleLogin}
              className="mt-24"
            >

              {/* =================================
                  EMAIL
              ================================= */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-normal text-[#444]"
                >
                  Email
                </label>

                <div className="relative">

                  {/* Email Icon */}
                  <IonIcon
                    icon={mailOutline}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-lg text-[#999]"
                  />

                  {/* Email Input */}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="PawPaw@gmail.com"
                    autoComplete="email"
                    className="
                      h-12
                      w-full
                      rounded-[13px]
                      border
                      border-[#ff9b5c]
                      bg-white
                      px-4
                      pl-11
                      text-sm
                      text-[#444]
                      outline-none
                      placeholder:text-[#777]
                      focus:border-[#f58220]
                      focus:ring-1
                      focus:ring-[#f58220]
                    "
                  />

                </div>

              </div>

              {/* =================================
                  PASSWORD
              ================================= */}
              <div className="mt-2">

                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-normal text-[#444]"
                >
                  Password
                </label>

                <div className="relative">

                  {/* Lock Icon */}
                  <IonIcon
                    icon={lockClosedOutline}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      z-10
                      -translate-y-1/2
                      text-lg
                      text-[#999]
                    "
                  />

                  {/* Password Input */}
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    className="
                      h-12
                      w-full
                      rounded-[13px]
                      border
                      border-[#ff9b5c]
                      bg-white
                      px-11
                      text-sm
                      text-[#444]
                      outline-none
                      focus:border-[#f58220]
                      focus:ring-1
                      focus:ring-[#f58220]
                    "
                  />

                  {/* Show / Hide Password */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#f58220]
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <IonIcon
                      icon={
                        showPassword
                          ? eyeOffOutline
                          : eyeOutline
                      }
                      className="text-xl"
                    />
                  </button>

                </div>

              </div>

              {/* =================================
                  FORGOT PASSWORD
              ================================= */}
              <div className="mt-4 text-center text-sm text-[#555]">

                Forgot Password?{" "}

                <button
                  type="button"
                  onClick={() => {
                    // Add forgot-password
                    // functionality here later
                  }}
                  className="
                    font-medium
                    text-[#444]
                    underline
                    transition
                    hover:text-[#f58220]
                  "
                >
                  Click Here
                </button>

              </div>

              {/* =================================
                  ERROR MESSAGE
              ================================= */}
              {error && (
                <p className="mt-4 text-center text-sm text-red-500">
                  {error}
                </p>
              )}

              {/* =================================
                  LOGIN BUTTON
              ================================= */}
              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="
                  mt-6
                  h-11
                  w-full
                  rounded-[12px]
                  bg-[#f58220]
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#e87514]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "LOGGING IN..."
                  : "LOGIN"}
              </button>

              {/* =================================
                  DIVIDER
              ================================= */}
              <div className="my-8 flex items-center">

                <div className="h-px flex-1 bg-[#f58220]" />

              </div>

              {/* =================================
                  GOOGLE LOGIN
              ================================= */}
              <button
                type="button"
                onClick={
                  handleGoogleLogin
                }
                disabled={
                  loading ||
                  googleLoading
                }
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[12px]
                  bg-[#f58220]
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#e87514]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {googleLoading ? (
                  "CONNECTING..."
                ) : (
                  <>
                    <span className="text-base font-bold">
                      G
                    </span>

                    LOGIN WITH GOOGLE
                  </>
                )}
              </button>

            </form>

            {/* =================================
                SIGN UP
            ================================= */}
            <div className="
              mt-auto
              pb-7
              pt-12
              text-center
              text-sm
              text-[#999]
            ">

              Don't have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/signup")
                }
                className="
                  underline
                  transition
                  hover:text-[#555]
                "
              >
                Sign Up
              </button>

            </div>

          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;