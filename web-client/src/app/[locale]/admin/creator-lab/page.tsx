import { redirect } from "next/navigation";

export default async function CreatorLabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/admin/creator-lab/courses`);
}
