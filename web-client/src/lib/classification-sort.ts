export type ClassificationOrder = "az" | "za" | "sport" | "newest" | "oldest";

type Classification = {
  id: string;
  code: string;
  sportId: string;
  createdAt?: string;
};

export function sortClassifications<T extends Classification>(
  items: readonly T[],
  order: ClassificationOrder,
  locale: string,
  sportNames: ReadonlyMap<string, string>,
): T[] {
  const collator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: "base",
  });
  const byName = (a: T, b: T) =>
    collator.compare(a.code, b.code) ||
    collator.compare(
      sportNames.get(a.sportId) || "",
      sportNames.get(b.sportId) || "",
    ) ||
    a.id.localeCompare(b.id);

  return [...items].sort((a, b) => {
    if (order === "az") return byName(a, b);
    if (order === "za") return -byName(a, b);
    if (order === "sport") {
      return (
        collator.compare(
          sportNames.get(a.sportId) || "",
          sportNames.get(b.sportId) || "",
        ) || byName(a, b)
      );
    }
    const aDate = Date.parse(a.createdAt || "");
    const bDate = Date.parse(b.createdAt || "");
    if (!Number.isFinite(aDate))
      return Number.isFinite(bDate) ? 1 : byName(a, b);
    if (!Number.isFinite(bDate)) return -1;
    return (order === "newest" ? bDate - aDate : aDate - bDate) || byName(a, b);
  });
}
