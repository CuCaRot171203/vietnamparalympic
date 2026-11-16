import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowRight, Newspaper } from "lucide-react";
import styles from "./home-opening.module.css";
import StatsSpotlight from "./StatsSpotlight";
import HomeClubs from "./HomeClubs";
import type { Statistic } from "./StatsSpotlight";

const calvera = localFont({
  src: "../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-opening-calvera",
});
const neusharp = localFont({
  src: "../../public/KV/1FTVVIPNeusharp-Italic.ttf",
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-opening-neusharp",
});

export default function HomeOpening({
  language,
  statistics,
  sports,
}: {
  language: string;
  statistics: Statistic[];
  sports: { nameVi: string; nameEn?: string }[];
}) {
  const vi = language === "vi";
  return (
    <div className={styles.opening}>
      <Image
        src="/DES/homes/HEADER_CLB_DEV.webp"
        alt=""
        width={5760}
        height={7008}
        priority
        sizes="100vw"
        className={styles.image}
      />
      <section
        className={`${styles.hero} ${calvera.variable} ${neusharp.variable}`}
        aria-labelledby="opening-heading"
      >
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.heroBody}>
          <div className={styles.content}>
            <div className={styles.identity}>
              <span className={styles.badge}>
                <span aria-hidden="true" />
                Vietnam ParaSports 2026
              </span>
              <h1 id="opening-heading" className={styles.headline}>
                {vi ? "DI SẢN VINH QUANG" : "A LEGACY OF GLORY"}
              </h1>
              <p className={styles.tagline}>
                {vi ? "KHƠI LỬA ĐAM MÊ" : "IGNITING PASSION"}
              </p>
            </div>
            <div className={styles.introduction}>
              <p className={styles.description}>
                {vi
                  ? "Tiếp nối những giá trị của thể thao người khuyết tật Việt Nam, cùng khám phá các môn thể thao, kết nối cộng đồng và mở thêm cơ hội tập luyện cho người khuyết tật."
                  : "Building on the values of para sport in Vietnam, discover sports, connect with the community and open up more opportunities for people with disabilities to train."}
              </p>
              <div className={styles.actions}>
                <Link
                  href={`/${language}/clubs`}
                  className={styles.primaryAction}
                >
                  {vi ? "Khám phá câu lạc bộ" : "Explore sports clubs"}
                  <span aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={1.7} />
                  </span>
                </Link>
                <Link
                  href={`/${language}/news`}
                  className={styles.secondaryAction}
                >
                  <Newspaper size={15} strokeWidth={1.5} aria-hidden="true" />
                  {vi ? "Tin tức & Sự kiện" : "News & Events"}
                </Link>
              </div>
            </div>
          </div>
          <StatsSpotlight statistics={statistics} language={language} />
        </div>
      </section>
      <HomeClubs language={language} sports={sports} />
    </div>
  );
}
