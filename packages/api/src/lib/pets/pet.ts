import { supabase } from "../supabaseClient";

export type PetStatus = "available" | "unavailable" | "booked";

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
  status?: PetStatus; // defaults to "available" in the DB if omitted
};

export type UpdatePetInput = Partial<{
  name: string;
  breed: string | null;
  category_id: number;
  personality: string[];
  image_url: string | null;
}>;

// Raw select shape shared by every query below.
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

function mapPetRow(pet: any): Pet {
  const category = Array.isArray(pet.pet_category)
    ? pet.pet_category[0]
    : pet.pet_category;

  return {
    id: pet.pet_id,
    name: pet.name,
    breed: pet.breed,
    category: category?.category_name ?? "Unknown",
    personality: pet.personality ?? [],
    status: pet.status,
    image: pet.image_url,
    hourlyRate: Number(category?.hourly_rate ?? 0),
  };
}

// ---- READ ----

// Customer-facing: only pets that can currently be booked.
export async function getPets(): Promise<Pet[]> {
  const { data, error } = await supabase
    .from("pet")
    .select(PET_SELECT)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPetRow);
}

// Admin-facing: every pet regardless of status.
export async function getAllPetsAdmin(): Promise<Pet[]> {
  const { data, error } = await supabase
    .from("pet")
    .select(PET_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPetRow);
}

export async function getPetById(petId: number): Promise<Pet> {
  const { data, error } = await supabase
    .from("pet")
    .select(PET_SELECT)
    .eq("pet_id", petId)
    .single();

  if (error) throw error;
  return mapPetRow(data);
}

// ---- CREATE (admin only — enforced by RLS) ----
export async function createPet(pet: CreatePetInput): Promise<Pet> {
  const { data, error } = await supabase
    .from("pet")
    .insert(pet)
    .select(PET_SELECT)
    .single();

  if (error) throw error;
  return mapPetRow(data);
}

// ---- UPDATE (admin only — enforced by RLS) ----
export async function updatePet(
  petId: number,
  updates: UpdatePetInput
): Promise<Pet> {
  const { data, error } = await supabase
    .from("pet")
    .update(updates)
    .eq("pet_id", petId)
    .select(PET_SELECT)
    .single();

  if (error) throw error;
  return mapPetRow(data);
}

export async function updatePetStatus(
  petId: number,
  status: PetStatus
): Promise<Pet> {
  const { data, error } = await supabase
    .from("pet")
    .update({ status })
    .eq("pet_id", petId)
    .select(PET_SELECT)
    .single();

  if (error) throw error;
  return mapPetRow(data);
}

// ---- DELETE (admin only — enforced by RLS) ----
export async function deletePet(petId: number): Promise<void> {
  const { error } = await supabase.from("pet").delete().eq("pet_id", petId);
  if (error) throw error;
}