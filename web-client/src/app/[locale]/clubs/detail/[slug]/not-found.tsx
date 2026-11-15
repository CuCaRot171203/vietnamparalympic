"use client";
import styles from "@/components/clubs/club-editor.module.css";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/useTranslation";
export default function NotFound() {
  const { language } = useLanguage();
  return (
    <div
      className={`${styles.surface} bg-[var(--club-bg)] px-6 py-24 text-center text-[var(--club-text)]`}
    >
      <h1 className="mb-4 text-3xl font-semibold">
        {language === "vi" ? "Không tìm thấy câu lạc bộ" : "Club not found"}
      </h1>
      <p className="mb-8 text-[var(--club-muted)]">
        {language === "vi"
          ? "Câu lạc bộ chưa được duyệt hoặc không còn tồn tại."
          : "This club is pending approval or no longer exists."}
      </p>
      <Link href="/clubs" className="underline">
        {language === "vi" ? "Về danh sách câu lạc bộ" : "Back to clubs"}
      </Link>
    </div>
  );
}
