export function matchesSearch(
  value: string,
  searchTerm: string,
): boolean {
  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return value
    .trim()
    .toLowerCase()
    .includes(normalizedSearch);
}