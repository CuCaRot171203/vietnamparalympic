export interface ClubDetails {
  tagline: string;
  coverImage: string;
  content: string;
  joiningInstructions: string;
  foundedYear: string;
  facilities: string[];
  gallery: string[];
  website: string;
  email: string;
  phone: string;
}

export interface Organization {
  id: string;
  slug?: string;
  name: string;
  location: string | null;
  sport: string | null;
  schedule: string | null;
  suitableFor: string | null;
  contactInfo: string | null;
  imageUrl?: string | null;
  description: string | null;
  isApproved: boolean;
  details?: Partial<ClubDetails> | null;
  lat?: number | null;
  lng?: number | null;
  updatedAt?: string;
}

export const emptyClubDetails: ClubDetails = {
  tagline: "",
  coverImage: "",
  content: "",
  joiningInstructions: "",
  foundedYear: "",
  facilities: [],
  gallery: [],
  website: "",
  email: "",
  phone: "",
};

export function normalizeClubDetails(
  value: Organization["details"],
): ClubDetails {
  const result = { ...emptyClubDetails };
  if (!value || typeof value !== "object") return result;
  for (const key of Object.keys(emptyClubDetails) as (keyof ClubDetails)[]) {
    const item = value[key];
    if (key === "facilities" || key === "gallery")
      result[key] = Array.isArray(item)
        ? item.filter((entry): entry is string => typeof entry === "string")
        : [];
    else result[key] = typeof item === "string" ? item : "";
  }
  return result;
}

// Clubs can train in more than one sport. The database keeps a single text
// column, so the sports are stored as a comma separated list.
export const CLUB_SPORT_SEPARATOR = ", ";

export function splitClubSports(sport?: string | null): string[] {
  if (!sport) return [];
  return sport
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function joinClubSports(sports: string[]): string {
  return sports
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(CLUB_SPORT_SEPARATOR);
}

export function clubSlug(club: Pick<Organization, "id" | "name" | "slug">) {
  if (club.slug) return club.slug;
  const name = club.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${name || "clb"}-${club.id}`;
}

export function safeMediaUrl(value?: string | null) {
  return value && /^(?:\/(?!\/)|https?:\/\/)/i.test(value) ? value : undefined;
}
