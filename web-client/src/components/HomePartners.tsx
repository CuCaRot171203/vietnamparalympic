import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PartnersCarousel from "./PartnersCarousel";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import styles from "./home-partners.module.css";

type Partner = { id: string; name: string; logoUrl: string; website?: string };
export default function HomePartners({
  partners,
  language,
  loading,
}: {
  partners: Partner[];
  language: string;
  loading: boolean;
}) {
  const vi = language === "vi";
  return (
    <section
      id="home-partners"
      aria-labelledby="partners-heading"
      className={`${styles.section} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
    >
      <header className={styles.heading}>
        <span className={styles.badge}>
          <span aria-hidden="true" />
          {vi ? "ĐỒNG HÀNH" : "TOGETHER"}
        </span>
        <h2 id="partners-heading">
          {vi
            ? "CÙNG ĐỒNG HÀNH, TIẾP NỐI DI SẢN"
            : "TOGETHER, WE CARRY THE LEGACY FORWARD"}
        </h2>
        <p>
          {vi
            ? "Kết nối các cá nhân, tổ chức và đối tác cùng chung tay phát triển thể thao người khuyết tật Việt Nam."
            : "Connecting individuals, organisations and partners to develop sports for people with disabilities in Vietnam."}
        </p>
        <Link href={`/${language}/companion`} className={styles.join}>
          {vi ? "Đồng hành cùng chúng tôi" : "Join our journey"}
          <span aria-hidden="true">
            <ArrowRight size={17} />
          </span>
        </Link>
      </header>
      <div className={styles.logos}>
        {loading ? (
          <div className={styles.loading} role="status">
            {vi ? "Đang tải đối tác…" : "Loading partners…"}
          </div>
        ) : partners.length ? (
          <PartnersCarousel partners={partners} language={language} />
        ) : (
          <p className={styles.empty}>
            {vi
              ? "Thông tin đối tác đang được cập nhật."
              : "Partner information will be available soon."}
          </p>
        )}
      </div>
    </section>
  );
}
