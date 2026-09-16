import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { IonContent, IonIcon, IonPage } from "@ionic/react";

import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
} from "ionicons/icons";

import logo from "../assets/images/logo.png";

import { signUp, signInWithGoogle } from "@repo/api";

const SignUp = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedFirstName = firstName.trim();

    const trimmedLastName = lastName.trim();

    const trimmedEmail = email.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
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

    try {
      setLoading(true);

      await signUp(trimmedEmail, password, trimmedFirstName, trimmedLastName);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setSuccess("");

    try {
      setGoogleLoading(true);

      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign up failed.");

      setGoogleLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white">
        <div className="min-h-screen w-full bg-white">
          <div className="mx-auto w-full max-w-md px-5">
            <div className="flex flex-col items-center pt-14">
              <h1 className="text-[36px] font-bold leading-none text-[#f58220]">
                Sign Up
              </h1>

              <div className="mt-4 flex w-full justify-center">
                <img
                  src={logo}
                  alt="PawBorrow"
                  className="h-auto w-[240px] object-contain"
                />
              </div>
            </div>

            <form onSubmit={handleRegister} className="mt-12 pb-8">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm text-[#444]"
                  >
                    First Name
                  </label>

                  <div className="relative">
                    <IonIcon
                      icon={personOutline}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-lg
                        text-[#999]
                      "
                    />

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                      className="
                        h-12
                        w-full
                        rounded-[13px]
                        border
                        border-[#ff9b5c]
                        bg-white
                        px-3
                        pl-10
                        text-sm
                        text-[#444]
                        outline-none
                        focus:border-[#f58220]
                        focus:ring-1
                        focus:ring-[#f58220]
                      "
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm text-[#444]"
                  >
                    Last Name
                  </label>

                  <div className="relative">
                    <IonIcon
                      icon={personOutline}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-lg
                        text-[#999]
                      "
                    />

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                      className="
                        h-12
                        w-full
                        rounded-[13px]
                        border
                        border-[#ff9b5c]
                        bg-white
                        px-3
                        pl-10
                        text-sm
                        text-[#444]
                        outline-none
                        focus:border-[#f58220]
                        focus:ring-1
                        focus:ring-[#f58220]
                      "
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm text-[#444]"
                >
                  Email
                </label>

                <div className="relative">
                  <IonIcon
                    icon={mailOutline}
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

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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

              <div className="mt-3">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm text-[#444]"
                >
                  Password
                </label>

                <div className="relative">
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

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
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

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#f58220]
                    "
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <IonIcon
                      icon={showPassword ? eyeOffOutline : eyeOutline}
                      className="text-xl"
                    />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm text-[#444]"
                >
                  Confirm Password
                </label>

                <div className="relative">
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

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
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

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#f58220]
                    "
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <IonIcon
                      icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                      className="text-xl"
                    />
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-red-500">{error}</p>
              )}

              {success && (
                <p className="mt-4 text-center text-sm text-green-600">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="
                  mt-7
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
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>

              <div className="my-7 flex items-center">
                <div className="h-px flex-1 bg-[#f58220]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading || googleLoading}
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
                    <span className="text-base font-bold">G</span>
                    SIGN UP WITH GOOGLE
                  </>
                )}
              </button>

              <p
                className="
                mt-5
                text-center
                text-xs
                leading-5
                text-[#999]
              "
              >
                By creating an account, you agree to our{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms-of-service")}
                  className="underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
                  className="underline"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </form>

            <div
              className="
              pb-7
              text-center
              text-sm
              text-[#999]
            "
            >
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                  underline
                  transition
                  hover:text-[#555]
                "
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignUp;
