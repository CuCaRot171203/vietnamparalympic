import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubDetailView } from "@/components/clubs/ClubDetailView";
import type { Organization } from "@/lib/organizations";
import { relatedClubs } from "@/lib/club-presentation";

const getClub = cache(async (slug: string): Promise<Organization> => {
  const configured =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:3001/api/v1";
  const base = new URL(
    "/api/v1/",
    configured.startsWith("http") ? configured : "http://127.0.0.1:3001",
  );
  const response = await fetch(
    new URL(`organizations/detail/${encodeURIComponent(slug)}`, base),
    {
      cache: "no-store",
    },
  );
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
    description:
      club.details?.tagline ||
      club.description?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params;
  const [club, candidates] = await Promise.all([
    getClub(slug),
    getClubCandidates(),
  ]);
  return (
    <ClubDetailView club={club} related={relatedClubs(club, candidates)} />
  );
}

async function getClubCandidates(): Promise<Organization[]> {
  try {
    const configured =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:3001/api/v1";
    const url = new URL(
      "/api/v1/organizations",
      configured.startsWith("http") ? configured : "http://127.0.0.1:3001",
    );
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const data = payload.data ?? payload;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
