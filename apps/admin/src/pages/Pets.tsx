import { useState } from 'react';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';

import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

import {
  useAdminPets,
  useCategories,
  useCreatePet,
  useDeletePet,
  useUpdatePet,
  useUpdatePetStatus,
} from '@repo/api';

import type { Pet, PetStatus } from '@repo/api';

const petStatuses: PetStatus[] = ['available', 'unavailable', 'booked'];

const statusStyles: Record<PetStatus, string> = {
  available: 'bg-emerald-100 text-emerald-600',
  unavailable: 'bg-gray-200 text-gray-600',
  booked: 'bg-indigo-100 text-indigo-600',
};

const statusLabel: Record<PetStatus, string> = {
  available: 'Available',
  unavailable: 'Unavailable',
  booked: 'Booked',
};

const personalityPalette = [
  'text-rose-500',
  'text-emerald-500',
  'text-sky-500',
  'text-gray-500',
  'text-amber-500',
];

function personalityColor(tag: string) {
  let hash = 0;

  for (const ch of tag) {
    hash =
      (hash * 31 + ch.charCodeAt(0)) %
      personalityPalette.length;
  }

  return personalityPalette[hash];
}

function StatusSelect({
  pet,
  onChange,
  disabled,
}: {
  pet: Pet;
  onChange: (id: number, status: PetStatus) => void;
  disabled: boolean;
}) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as PetStatus;

    if (newStatus === pet.status) return;

    if (pet.status === 'booked') {
      const confirmed = window.confirm(
        `${pet.name} is currently marked as booked. Changing this here won't cancel any real reservation tied to it in the booking table — only do this if you're sure. Continue?`
      );

      if (!confirmed) return;
    }

    onChange(pet.id, newStatus);
  }

  return (
    <div className="relative inline-block">
      <select
        value={pet.status}
        onChange={handleChange}
        disabled={disabled}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-semibold outline-none disabled:opacity-50 ${statusStyles[pet.status]}`}
      >
        {petStatuses.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s]}
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
  name: '',
  categoryId: '',
  breed: '',
  personality: '',
};

export default function Pets() {
  const {
    data: pets,
    isLoading,
    isError,
    error,
  } = useAdminPets();

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useCategories();

  const updateStatus = useUpdatePetStatus();
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [form, setForm] = useState<PetForm>(emptyForm);

  function handleStatusChange(
    petId: number,
    status: PetStatus
  ) {
    updateStatus.mutate({ petId, status });
  }

  function openCreateModal() {
    setForm(emptyForm);
    setSelectedPet(null);
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (createPet.isPending) return;

    setIsCreateOpen(false);
    setForm(emptyForm);
  }

  function openEditModal(pet: Pet) {
    setSelectedPet(pet);

    // Find the category ID using the category name
    const category = categories?.find(
      (c) => c.label === pet.category
    );

    setForm({
      name: pet.name,
      categoryId: category ? String(category.id) : '',
      breed: pet.breed ?? '',
      personality: pet.personality.join(', '),
    });

    setIsEditOpen(true);
  }

  function closeEditModal() {
    if (updatePet.isPending) return;

    setIsEditOpen(false);
    setSelectedPet(null);
    setForm(emptyForm);
  }

  function handleFormChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getPersonalityArray() {
    return form.personality
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!form.categoryId) {
      window.alert('Please select a category.');
      return;
    }

    createPet.mutate(
      {
        name: form.name.trim(),
        breed: form.breed.trim() || null,
        category_id: Number(form.categoryId),
        personality: getPersonalityArray(),
        status: 'available',
      },
      {
        onSuccess: () => {
          closeCreateModal();
        },
      }
    );
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedPet) return;

    if (!form.categoryId) {
      window.alert('Please select a category.');
      return;
    }

    updatePet.mutate(
      {
        petId: selectedPet.id,
        updates: {
          name: form.name.trim(),
          breed: form.breed.trim() || null,
          category_id: Number(form.categoryId),
          personality: getPersonalityArray(),
        },
      },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  }

  function handleDelete(pet: Pet) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${pet.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    deletePet.mutate(pet.id);
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Header title="PET INVENTORY" />

      <div className="p-8">
        {/* Header / Add button */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Pet Inventory
            </h2>

            <p className="text-sm text-gray-500">
              Manage pets available in PawBorrow.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus size={17} />
            Add Pet
          </button>
        </div>

        {isLoading && (
          <p className="text-sm text-gray-500">
            Loading pets…
          </p>
        )}

        {isError && (
          <p className="text-sm text-rose-500">
            Couldn't load pets:{' '}
            {(error as Error)?.message ?? 'Unknown error'}
          </p>
        )}

        {updateStatus.isError && (
          <p className="mb-3 text-sm text-rose-500">
            Couldn't update status. You do not have admin permissions.
          </p>
        )}

        {pets && (
          <DataTable
            data={pets}
            rowKey={(row) => String(row.id)}
            columns={[
              {
                key: 'id',
                label: 'Pet ID',
                render: (r) => (
                  <span className="text-gray-400">
                    #{r.id}
                  </span>
                ),
              },

              {
                key: 'name',
                label: 'Name',
                render: (r) => (
                  <span className="font-medium text-gray-800">
                    {r.name}
                  </span>
                ),
              },

              {
                key: 'category',
                label: 'Category',
                render: (r) => (
                  <span className="text-gray-500">
                    {r.category}
                  </span>
                ),
              },

              {
                key: 'breed',
                label: 'Breed',
                render: (r) => (
                  <span className="text-gray-500">
                    {r.breed ?? '—'}
                  </span>
                ),
              },

              {
                key: 'hourlyRate',
                label: 'Rate/hr',
                render: (r) => (
                  <span className="font-semibold text-amber-500">
                    ₱{r.hourlyRate.toLocaleString()}
                  </span>
                ),
              },

              {
                key: 'personality',
                label: 'Personality',
                render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    {r.personality.length === 0 && (
                      <span className="text-gray-400">
                        —
                      </span>
                    )}

                    {r.personality.map((tag) => (
                      <span
                        key={tag}
                        className={`font-semibold ${personalityColor(
                          tag
                        )}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ),
              },

              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusSelect
                    pet={r}
                    onChange={handleStatusChange}
                    disabled={updateStatus.isPending}
                  />
                ),
              },

              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(r)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-500 hover:bg-sky-50"
                      title="Edit pet"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(r)}
                      disabled={deletePet.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                      title="Delete pet"
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

      {/* CREATE PET */}
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
            categories={categories ?? []}
            categoriesLoading={categoriesLoading}
            onChange={handleFormChange}
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
                ? 'Creating...'
                : 'Create Pet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PET */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title={`Edit ${selectedPet?.name ?? 'Pet'}`}
      >
        <form
          onSubmit={handleUpdate}
          className="space-y-4"
        >
          <PetFormFields
            form={form}
            categories={categories ?? []}
            categoriesLoading={categoriesLoading}
            onChange={handleFormChange}
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
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PetFormFields({
  form,
  categories,
  categoriesLoading,
  onChange,
}: {
  form: PetForm;
  categories: {
    id: number;
    label: string;
    description: string | null;
    hourlyRate: number;
  }[];
  categoriesLoading: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;
}) {
  const selectedCategory = categories.find(
    (category) =>
      String(category.id) === form.categoryId
  );

  return (
    <>
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="e.g. Coco"
        />
      </div>

      {/* Category */}
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
              ? 'Loading categories...'
              : 'Select a category'}
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.label} — ₱
              {category.hourlyRate.toLocaleString()}/hr
            </option>
          ))}
        </select>

        {selectedCategory && (
          <p className="mt-1 text-xs text-gray-400">
            {selectedCategory.description ??
              `Rate: ₱${selectedCategory.hourlyRate.toLocaleString()}/hr`}
          </p>
        )}
      </div>

      {/* Breed */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Breed
        </label>

        <input
          name="breed"
          value={form.breed}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="e.g. Greater Capybara"
        />
      </div>

      {/* Personality */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Personality
        </label>

        <input
          name="personality"
          value={form.personality}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="Gentle, Friendly, Quiet"
        />

        <p className="mt-1 text-xs text-gray-400">
          Separate personality traits with commas.
        </p>
      </div>
    </>
  );
}