import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  useAdminUsers,
  type UserProfile,
  type UserRole,
} from "@repo/api";

import Header from "../components/Header";

const PAGE_SIZE = 10;

const roleColor: Record<
  UserRole,
  string
> = {
  customer: "text-gray-500",
  admin: "text-amber-500",
};

const roleLabel: Record<
  UserRole,
  string
> = {
  customer: "Customer",
  admin: "Admin",
};

function displayName(
  user: UserProfile,
): string {
  const name = [
    user.first_name,
    user.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || "(no name set)";
}

export default function Users() {
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useAdminUsers();

  const [page, setPage] =
    useState(1);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selected,
    setSelected,
  ] = useState<Set<string>>(
    new Set(),
  );

  const filteredUsers = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const status = user.is_active
        ? "active"
        : "inactive";

      const searchableText = [
        displayName(user),
        user.first_name ?? "",
        user.last_name ?? "",
        user.email ?? "",
        user.phone ?? "",
        user.role,
        roleLabel[user.role],
        status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        search,
      );
    });
  }, [users, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        PAGE_SIZE,
    ),
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start =
    (page - 1) * PAGE_SIZE;

  const pageRows =
    filteredUsers.slice(
      start,
      start + PAGE_SIZE,
    );

  const allOnPageSelected =
    pageRows.length > 0 &&
    pageRows.every((user) =>
      selected.has(user.id),
    );

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

      if (allOnPageSelected) {
        pageRows.forEach((user) =>
          next.delete(user.id),
        );
      } else {
        pageRows.forEach((user) =>
          next.add(user.id),
        );
      }

      return next;
    });
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
                Search and manage
                PawBorrow users.
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
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-12 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500">
              Loading users…
            </p>
          )}

          {isError && (
            <p className="text-sm text-rose-500">
              Couldn&apos;t load users:{" "}
              {error instanceof Error
                ? error.message
                : "Unknown error"}
            </p>
          )}

          {!isLoading &&
            !isError && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
                  >
                    All ({users.length})
                    <ChevronDown
                      size={14}
                    />
                  </button>

                  <p className="text-xs text-gray-400">
                    Showing{" "}
                    {filteredUsers.length}{" "}
                    of {users.length} users
                  </p>
                </div>

                {filteredUsers.length ===
                0 ? (
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
                                checked={
                                  allOnPageSelected
                                }
                                onChange={
                                  toggleAllOnPage
                                }
                                className="h-4 w-4 rounded border-gray-300"
                                aria-label="Select all users on this page"
                              />
                            </th>

                            <th className="py-3 font-semibold">
                              Name
                            </th>

                            <th className="py-3 font-semibold">
                              Email
                            </th>

                            <th className="py-3 font-semibold">
                              Phone
                            </th>

                            <th className="py-3 font-semibold">
                              Status
                            </th>

                            <th className="py-3 font-semibold">
                              Role
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {pageRows.map(
                            (user) => (
                              <tr
                                key={
                                  user.id
                                }
                                className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                              >
                                <td className="py-4">
                                  <input
                                    type="checkbox"
                                    checked={selected.has(
                                      user.id,
                                    )}
                                    onChange={() =>
                                      toggleRow(
                                        user.id,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                    aria-label={`Select ${displayName(
                                      user,
                                    )}`}
                                  />
                                </td>

                                <td className="py-4 font-medium text-gray-800">
                                  {displayName(
                                    user,
                                  )}
                                </td>

                                <td className="py-4 text-gray-500">
                                  {user.email ??
                                    "—"}
                                </td>

                                <td className="py-4 text-gray-500">
                                  {user.phone ??
                                    "—"}
                                </td>

                                <td className="py-4">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                      user.is_active
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {user.is_active
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                </td>

                                <td
                                  className={`py-4 font-semibold ${roleColor[user.role]}`}
                                >
                                  {
                                    roleLabel[
                                      user
                                        .role
                                    ]
                                  }
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <span>
                        SHOWING{" "}
                        {filteredUsers.length ===
                        0
                          ? 0
                          : start + 1}
                        –
                        {Math.min(
                          start +
                            PAGE_SIZE,
                          filteredUsers.length,
                        )}{" "}
                        OF{" "}
                        {
                          filteredUsers.length
                        }{" "}
                        ENTRIES
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPage(
                              (current) =>
                                Math.max(
                                  1,
                                  current -
                                    1,
                                ),
                            )
                          }
                          disabled={
                            page === 1
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
                          aria-label="Previous page"
                        >
                          <ChevronLeft
                            size={14}
                          />
                        </button>

                        <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-gray-800 px-2 font-semibold text-gray-800">
                          {page}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setPage(
                              (current) =>
                                Math.min(
                                  totalPages,
                                  current +
                                    1,
                                ),
                            )
                          }
                          disabled={
                            page ===
                            totalPages
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
                          aria-label="Next page"
                        >
                          <ChevronRight
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}