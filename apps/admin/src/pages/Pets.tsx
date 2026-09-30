import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import Header from "../components/Header";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

import {
  useAdminPets,
  useCategories,
  useCreatePet,
  useDeletePet,
  useUpdatePet,
  useUpdatePetStatus,
  type Pet,
  type PetStatus,
} from "@repo/api";

const petStatuses: PetStatus[] = [
  "available",
  "unavailable",
  "booked",
];

const statusStyles: Record<
  PetStatus,
  string
> = {
  available:
    "bg-emerald-100 text-emerald-600",
  unavailable:
    "bg-gray-200 text-gray-600",
  booked:
    "bg-indigo-100 text-indigo-600",
};

const statusLabel: Record<
  PetStatus,
  string
> = {
  available: "Available",
  unavailable: "Unavailable",
  booked: "Booked",
};

const personalityPalette = [
  "text-rose-500",
  "text-emerald-500",
  "text-sky-500",
  "text-gray-500",
  "text-amber-500",
];

function personalityColor(
  tag: string,
): string {
  let hash = 0;

  for (const character of tag) {
    hash =
      (hash * 31 +
        character.charCodeAt(0)) %
      personalityPalette.length;
  }

  return personalityPalette[hash];
}

type StatusSelectProps = {
  pet: Pet;
  onChange: (
    id: number,
    status: PetStatus,
  ) => void;
  disabled: boolean;
};

function StatusSelect({
  pet,
  onChange,
  disabled,
}: StatusSelectProps) {
  function handleChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const newStatus =
      event.target.value as PetStatus;

    if (newStatus === pet.status) {
      return;
    }

    if (pet.status === "booked") {
      const confirmed =
        window.confirm(
          `${pet.name} is currently booked. Changing its status will not cancel any booking connected to it. Continue?`,
        );

      if (!confirmed) {
        return;
      }
    }

    onChange(pet.id, newStatus);
  }

  return (
    <div className="relative inline-block">
      <select
        value={pet.status}
        onChange={handleChange}
        disabled={disabled}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50 ${statusStyles[pet.status]}`}
      >
        {petStatuses.map((status) => (
          <option
            key={status}
            value={status}
          >
            {statusLabel[status]}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60"
      />
    </div>
  );
}

type PetForm = {
  name: string;
  categoryId: string;
  breed: string;
  personality: string;
};

const emptyForm: PetForm = {
  name: "",
  categoryId: "",
  breed: "",
  personality: "",
};

export default function Pets() {
  const {
    data: pets = [],
    isLoading,
    isError,
    error,
  } = useAdminPets();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories();

  const updateStatus =
    useUpdatePetStatus();

  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  const [
    isEditOpen,
    setIsEditOpen,
  ] = useState(false);

  const [
    selectedPet,
    setSelectedPet,
  ] = useState<Pet | null>(null);

  const [form, setForm] =
    useState<PetForm>(emptyForm);

  const filteredPets = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return pets;
    }

    return pets.filter((pet) => {
      const searchableText = [
        String(pet.id),
        pet.name,
        pet.category,
        pet.breed ?? "",
        pet.status,
        ...pet.personality,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        search,
      );
    });
  }, [pets, searchTerm]);

  function handleStatusChange(
    petId: number,
    status: PetStatus,
  ) {
    updateStatus.mutate({
      petId,
      status,
    });
  }

  function openCreateModal() {
    setForm(emptyForm);
    setSelectedPet(null);
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (createPet.isPending) {
      return;
    }

    setIsCreateOpen(false);
    setForm(emptyForm);
  }

  function openEditModal(pet: Pet) {
    setSelectedPet(pet);

    const category =
      categories.find(
        (item) =>
          item.label === pet.category,
      );

    setForm({
      name: pet.name,
      categoryId: category
        ? String(category.id)
        : "",
      breed: pet.breed ?? "",
      personality:
        pet.personality.join(", "),
    });

    setIsEditOpen(true);
  }

  function closeEditModal() {
    if (updatePet.isPending) {
      return;
    }

    setIsEditOpen(false);
    setSelectedPet(null);
    setForm(emptyForm);
  }

  function handleFormChange(
    event: ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement
    >,
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getPersonalityArray() {
    return form.personality
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert(
        "Please enter the pet's name.",
      );
      return;
    }

    if (!form.categoryId) {
      window.alert(
        "Please select a category.",
      );
      return;
    }

    createPet.mutate(
      {
        name: form.name.trim(),
        breed:
          form.breed.trim() || null,
        category_id: Number(
          form.categoryId,
        ),
        personality:
          getPersonalityArray(),
        status: "available",
      },
      {
        onSuccess: () => {
          closeCreateModal();
        },
      },
    );
  }

  function handleUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedPet) {
      return;
    }

    if (!form.name.trim()) {
      window.alert(
        "Please enter the pet's name.",
      );
      return;
    }

    if (!form.categoryId) {
      window.alert(
        "Please select a category.",
      );
      return;
    }

    updatePet.mutate(
      {
        petId: selectedPet.id,
        updates: {
          name: form.name.trim(),
          breed:
            form.breed.trim() ||
            null,
          category_id: Number(
            form.categoryId,
          ),
          personality:
            getPersonalityArray(),
        },
      },
      {
        onSuccess: () => {
          closeEditModal();
        },
      },
    );
  }

  function handleDelete(pet: Pet) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${pet.name}? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    deletePet.mutate(pet.id);
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Header title="PET INVENTORY" />

      <div className="p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Pet Inventory
            </h2>

            <p className="text-sm text-gray-500">
              Manage pets available in
              PawBorrow.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus size={17} />
            Add Pet
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchTerm}
              placeholder="Search by name, breed, category, status, or personality..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
            />

            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Showing {filteredPets.length} of{" "}
            {pets.length} pets
          </p>
        </div>

        {isLoading && (
          <p className="text-sm text-gray-500">
            Loading pets…
          </p>
        )}

        {isError && (
          <p className="text-sm text-rose-500">
            Couldn&apos;t load pets:{" "}
            {error instanceof Error
              ? error.message
              : "Unknown error"}
          </p>
        )}

        {updateStatus.isError && (
          <p className="mb-3 text-sm text-rose-500">
            Couldn&apos;t update the
            status. Check your admin
            permissions.
          </p>
        )}

        {createPet.isError && (
          <p className="mb-3 text-sm text-rose-500">
            Couldn&apos;t create the pet:{" "}
            {createPet.error instanceof Error
              ? createPet.error.message
              : "Unknown error"}
          </p>
        )}

        {updatePet.isError && (
          <p className="mb-3 text-sm text-rose-500">
            Couldn&apos;t update the pet:{" "}
            {updatePet.error instanceof Error
              ? updatePet.error.message
              : "Unknown error"}
          </p>
        )}

        {deletePet.isError && (
          <p className="mb-3 text-sm text-rose-500">
            Couldn&apos;t delete the pet:{" "}
            {deletePet.error instanceof Error
              ? deletePet.error.message
              : "Unknown error"}
          </p>
        )}

        {!isLoading &&
          !isError &&
          filteredPets.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? `No pets match "${searchTerm}".`
                  : "No pets are available."}
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          filteredPets.length > 0 && (
            <DataTable
              data={filteredPets}
              rowKey={(row) =>
                String(row.id)
              }
              columns={[
                {
                  key: "id",
                  label: "Pet ID",
                  render: (pet) => (
                    <span className="text-gray-400">
                      #{pet.id}
                    </span>
                  ),
                },
                {
                  key: "name",
                  label: "Name",
                  render: (pet) => (
                    <span className="font-medium text-gray-800">
                      {pet.name}
                    </span>
                  ),
                },
                {
                  key: "category",
                  label: "Category",
                  render: (pet) => (
                    <span className="text-gray-500">
                      {pet.category}
                    </span>
                  ),
                },
                {
                  key: "breed",
                  label: "Breed",
                  render: (pet) => (
                    <span className="text-gray-500">
                      {pet.breed ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "hourlyRate",
                  label: "Rate/hr",
                  render: (pet) => (
                    <span className="font-semibold text-amber-500">
                      ₱
                      {pet.hourlyRate.toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "personality",
                  label: "Personality",
                  render: (pet) => (
                    <div className="flex flex-wrap gap-1">
                      {pet.personality
                        .length === 0 && (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}

                      {pet.personality.map(
                        (tag) => (
                          <span
                            key={tag}
                            className={`font-semibold ${personalityColor(
                              tag,
                            )}`}
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (pet) => (
                    <StatusSelect
                      pet={pet}
                      onChange={
                        handleStatusChange
                      }
                      disabled={
                        updateStatus.isPending
                      }
                    />
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (pet) => (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            pet,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-500 hover:bg-sky-50"
                        title="Edit pet"
                        aria-label={`Edit ${pet.name}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(pet)
                        }
                        disabled={
                          deletePet.isPending
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                        title="Delete pet"
                        aria-label={`Delete ${pet.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        title="Add New Pet"
      >
        <form
          onSubmit={handleCreate}
          className="space-y-4"
        >
          <PetFormFields
            form={form}
            categories={categories}
            categoriesLoading={
              categoriesLoading
            }
            onChange={
              handleFormChange
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createPet.isPending ||
                categoriesLoading
              }
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {createPet.isPending
                ? "Creating…"
                : "Create Pet"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title={`Edit ${
          selectedPet?.name ?? "Pet"
        }`}
      >
        <form
          onSubmit={handleUpdate}
          className="space-y-4"
        >
          <PetFormFields
            form={form}
            categories={categories}
            categoriesLoading={
              categoriesLoading
            }
            onChange={
              handleFormChange
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeEditModal}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                updatePet.isPending ||
                categoriesLoading
              }
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {updatePet.isPending
                ? "Saving…"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

type CategoryOption = {
  id: number;
  label: string;
  description: string | null;
  hourlyRate: number;
};

type PetFormFieldsProps = {
  form: PetForm;
  categories: CategoryOption[];
  categoriesLoading: boolean;
  onChange: (
    event: ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement
    >,
  ) => void;
};

function PetFormFields({
  form,
  categories,
  categoriesLoading,
  onChange,
}: PetFormFieldsProps) {
  const selectedCategory =
    categories.find(
      (category) =>
        String(category.id) ===
        form.categoryId,
    );

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          placeholder="e.g. Coco"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>

        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          required
          disabled={categoriesLoading}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">
            {categoriesLoading
              ? "Loading categories…"
              : "Select a category"}
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.label} — ₱
                {category.hourlyRate.toLocaleString()}
                /hr
              </option>
            ),
          )}
        </select>

        {selectedCategory && (
          <p className="mt-1 text-xs text-gray-400">
            {selectedCategory.description ??
              `Rate: ₱${selectedCategory.hourlyRate.toLocaleString()}/hr`}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Breed
        </label>

        <input
          name="breed"
          value={form.breed}
          onChange={onChange}
          placeholder="e.g. Greater Capybara"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Personality
        </label>

        <input
          name="personality"
          value={form.personality}
          onChange={onChange}
          placeholder="Gentle, Friendly, Quiet"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />

        <p className="mt-1 text-xs text-gray-400">
          Separate personality traits
          with commas.
        </p>
      </div>
    </>
  );
}