"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api-client";
import { ClubDetailView } from "@/components/clubs/ClubDetailView";
import { MediaUpload } from "@/components/MediaUpload";
import {
  ClubDetails,
  clubContacts,
  clubRegion,
  CLUB_REGIONS,
  type ClubRegion,
  clubSlug,
  emptyClubDetails,
  normalizeClubDetails,
  Organization,
  splitClubSports,
} from "@/lib/organizations";
import ClubContactsEditor from "@/components/clubs/ClubContactsEditor";
import editorStyles from "@/components/clubs/club-editor.module.css";

const TiptapEditor = dynamic(
  () => import("@/components/TiptapEditor").then((m) => m.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-xl bg-[var(--club-border)]" />
    ),
  },
);
const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-[var(--club-border)] bg-[var(--club-surface)] px-3 py-2 text-base text-[var(--club-text)] outline-none placeholder:text-[var(--club-muted)] focus:border-[var(--club-text)]/40 focus:ring-2 focus:ring-[var(--focus-ring)]";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--club-text)]/25 px-4 py-2 text-sm transition hover:bg-[var(--club-contrast)]/5 disabled:cursor-not-allowed disabled:opacity-50";

export default function ClubDetailsEditor() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const router = useRouter();
  const { language } = useLanguage();
  const vi = language === "vi";
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const authorized = role === "ADMIN" || role === "SUPER_ADMIN";
  const [club, setClub] = useState<Organization | null>(null);
  const [details, setDetails] = useState<ClubDetails>({ ...emptyClubDetails });
  const [saved, setSaved] = useState(JSON.stringify(emptyClubDetails));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [preview, setPreview] = useState(false);
  const dirty = !!club && JSON.stringify(details) !== saved;
  const text = useCallback((vn: string, en: string) => (vi ? vn : en), [vi]);
  const update = <K extends keyof ClubDetails>(key: K, value: ClubDetails[K]) =>
    setDetails((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/${language}/login`);
    if (status === "authenticated" && !authorized)
      router.replace(`/${language}`);
  }, [status, authorized, router, language]);

  useEffect(() => {
    if (status !== "authenticated" || !authorized || !id) return;
    let active = true;
    setLoading(true);
    setError("");
    apiClient
      .get(`/organizations/admin/item/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? text("Không tìm thấy câu lạc bộ.", "Club not found.")
              : text("Không thể tải dữ liệu.", "Unable to load club."),
          );
        const data: Organization = await res.json();
        if (!active) return;
        const initial = {
          ...normalizeClubDetails(data.details),
          contacts: clubContacts(data),
          region: clubRegion(data),
        };
        setClub(data);
        setDetails(initial);
        setSaved(JSON.stringify(initial));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, status, authorized, retry, text]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    if (dirty) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...details,
        gallery: details.gallery.filter(Boolean),
        facilities: details.facilities.map((s) => s.trim()).filter(Boolean),
      };
      const res = await apiClient.put(
        `/organizations/${encodeURIComponent(id)}/details`,
        payload,
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(" · ")
            : body?.message ||
                text(
                  "Không thể lưu. Vui lòng thử lại.",
                  "Unable to save. Please try again.",
                ),
        );
      }
      const data: Organization = await res.json();
      const latest = {
        ...normalizeClubDetails(data.details),
        contacts: clubContacts(data),
      };
      setClub(data);
      setDetails(latest);
      setSaved(JSON.stringify(latest));
      toast.success(text("Đã lưu chi tiết câu lạc bộ.", "Club details saved."));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : text("Lỗi kết nối.", "Connection error."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || status !== "authenticated" || !authorized)
    return (
      <div
        role="status"
        className={`${editorStyles.surface} flex min-h-64 items-center justify-center gap-3 bg-[var(--club-bg)] text-[var(--club-muted)]`}
      >
        <Loader2 size={20} className="animate-spin" />
        {text("Đang tải thông tin câu lạc bộ…", "Loading club…")}
      </div>
    );
  if (!club)
    return (
      <div
        role="alert"
        className={`${editorStyles.surface} rounded-2xl border border-[var(--club-border)] bg-[var(--club-bg)] p-10 text-center text-[var(--club-text)]`}
      >
        <p className="mb-5">{error}</p>
        <button onClick={() => setRetry((n) => n + 1)} className={buttonClass}>
          {text("Thử lại", "Try again")}
        </button>
        <Link href="/admin/organizations" className="ml-5 underline">
          {text("Về danh sách", "Back to clubs")}
        </Link>
      </div>
    );

  const completed = [
    details.tagline,
    details.coverImage,
    details.content.replace(/<[^>]*>/g, "").trim(),
    details.joiningInstructions,
    details.facilities.length,
    details.gallery.filter(Boolean).length,
  ].filter(Boolean).length;
  return (
    <div
      className={`${editorStyles.surface} -m-4 min-h-screen bg-[var(--club-bg)] p-4 text-[var(--club-text)] sm:-m-6 sm:p-6 lg:p-8`}
    >
      <div className="mx-auto max-w-[1200px]">
        <button
          type="button"
          onClick={() => {
            if (
              !dirty ||
              window.confirm(
                text(
                  "Bạn có thay đổi chưa lưu. Rời khỏi trang?",
                  "You have unsaved changes. Leave this page?",
                ),
              )
            )
              router.push(`/${language}/admin/organizations`);
          }}
          className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--club-muted)] hover:underline"
        >
          <ArrowLeft size={16} />
          {text("Quản lý câu lạc bộ", "Club management")}
        </button>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm text-[var(--club-muted)]">
              {text(
                "Không gian biên tập / Câu lạc bộ",
                "Editorial space / Clubs",
              )}
            </p>
            <h1 className="text-3xl font-semibold tracking-[-1.2px] sm:text-4xl">
              {text("Kể câu chuyện của câu lạc bộ.", "Tell your club’s story.")}
            </h1>
            <p className="mt-3 text-[var(--club-muted)]">{club.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              aria-live="polite"
              className="text-sm text-[var(--club-muted)]"
            >
              {saving
                ? text("Đang lưu…", "Saving…")
                : dirty
                  ? text("Có thay đổi chưa lưu", "Unsaved changes")
                  : text("Đã đồng bộ", "Up to date")}
            </span>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className={buttonClass}
            >
              {preview ? <FileText size={16} /> : <Eye size={16} />}
              {preview
                ? text("Biên tập", "Edit")
                : text("Xem trước", "Preview")}
            </button>
            <button
              type="submit"
              form="club-details-form"
              disabled={saving || !dirty}
              className={`${buttonClass} !border-[var(--club-text)] !bg-[var(--club-contrast)] text-[var(--club-on-contrast)] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.2)]`}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {text("Lưu chi tiết", "Save details")}
            </button>
          </div>
        </div>
        {!club.isApproved && (
          <p className="mb-6 rounded-xl border border-[var(--club-border)] px-5 py-4 text-sm text-[var(--club-muted)]">
            {text(
              "CLB đang chờ duyệt. Nội dung có thể được lưu và xem trước; trang công khai xuất hiện sau khi CLB được phê duyệt.",
              "This club is pending approval. Save and preview its content here; the public page becomes available after approval.",
            )}
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800"
          >
            {error}
          </div>
        )}
        {/* Keep the form mounted so saving and native validation also work from preview. */}
        <form
          id="club-details-form"
          onSubmit={save}
          onInvalidCapture={() => setPreview(false)}
          className={
            preview
              ? "hidden"
              : "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
          }
        >
          <fieldset
            disabled={saving}
            className="min-w-0 space-y-6 disabled:opacity-70"
          >
            <section className="rounded-2xl border border-[var(--club-border)] p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--club-border)] text-sm">
                  01
                </span>
                <div>
                  <h2 className="text-xl font-semibold">
                    {text("Ấn tượng đầu tiên", "First impressions")}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--club-muted)]">
                    {text(
                      "Một lời giới thiệu ngắn và hình ảnh mang dấu ấn riêng.",
                      "An introduction and a cover that feel like your club.",
                    )}
                  </p>
                </div>
              </div>
              <label className="mb-6 block text-sm">
                {text("Khu vực", "Region")}
                <select
                  className={inputClass}
                  value={details.region}
                  onChange={(event) =>
                    update("region", event.target.value as ClubRegion)
                  }
                >
                  {CLUB_REGIONS.map((region) => (
                    <option value={region} key={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                {text("Thông điệp câu lạc bộ", "Club tagline")}
                <input
                  maxLength={240}
                  value={details.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder={text(
                    "VD: Cùng nhau vượt giới hạn, mỗi ngày.",
                    "e.g. Moving beyond limits, together.",
                  )}
                  className={inputClass}
                />
              </label>
              <div className="mt-6">
                <p className="mb-3 text-sm">{text("Ảnh bìa", "Cover image")}</p>
                <MediaUpload
                  value={details.coverImage}
                  onChange={(value) => update("coverImage", value)}
                  type="image"
                />
                <p className="mt-2 text-xs text-[var(--club-muted)]">
                  {text(
                    "Nên dùng ảnh ngang. Khi để trống, trang sử dụng ảnh CLB hiện có.",
                    "A landscape image works best. Leave empty to use the existing club image.",
                  )}
                </p>
              </div>
            </section>
            <section className="rounded-2xl border border-[var(--club-border)] p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--club-border)] text-sm">
                  02
                </span>
                <h2 className="text-xl font-semibold">
                  {text("Câu chuyện & hoạt động", "Story & activities")}
                </h2>
              </div>
              <p className="mb-4 text-sm text-[var(--club-muted)]">
                {text(
                  "Bổ sung hành trình, đội ngũ, chương trình tập luyện hoặc thành tích. Nội dung này hiển thị bên dưới giới thiệu cơ bản của CLB.",
                  "Share your journey, team, training or achievements. This appears below the club’s basic introduction.",
                )}
              </p>
              <TiptapEditor
                value={details.content}
                onChange={(value) => update("content", value)}
              />
              <label className="mt-6 block text-sm">
                {text("Năm thành lập", "Founded in")}
                <input
                  type="number"
                  min={1000}
                  max={new Date().getFullYear()}
                  value={details.foundedYear}
                  onChange={(e) => update("foundedYear", e.target.value)}
                  placeholder="2020"
                  className={inputClass}
                />
              </label>
            </section>
            <section className="rounded-2xl border border-[var(--club-border)] p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--club-border)] text-sm">
                  03
                </span>
                <h2 className="text-xl font-semibold">
                  {text("Trải nghiệm tại câu lạc bộ", "The club experience")}
                </h2>
              </div>
              <label className="block text-sm">
                {text(
                  "Tiện ích & hỗ trợ — mỗi dòng một mục (tối đa 20)",
                  "Facilities & support — one per line (up to 20)",
                )}
                <textarea
                  rows={5}
                  value={details.facilities.join("\n")}
                  onChange={(e) =>
                    update("facilities", e.target.value.split("\n"))
                  }
                  placeholder={text(
                    "Lối đi dành cho xe lăn\nHuấn luyện viên chuyên môn\nDụng cụ tập luyện phù hợp",
                    "Wheelchair access\nQualified coaches\nAdapted equipment",
                  )}
                  className={inputClass}
                />
              </label>
              <label className="mt-6 block text-sm">
                {text("Hướng dẫn tham gia", "How to join")}
                <textarea
                  rows={5}
                  maxLength={5000}
                  value={details.joiningInstructions}
                  onChange={(e) =>
                    update("joiningInstructions", e.target.value)
                  }
                  placeholder={text(
                    "Cách đăng ký, chi phí, vật dụng cần chuẩn bị và những điều cần lưu ý…",
                    "Registration, fees, what to bring and anything else to know…",
                  )}
                  className={inputClass}
                />
              </label>
            </section>
            <section className="rounded-2xl border border-[var(--club-border)] p-5 sm:p-8">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-xl font-semibold">
                  <ImagePlus size={21} />
                  {text("Thư viện khoảnh khắc", "Club gallery")}
                </h2>
                <span className="text-sm text-[var(--club-muted)]">
                  {details.gallery.length}/12
                </span>
              </div>
              <p className="mb-6 text-sm text-[var(--club-muted)]">
                {text(
                  "Giới thiệu không gian tập luyện và hoạt động thực tế.",
                  "Show the training space and everyday club life.",
                )}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {details.gallery.map((url, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--club-border)] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm">
                        {text("Ảnh", "Image")} {index + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`${text("Xóa ảnh", "Remove image")} ${index + 1}`}
                        onClick={() =>
                          update(
                            "gallery",
                            details.gallery.filter((_, i) => i !== index),
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-[var(--club-border)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <MediaUpload
                      type="image"
                      value={url}
                      onChange={(value) =>
                        update(
                          "gallery",
                          details.gallery.map((item, i) =>
                            i === index ? value : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={details.gallery.length >= 12}
                onClick={() => update("gallery", [...details.gallery, ""])}
                className={`${buttonClass} mt-5`}
              >
                <Plus size={16} />
                {text("Thêm ảnh", "Add image")}
              </button>
            </section>
            <section className="rounded-2xl border border-[var(--club-border)] p-5 sm:p-8">
              <h2 className="mb-6 text-xl font-semibold">
                {text("Kênh kết nối", "Ways to connect")}
              </h2>
              <p className="mb-5 text-sm text-[var(--club-muted)]">
                {text(
                  "Bổ sung các nút liên hệ trực tiếp bên cạnh thông tin cơ bản hiện có.",
                  "Add direct contact buttons alongside existing contact information.",
                )}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm">
                  {text("Điện thoại", "Phone")}
                  <input
                    type="tel"
                    maxLength={40}
                    pattern="[+0-9\s().\-]*"
                    value={details.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm">
                  Email
                  <input
                    type="email"
                    maxLength={254}
                    value={details.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm">
                Website
                <input
                  type="url"
                  maxLength={2000}
                  pattern="https?://.*"
                  value={details.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://"
                  className={inputClass}
                />
              </label>
              <ClubContactsEditor
                value={details.contacts}
                onChange={(contacts) => update("contacts", contacts)}
                language={language}
              />
            </section>
          </fieldset>
          <aside className="space-y-5 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-[var(--club-border)] p-6">
              <p className="mb-3 text-sm text-[var(--club-muted)]">
                {text("Hồ sơ câu lạc bộ", "Club profile")}
              </p>
              <h2 className="text-xl font-semibold">{club.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--club-muted)]">
                {splitClubSports(club.sport).join(" · ")}
                <br />
                {club.location}
              </p>
              <div className="mt-5 border-t border-[var(--club-border)] pt-5 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${club.isApproved ? "bg-emerald-700" : "bg-amber-700"}`}
                  />
                  {club.isApproved
                    ? text("Đã phê duyệt", "Approved")
                    : text("Chờ phê duyệt", "Pending approval")}
                </span>
                {club.isApproved && (
                  <Link
                    href={`/clubs/detail/${clubSlug(club)}`}
                    target="_blank"
                    className="mt-5 flex min-h-11 items-center gap-2 underline underline-offset-4"
                  >
                    {text("Mở trang công khai", "Open public page")}
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--club-contrast)] p-6 text-[var(--club-on-contrast)]">
              <p className="text-sm text-[var(--club-on-contrast)]/65">
                {text("Từng chút một, rõ nét hơn", "A little more complete")}
              </p>
              <p className="my-4 text-4xl font-semibold tracking-[-1.2px]">
                {completed}
                <span className="text-xl text-[var(--club-on-contrast)]/50">
                  {" "}
                  / 6
                </span>
              </p>
              <div
                role="progressbar"
                aria-label={text(
                  "Mức độ hoàn thiện nội dung",
                  "Content completeness",
                )}
                aria-valuenow={completed}
                aria-valuemin={0}
                aria-valuemax={6}
                className="h-1.5 overflow-hidden rounded-full bg-[var(--club-on-contrast)]/15"
              >
                <div
                  className="h-full bg-[var(--club-on-contrast)] transition-all"
                  style={{ width: `${(completed / 6) * 100}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--club-on-contrast)]/70">
                {text(
                  "Thông điệp, ảnh bìa, câu chuyện, hướng dẫn, tiện ích và hình ảnh giúp mọi người hiểu hơn về CLB.",
                  "A tagline, cover, story, joining guide, facilities and photos help people get to know your club.",
                )}
              </p>
            </div>
            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-[var(--club-muted)]">
              <Check size={15} className="shrink-0" />
              {text(
                "Nội dung được hiển thị trên trang công khai sau khi lưu, với CLB đã được duyệt.",
                "Saved content appears on the public page for approved clubs.",
              )}
            </p>
          </aside>
        </form>
        {preview && (
          <div className="overflow-hidden rounded-2xl border border-[var(--club-border)]">
            <div className="border-b border-[var(--club-border)] px-6 py-3 text-sm text-[var(--club-muted)]">
              {dirty
                ? text(
                    "Xem trước nội dung hiện tại · Chưa lưu thay đổi",
                    "Preview of the current content · Save to publish changes",
                  )
                : text(
                    "Xem trước · Nội dung đã lưu",
                    "Preview · Saved content",
                  )}
            </div>
            <ClubDetailView club={{ ...club, details }} preview />
          </div>
        )}
      </div>
    </div>
  );
}
