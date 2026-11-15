import styles from "@/components/clubs/club-editor.module.css";
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading club"
      className={`${styles.surface} space-y-8 bg-[var(--club-bg)] px-6 py-16`}
    >
      <div className="mx-auto h-16 max-w-5xl animate-pulse rounded-xl bg-[var(--club-border)]" />
      <div className="mx-auto aspect-[16/7] max-w-5xl animate-pulse rounded-2xl bg-[var(--club-border)]" />
    </div>
  );
}
