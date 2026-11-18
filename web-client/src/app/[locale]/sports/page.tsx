import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import SportsDirectory, {
  type DirectorySport,
  type SportClass,
} from "@/components/sports/SportsDirectory";
import styles from "@/components/sports/sports-directory.module.css";

const calvera = localFont({
  src: "../../../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-directory-calvera",
});
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; sportId?: string; q?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title: `${locale === "vi" ? "Bộ môn & Thương tật" : "Sports & Classifications"} | Vietnam ParaSports`,
  };
}
async function read<T>(path: string): Promise<T[] | null> {
  try {
    const response = await apiClient.request(path, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
export default async function SportsPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const vi = locale === "vi";
  const [sports, classifications] = await Promise.all([
    read<DirectorySport>("/sports"),
    read<SportClass>("/sport-classifications"),
  ]);
  return (
    <main
      id="main-content"
      className={[
        styles.page,
        calvera.variable,
        homeBeVietnam.variable,
        homeNeusharp.variable,
      ].join(" ")}
    >
      <section className={styles.hero} aria-labelledby="directory-title">
        <div className={styles.background} aria-hidden="true" />
        <div className={styles.container}>
          <nav
            className={styles.breadcrumb}
            aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
          >
            <Link href={`/${locale}`}>{vi ? "Trang chủ" : "Home"}</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span aria-current="page">
              {vi ? "Bộ môn & Thương tật" : "Sports & Classifications"}
            </span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="directory-title">
                {vi ? (
                  <>
                    Bộ môn &<br />
                    Thương tật
                  </>
                ) : (
                  <>
                    Sports &<br />
                    Classifications
                  </>
                )}
              </h1>
              <div className={styles.heroIntro}>
                <p>
                  {vi
                    ? "Khám phá các môn thể thao, tìm hiểu hệ thống phân hạng và kết nối với hành trình thể thao phù hợp với bạn."
                    : "Explore sports, understand sport classifications and find your place in the sporting community."}
                </p>
                <a href="#sports-directory">
                  {vi ? "Bắt đầu khám phá" : "Start exploring"}
                  <span>
                    <ArrowDown size={16} />
                  </span>
                </a>
              </div>
            </div>
            <div className={styles.heroCollage}>
              <figure className={styles.mainPhoto}>
                <Image
                  src="/back_subjects/dien_kinh.jpg"
                  style={{ objectPosition: "62% center" }}
                  alt={
                    vi
                      ? "Vận động viên Việt Nam và người đồng hành tại sân điền kinh"
                      : "Vietnamese athletes and a companion at the athletics track"
                  }
                  fill
                  priority
                  sizes="(max-width:767px) 70vw, 32vw"
                />
                <figcaption>
                  {vi
                    ? "Chuyển động không giới hạn"
                    : "Movement without limits"}
                </figcaption>
              </figure>
              <figure className={styles.smallPhoto}>
                <Image
                  src="/CLUB/CLUB_01.jpg"
                  alt={
                    vi
                      ? "Cộng đồng câu lạc bộ thể thao người khuyết tật Việt Nam"
                      : "Vietnam’s community of sports clubs for people with disabilities"
                  }
                  fill
                  sizes="(max-width:767px) 40vw, 20vw"
                />
              </figure>
              <span className={styles.photoLabel}>
                Vietnam ParaSports
                <span>
                  {vi ? "Cùng nhau, vượt giới hạn" : "Beyond limits, together"}
                </span>
              </span>
            </div>
          </div>
          <div className={styles.heroNote}>
            <span>Vietnam ParaSports</span>
            <p>
              {vi
                ? "Mỗi bộ môn, một cơ hội. Mỗi hành trình, một dấu ấn."
                : "Every sport opens a door. Every journey leaves a mark."}
            </p>
          </div>
        </div>
      </section>
      <SportsDirectory
        key={[query.tab, query.sportId, query.q].join(":")}
        initialTab={query.tab === "classes" ? "classes" : "sports"}
        initialSportId={
          (sports || []).some((s) => s.id === query.sportId)
            ? query.sportId
            : ""
        }
        initialQuery={query.q?.slice(0, 1500) || ""}
        locale={locale}
        sports={sports ?? []}
        classifications={(classifications ?? []).map(
          ({
            id,
            sportId,
            code,
            description,
            medicalDesc,
            disabilityCriteria,
            requiresAssistant,
          }) => ({
            id,
            sportId,
            code,
            description,
            medicalDesc,
            disabilityCriteria,
            requiresAssistant,
          }),
        )}
        sportsError={sports === null}
        classesError={classifications === null}
      />
    </main>
  );
}
