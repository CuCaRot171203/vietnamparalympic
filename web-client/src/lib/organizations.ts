export type ClubContact = { name: string; role: string; phone: string };
export const CLUB_REGIONS = ["Miền Bắc", "Miền Trung", "Miền Nam"] as const;
export type ClubRegion = (typeof CLUB_REGIONS)[number];

export interface ClubDetails {
  region: ClubRegion;
  contacts: ClubContact[];
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
  region: "Miền Bắc",
  contacts: [],
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
    if (key === "region") {
      result.region = CLUB_REGIONS.includes(item as ClubRegion)
        ? (item as ClubRegion)
        : "Miền Bắc";
    } else if (key === "contacts") {
      result.contacts = Array.isArray(item)
        ? item
            .filter(
              (entry): entry is ClubContact =>
                !!entry &&
                typeof entry === "object" &&
                typeof entry.name === "string" &&
                typeof entry.phone === "string",
            )
            .map((entry) => ({
              name: entry.name,
              phone: entry.phone,
              role: typeof entry.role === "string" ? entry.role : "",
            }))
        : [];
    } else if (key === "facilities" || key === "gallery")
      result[key] = Array.isArray(item)
        ? item.filter((entry): entry is string => typeof entry === "string")
        : [];
    else result[key] = typeof item === "string" ? item : "";
  }
  return result;
}

export function clubRegion(
  club: Pick<Organization, "details" | "location">,
): ClubRegion {
  const stored = club.details?.region;
  if (stored && CLUB_REGIONS.includes(stored)) return stored;
  const location = (club.location || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (location.includes("mien trung")) return "Miền Trung";
  if (location.includes("mien nam")) return "Miền Nam";
  return "Miền Bắc";
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
  if (club.slug)
    return club.slug.replace(
      /-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
      "",
    );
  const name = club.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return name || "clb";
}

/** Bridge a name-only URL to an older API that still resolves UUID URLs. */
export function legacyClubDetailSlug(
  slug: string,
  clubs: Organization[],
): string | undefined {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) ||
    /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(slug)
  )
    return undefined;
  const matches = clubs.filter(
    (club) => club.isApproved && clubSlug(club) === slug.toLowerCase(),
  );
  if (matches.length > 1)
    throw new Error(
      "Nhiều câu lạc bộ có cùng slug. Cần đặt tên khác nhau để mở đúng câu lạc bộ.",
    );
  const club = matches[0];
  if (
    !club ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      club.id,
    )
  )
    return undefined;
  return `${clubSlug(club)}-${club.id}`;
}

export function safeMediaUrl(value?: string | null) {
  return value && /^(?:\/(?!\/)|https?:\/\/)/i.test(value) ? value : undefined;
}

/** Structured contacts take precedence; old free-text contacts remain readable. */
export function clubContacts(
  club: Pick<Organization, "details" | "contactInfo">,
): ClubContact[] {
  const saved = normalizeClubDetails(club.details).contacts;
  if (saved.length) return saved;
  const contacts: ClubContact[] = [];
  for (const segment of (club.contactInfo || "").split(/[|;\n]+/)) {
    const pattern = /(?:\+84|0)(?:[ .()-]*\d){8,10}/g;
    let last = 0;
    for (const match of segment.matchAll(pattern)) {
      const prefix = segment
        .slice(last, match.index)
        .replace(/SĐT\s*\/\s*Zalo\s*:|SĐT\s*:|Zalo\s*:|điện thoại\s*:/gi, "")
        .replace(/^[\s:,-]+|[\s:,-]+$/g, "");
      const role = prefix.match(/\(([^)]+)\)/)?.[1] || "";
      contacts.push({
        name: prefix.replace(/\([^)]+\)/g, "").trim() || "Người phụ trách CLB",
        role,
        phone: match[0].trim(),
      });
      last = match.index! + match[0].length;
    }
  }
  return contacts.slice(0, 20);
}
