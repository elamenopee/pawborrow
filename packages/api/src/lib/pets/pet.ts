import { supabase } from "../supabaseClient";

export type PetStatus =
  | "available"
  | "unavailable"
  | "booked";

export type Pet = {
  id: number;
  name: string;
  breed: string | null;
  category: string;
  personality: string[];
  status: PetStatus;
  image: string | null;
  hourlyRate: number;
};

export type CreatePetInput = {
  name: string;
  breed?: string | null;
  category_id: number;
  personality?: string[];
  image_url?: string | null;
  status?: PetStatus;
};

export type UpdatePetInput = Partial<{
  name: string;
  breed: string | null;
  category_id: number;
  personality: string[];
  image_url: string | null;
  status: PetStatus;
}>;

const PET_SELECT = `
  pet_id,
  name,
  breed,
  personality,
  status,
  image_url,
  pet_category (
    category_id,
    category_name,
    hourly_rate
  )
`;

function normalizeImageUrl(
  imageUrl: unknown,
): string | null {
  if (
    typeof imageUrl !== "string" ||
    !imageUrl.trim()
  ) {
    return null;
  }

  const normalized = imageUrl
    .trim()
    .replace(/\\/g, "/");

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  return normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;
}

function normalizePersonality(
  personality: unknown,
): string[] {
  if (Array.isArray(personality)) {
    return personality.filter(
      (item): item is string =>
        typeof item === "string",
    );
  }

  return [];
}

function mapPetRow(pet: any): Pet {
  const category = Array.isArray(
    pet.pet_category,
  )
    ? pet.pet_category[0]
    : pet.pet_category;

  return {
    id: Number(pet.pet_id),
    name: String(
      pet.name ?? "Unnamed pet",
    ),
    breed:
      typeof pet.breed === "string"
        ? pet.breed
        : null,
    category:
      category?.category_name ??
      "Unknown",
    personality: normalizePersonality(
      pet.personality,
    ),
    status:
      pet.status as PetStatus,
    image: normalizeImageUrl(
      pet.image_url,
    ),
    hourlyRate: Number(
      category?.hourly_rate ?? 0,
    ),
  };
}

// Customer-facing: available pets only.
// Customer-facing: show all pets with their current status.

export async function getPets(): Promise<
  Pet[]
> {
  const { data, error } =
    await supabase
      .from("pet")
      .select(PET_SELECT)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPetRow);
}

// Admin-facing: all pets.
export async function getAllPetsAdmin(): Promise<
  Pet[]
> {
  const { data, error } =
    await supabase
      .from("pet")
      .select(PET_SELECT)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPetRow);
}

export async function getPetById(
  petId: number,
): Promise<Pet> {
  const { data, error } =
    await supabase
      .from("pet")
      .select(PET_SELECT)
      .eq("pet_id", petId)
      .single();

  if (error) {
    throw error;
  }

  return mapPetRow(data);
}

export async function createPet(
  pet: CreatePetInput,
): Promise<Pet> {
  const { data, error } =
    await supabase
      .from("pet")
      .insert(pet)
      .select(PET_SELECT)
      .single();

  if (error) {
    throw error;
  }

  return mapPetRow(data);
}

export async function updatePet(
  petId: number,
  updates: UpdatePetInput,
): Promise<Pet> {
  const { data, error } =
    await supabase
      .from("pet")
      .update(updates)
      .eq("pet_id", petId)
      .select(PET_SELECT)
      .single();

  if (error) {
    throw error;
  }

  return mapPetRow(data);
}

export async function updatePetStatus(
  petId: number,
  status: PetStatus,
): Promise<Pet> {
  const { data, error } =
    await supabase
      .from("pet")
      .update({ status })
      .eq("pet_id", petId)
      .select(PET_SELECT)
      .single();

  if (error) {
    throw error;
  }

  return mapPetRow(data);
}

export async function deletePet(
  petId: number,
): Promise<void> {
  const { error } =
    await supabase
      .from("pet")
      .delete()
      .eq("pet_id", petId);

  if (error) {
    throw error;
  }
}