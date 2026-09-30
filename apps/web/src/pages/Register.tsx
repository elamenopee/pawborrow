import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "@repo/api";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/utils/validation";

type FormData = z.infer<typeof signUpSchema>;

export default function Register() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");

    try {
      await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        "/"
      );

      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed"
      );
    }
  };

  return (
    <main className="flex min-h-screen bg-white">
      {/* LEFT SIDE */}
      <div className="relative z-2 flex shrink-0 grow-0 basis-1/2 flex-col justify-center p-12 text-white [clip-path:polygon(0_0,100%_0,85%_100%,0_100%)]">
        <div className="absolute inset-0 bg-[url('/images/featured-bella.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-[rgba(30,18,10,0.75)]">
            <div className="relative h-full flex flex-col justify-end p-1">
              {/* Logo */}
              <div className="absolute top-0 left-0 px-4">
                <Link to="/">
                  <img
                    src="/images/PawBorrowLogo.png"
                    alt="PawBorrow Logo"
                    className="h-41.25 w-41.25"
                  />
                </Link>
              </div>

              {/* Branding */}
              <div className="relative h-full flex flex-col justify-end p-12">
                <span className="font-serif text-[32px] font-normal text-white">
                  PawBorrow
                </span>

                <p className="mt-2 text-base text-white">
                  You've got a Paw in me.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-105">
          {/* HEADER */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link to="/">
              <img
                src="/images/PawLogo2.png"
                alt="PawBorrow Logo"
              />
            </Link>

            <h1 className="font-serif text-[32px] font-normal text-[#1b1b1b]">
              Create Your Account
            </h1>

            <p className="mt-2 text-sm text-[#6f6f6f]">
              Join now to have a Pawesome experience!
            </p>
          </div>

          {/* FORM */}
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Supabase / API ERROR */}
            {error && (
              <p
                className="text-xs text-red-500"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* FIRST + LAST NAME */}
            <div className="flex gap-4">
              {/* FIRST NAME */}
              <div className="flex-1">
                <label className="mb-2 block font-body text-xs uppercase text-black">
                  First Name
                </label>

                <input
                  type="text"
                  autoComplete="given-name"
                  {...register("firstName")}
                  className="h-11.5 w-full rounded-xl border border-black bg-white px-4 py-3 font-body text-sm"
                />

                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* LAST NAME */}
              <div className="flex-1">
                <label className="mb-2 block font-body text-xs uppercase text-black">
                  Last Name
                </label>

                <input
                  type="text"
                  autoComplete="family-name"
                  {...register("lastName")}
                  className="h-11.5 w-full rounded-xl border border-black bg-white px-4 py-3 font-body text-sm"
                />

                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block font-body text-xs uppercase text-black">
                Email
              </label>

              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="h-11.5 w-full rounded-xl border border-black bg-white px-4 py-3 font-body text-sm"
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block font-body text-xs uppercase text-black">
                Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className="h-11.5 w-full rounded-xl border border-black bg-white px-4 py-3 font-body text-sm"
              />

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="mb-2 block font-body text-xs uppercase text-black">
                Confirm Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="h-11.5 w-full rounded-xl border border-black bg-white px-4 py-3 font-body text-sm"
              />

              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-13 w-full rounded-md bg-froly-400 text-sm font-medium uppercase text-white hover:bg-froly-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating Account..."
                : "Sign Up"}
            </button>
          </form>

          {/* TERMS */}
          <p className="mt-2 px-2 text-center font-body text-[12px] leading-relaxed text-[#888]">
            By continuing, you agree to{" "}
            <Link
              to="/tos"
              className="text-[#6f6f6f] underline underline-offset-2 transition-colors hover:text-[#879b7b]"
            >
              Terms of Service
            </Link>{" "}
            &{" "}
            <Link
              to="/privacy"
              className="text-[#6f6f6f] underline underline-offset-2 transition-colors hover:text-[#879b7b]"
            >
              Privacy Policy
            </Link>
            .
          </p>


          <p className="mt-4 text-center text-sm text-[#6f6f6f]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#6f6f6f] transition-colors hover:text-[#879b7b]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}