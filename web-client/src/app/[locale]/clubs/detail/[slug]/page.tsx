import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubDetailView } from "@/components/clubs/ClubDetailView";
import type { Organization } from "@/lib/organizations";

const getClub = cache(async (slug: string): Promise<Organization> => {
  const configured =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:3001/api/v1";
  const base = new URL(
    "/api/v1/",
    configured.startsWith("http") ? configured : "http://127.0.0.1:3001"
  );
  const response = await fetch(new URL(`organizations/detail/${encodeURIComponent(slug)}`, base), {
    cache: "no-store",
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load club");
  const payload = await response.json();
  return payload.data ?? payload;
});

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const club = await getClub((await params).slug);
  return {
    title: club.name,
    description: club.details?.tagline || club.description?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function ClubDetailPage({ params }: Props) {
  const club = await getClub((await params).slug);
  return <ClubDetailView club={club} />;
}
