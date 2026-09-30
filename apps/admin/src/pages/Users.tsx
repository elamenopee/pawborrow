import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import {
  supabase,
  useAdminUsers,
  type UserProfile,
  type UserRole,
} from "@repo/api";

import Header from "../components/Header";

const PAGE_SIZE = 10;

const roleColor: Record<UserRole, string> = {
  customer: "text-gray-500",
  admin: "text-amber-500",
};

const roleLabel: Record<UserRole, string> = {
  customer: "Customer",
  admin: "Admin",
};

type EditForm = {
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
};

type AdminUserAction =
  | { action: "edit"; userId: string; updates: EditForm }
  | { action: "delete"; userId: string };

function displayName(user: UserProfile): string {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "(no name set)"
  );
}

async function runAdminUserAction(body: AdminUserAction) {
  const { data, error } = await supabase.functions.invoke(
    "admin-user-actions",
    { body }
  );

  if (error) {
    let message = error.message;

    if (error.context instanceof Response) {
      try {
        const details = (await error.context.json()) as { error?: string };
        if (typeof details.error === "string") {
          message = details.error;
        }
      } catch {
        // Use the Supabase error message.
      }
    }

    throw new Error(message);
  }

  return data as { success?: boolean; user?: UserProfile } | null;
}

export default function Users() {
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminUsers();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    phone: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return users;

    return users.filter((user) => {
      const searchableText = [
        displayName(user),
        user.first_name ?? "",
        user.last_name ?? "",
        user.email ?? "",
        user.phone ?? "",
        user.role,
        roleLabel[user.role],
        user.is_active ? "active" : "inactive",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [users, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageRows = filteredUsers.slice(start, start + PAGE_SIZE);

  const allOnPageSelected =
    pageRows.length > 0 &&
    pageRows.every((user) => selected.has(user.id));

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((current) => {
      const next = new Set(current);

      for (const user of pageRows) {
        if (allOnPageSelected) {
          next.delete(user.id);
        } else {
          next.add(user.id);
        }
      }

      return next;
    });
  }

  function openEdit(user: UserProfile) {
    setEditForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone: user.phone ?? "",
      is_active: user.is_active,
    });

    setActionError("");
    setEditingUser(user);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser || saving) return;

    setSaving(true);
    setActionError("");

    try {
      const result = await runAdminUserAction({
        action: "edit",
        userId: editingUser.id,
        updates: editForm,
      });

      if (!result?.user) {
        throw new Error("The user was not updated.");
      }

      await refetch();
      setEditingUser(null);
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Could not save user."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: UserProfile) {
    if (deletingId || user.role === "admin") return;

    const confirmed = window.confirm(
      `Permanently delete ${user.email}? Their bookings, payments, reviews, notifications, addresses, and likes will also be deleted. This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(user.id);
    setActionError("");

    try {
      const result = await runAdminUserAction({
        action: "delete",
        userId: user.id,
      });

      if (result?.success !== true) {
        throw new Error("The user was not deleted.");
      }

      setSelected((current) => {
        const next = new Set(current);
        next.delete(user.id);
        return next;
      });

      await refetch();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Could not delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Header title="USERS" />

      <div className="p-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Users List
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Search and manage PawBorrow users.
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchTerm}
                placeholder="Search users..."
                aria-label="Search users"
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-12 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500">Loading users…</p>
          )}

          {isError && (
            <p className="text-sm text-rose-500">
              Couldn&apos;t load users:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          )}

          {actionError && !editingUser && (
            <p role="alert" className="mb-4 text-sm text-rose-600">
              {actionError}
            </p>
          )}

          {!isLoading && !isError && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
                >
                  All ({users.length})
                  <ChevronDown size={14} />
                </button>

                <p className="text-xs text-gray-400">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Search
                    size={30}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    No users found
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {searchTerm
                      ? `No users match "${searchTerm}".`
                      : "There are no registered users."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                          <th className="w-10 py-3">
                            <input
                              type="checkbox"
                              checked={allOnPageSelected}
                              onChange={toggleAllOnPage}
                              className="h-4 w-4 rounded border-gray-300"
                              aria-label="Select all users on this page"
                            />
                          </th>

                          <th className="py-3 font-semibold">Name</th>
                          <th className="py-3 font-semibold">Email</th>
                          <th className="py-3 font-semibold">Phone</th>
                          <th className="py-3 font-semibold">Status</th>
                          <th className="py-3 font-semibold">Role</th>
                          <th className="py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {pageRows.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                          >
                            <td className="py-4">
                              <input
                                type="checkbox"
                                checked={selected.has(user.id)}
                                onChange={() => toggleRow(user.id)}
                                className="h-4 w-4 rounded border-gray-300"
                                aria-label={`Select ${displayName(user)}`}
                              />
                            </td>

                            <td className="py-4 font-medium text-gray-800">
                              {displayName(user)}
                            </td>

                            <td className="py-4 text-gray-500">
                              {user.email ?? "—"}
                            </td>

                            <td className="py-4 text-gray-500">
                              {user.phone ?? "—"}
                            </td>

                            <td className="py-4">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  user.is_active
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {user.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td
                              className={`py-4 font-semibold ${
                                roleColor[user.role]
                              }`}
                            >
                              {roleLabel[user.role]}
                            </td>

                            <td className="py-4">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openEdit(user)}
                                  disabled={saving || deletingId !== null}
                                  className="inline-flex items-center gap-1 rounded-lg border border-sky-200 px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 disabled:opacity-50"
                                >
                                  <Pencil size={13} />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void deleteUser(user)}
                                  disabled={
                                    saving ||
                                    deletingId !== null ||
                                    user.role === "admin"
                                  }
                                  title={
                                    user.role === "admin"
                                      ? "Admin accounts cannot be deleted here"
                                      : undefined
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  <Trash2 size={13} />
                                  {deletingId === user.id
                                    ? "Deleting…"
                                    : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                    <span>
                      SHOWING {start + 1}–
                      {Math.min(
                        start + PAGE_SIZE,
                        filteredUsers.length
                      )}{" "}
                      OF {filteredUsers.length} ENTRIES
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) =>
                            Math.max(1, current - 1)
                          )
                        }
                        disabled={page === 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-gray-800 px-2 font-semibold text-gray-800">
                        {page}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) =>
                            Math.min(totalPages, current + 1)
                          )
                        }
                        disabled={page === totalPages}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(event) => void saveEdit(event)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="edit-user-title"
              className="mb-4 text-lg font-bold text-gray-800"
            >
              Edit user
            </h2>

            <label className="mb-3 block text-sm text-gray-700">
              First name
              <input
                autoFocus
                value={editForm.first_name}
                maxLength={80}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    first_name: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-sky-400"
              />
            </label>

            <label className="mb-3 block text-sm text-gray-700">
              Last name
              <input
                value={editForm.last_name}
                maxLength={80}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    last_name: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-sky-400"
              />
            </label>

            <label className="mb-3 block text-sm text-gray-700">
              Phone
              <input
                type="tel"
                value={editForm.phone}
                maxLength={30}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    phone: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-sky-400"
              />
            </label>

            <label className="mb-3 block text-sm text-gray-700">
              Email (read only)
              <input
                type="email"
                value={editingUser.email ?? ""}
                readOnly
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </label>

            <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    is_active: event.target.checked,
                  })
                }
              />
              Active
            </label>

            {actionError && (
              <p role="alert" className="mb-3 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setActionError("");
                }}
                disabled={saving}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}