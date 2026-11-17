import { SPORT_LOGOS } from "@/lib/sport-logos";
import { SPORT_BACKGROUNDS } from "@/lib/sport-assets";

export function sportImageSource(value?: string | null): string | null {
  const source = value?.trim();
  if (!source) return null;
  if (/^https?:\/\//i.test(source) || /^\/(?!\/)/.test(source)) return source;
  if (source.startsWith("uploads/")) return `/${source}`;
  return null;
}
export function sportIconSource(
  icon: string | null | undefined,
  slug: string,
): string | null {
  return (
    sportImageSource(icon) ||
    (SPORT_LOGOS[slug] ? `/subjects/${SPORT_LOGOS[slug]}` : null)
  );
}
export function sportThumbnailSource(
  thumbnail: string | null | undefined,
  slug: string,
): string {
  return (
    sportImageSource(thumbnail) ||
    (SPORT_BACKGROUNDS[slug]
      ? `/back_subjects/${SPORT_BACKGROUNDS[slug]}`
      : "/assets/homepage/creator-lab-launch.jpg")
  );
}
