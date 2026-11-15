"use client";
import styles from "@/components/clubs/club-editor.module.css";
import { useLanguage } from "@/hooks/useTranslation";
export default function Error({ reset }: { reset: () => void }) {
  const { language } = useLanguage();
  return (
    <div
      role="alert"
      className={`${styles.surface} bg-[var(--club-bg)] px-6 py-24 text-center text-[var(--club-text)]`}
    >
      <h2 className="mb-6 text-2xl font-semibold">
        {language === "vi" ? "Chưa thể tải thông tin câu lạc bộ" : "Unable to load the club"}
      </h2>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--club-contrast)] px-6 py-3 text-[var(--club-on-contrast)]"
      >
        {language === "vi" ? "Thử lại" : "Try again"}
      </button>
    </div>
  );
}
