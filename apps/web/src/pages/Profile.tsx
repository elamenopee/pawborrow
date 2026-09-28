import { useState } from "react";
import Navbar from "../components/ui/Navbar";
import {
  useProfile,
  useUpdateProfile,
  type UserProfile,
} from "@repo/api";

import {
  User,
  ArrowRight,
  Mail,
  Phone,
  X,
} from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  profileNameSchema,
  profilePhoneSchema,
} from "@/utils/validation";

type EditableField = "name" | "phone" | null;

type NameForm = z.infer<typeof profileNameSchema>;
type PhoneForm = z.infer<typeof profilePhoneSchema>;

export default function Profile() {
  const {
    data: profile,
    isLoading: profileLoading,
    isError,
  } = useProfile();

  const [editingField, setEditingField] =
    useState<EditableField>(null);

  if (profileLoading) {
    return (
      <main>
        <Navbar />

        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main>
        <Navbar />

        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-red-500">
            Something went wrong loading your profile.
          </p>
        </div>
      </main>
    );
  }

  const fullName =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || "Not set";

  return (
    <main>
      <Navbar />

      <div className="w-full p-6">
        <div className="mx-auto flex w-full max-w-215 flex-col gap-8">

          <section className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5 pb-1">
              <div className="text-base font-medium">
                General
              </div>

              <div className="text-xs text-gray-500">
                Manage your basic profile information
              </div>
            </div>

            <div className="flex w-full flex-col overflow-hidden rounded-lg border">

              <button
                type="button"
                onClick={() => setEditingField("name")}
                className="
                  flex w-full items-center
                  justify-between gap-4
                  border-b px-6 py-5
                  text-left
                  hover:bg-gray-50
                "
              >
                <div className="flex flex-1 items-start gap-3">
                  <User className="h-6 w-6 text-gray-400" />

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-medium">
                      Name
                    </div>

                    <div className="text-xs text-gray-500">
                      {fullName}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-6 w-6 text-gray-400" />
              </button>

              <div
                className="
                  flex w-full items-center
                  justify-between gap-4
                  border-b px-6 py-5
                "
              >
                <div className="flex flex-1 items-start gap-3">
                  <Mail className="h-6 w-6 text-gray-400" />

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-medium">
                      Email
                    </div>

                    <div className="text-xs text-gray-500">
                      {profile.email ?? "Not set"}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingField("phone")}
                className="
                  flex w-full items-center
                  justify-between gap-4
                  border-b px-6 py-5
                  text-left
                  hover:bg-gray-50
                "
              >
                <div className="flex flex-1 items-start gap-3">
                  <Phone className="h-6 w-6 text-gray-400" />

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-medium">
                      Phone
                    </div>

                    <div className="text-xs text-gray-500">
                      {profile.phone ?? "Not set"}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-6 w-6 text-gray-400" />
              </button>

          

            </div>
          </section>

          {/* Privacy Settings */}
          {/* Keep your existing section here */}

          {/* Notification Settings */}
          {/* Keep your existing section here */}

        </div>
      </div>

      {editingField && (
        <EditFieldModal
          field={editingField}
          profile={profile}
          onClose={() => setEditingField(null)}
        />
      )}
    </main>
  );
}

function EditFieldModal({
  field,
  profile,
  onClose,
}: {
  field: "name" | "phone";
  profile: UserProfile;
  onClose: () => void;
}) {
  const {
    mutate: updateProfile,
    isPending,
    error: updateError,
  } = useUpdateProfile();

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(profileNameSchema),

    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
    },
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(profilePhoneSchema),

    defaultValues: {
      phone: profile.phone ?? "",
    },
  });

  const handleNameSubmit = (data: NameForm) => {
    updateProfile(
      {
        first_name: data.first_name,
        last_name: data.last_name,
      },
      {
        onSuccess: onClose,
      }
    );
  };

  const handlePhoneSubmit = (data: PhoneForm) => {
    updateProfile(
      {
        phone: data.phone,
      },
      {
        onSuccess: onClose,
      }
    );
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-sm
          rounded-2xl bg-white
          p-6 shadow-xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Edit {field === "name" ? "Name" : "Phone"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {field === "name" ? (
          <form
            onSubmit={nameForm.handleSubmit(handleNameSubmit)}
            className="flex flex-col gap-3"
          >
            <div>
              <input
                {...nameForm.register("first_name")}
                placeholder="First name"
                autoComplete="given-name"
                className="
                  h-11 w-full rounded-xl
                  border border-gray-300
                  px-4 text-sm
                  outline-none
                  focus:border-[#879b7b]
                "
              />

              {nameForm.formState.errors.first_name && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    nameForm.formState.errors.first_name
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <input
                {...nameForm.register("last_name")}
                placeholder="Last name"
                autoComplete="family-name"
                className="
                  h-11 w-full rounded-xl
                  border border-gray-300
                  px-4 text-sm
                  outline-none
                  focus:border-[#879b7b]
                "
              />

              {nameForm.formState.errors.last_name && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    nameForm.formState.errors.last_name
                      .message
                  }
                </p>
              )}
            </div>

            {updateError && (
              <p className="text-xs text-red-500">
                {updateError instanceof Error
                  ? updateError.message
                  : "Failed to update profile."}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="
                mt-2 h-11 w-full
                rounded-full
                bg-[#879b7b]
                text-sm font-medium text-white
                hover:bg-[#748a68]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
            className="flex flex-col gap-3"
          >
            <div>
              <input
                {...phoneForm.register("phone")}
                type="tel"
                placeholder="Phone number"
                autoComplete="tel"
                className="
                  h-11 w-full rounded-xl
                  border border-gray-300
                  px-4 text-sm
                  outline-none
                  focus:border-[#879b7b]
                "
              />

              {phoneForm.formState.errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {updateError && (
              <p className="text-xs text-red-500">
                {updateError instanceof Error
                  ? updateError.message
                  : "Failed to update profile."}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="
                mt-2 h-11 w-full
                rounded-full
                bg-[#879b7b]
                text-sm font-medium text-white
                hover:bg-[#748a68]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}