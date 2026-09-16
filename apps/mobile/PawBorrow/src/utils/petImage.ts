import type {
  SyntheticEvent,
} from "react";

/*
 * Transparent fallback image.
 * This prevents the PawBorrow logo from
 * appearing when a pet image is missing.
 */
export const placeholderPhoto =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

export function getPetImage(
  imageUrl?: string | null,
): string {
  if (!imageUrl?.trim()) {
    return placeholderPhoto;
  }

  let path = imageUrl
    .trim()
    .replace(/\\/g, "/");

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  path = path.replace(
    /^\/?public\//i,
    "/",
  );

  path = path.replace(
    /^\/?(?:src\/)?assets\/images\//i,
    "/images/",
  );

  if (path.startsWith("/images/")) {
    return path;
  }

  if (path.startsWith("images/")) {
    return `/${path}`;
  }

  if (path.startsWith("pets/")) {
    return `/images/${path}`;
  }

  return path.startsWith("/")
    ? path
    : `/images/${path}`;
}

export function handlePetImageError(
  event: SyntheticEvent<
    HTMLImageElement
  >,
): void {
  const image =
    event.currentTarget;

  image.onerror = null;
  image.src = placeholderPhoto;
  image.classList.add(
    "pet-image-missing",
  );
}