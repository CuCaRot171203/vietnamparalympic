"use client";

import styles from "./club-editor.module.css";
import DOMPurify from "isomorphic-dompurify";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  Activity,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/useTranslation";
import { normalizeClubDetails, Organization, safeMediaUrl, splitClubSports } from "@/lib/organizations";

export function ClubDetailView({
  club,
  preview = false,
}: {
  club: Organization;
  preview?: boolean;
}) {
  const { language } = useLanguage();
  const vi = language === "vi";
  const d = normalizeClubDetails(club.details);
  const image = safeMediaUrl(d.coverImage) || safeMediaUrl(club.imageUrl);
  const gallery = d.gallery.filter(safeMediaUrl);
  const phone = /^[+\d\s().-]+$/.test(d.phone) ? d.phone.replace(/[^+\d]/g, "") : "";
  const website = /^https?:\/\//i.test(d.website) ? d.website : "";
  const facts = [
    { icon: MapPin, title: vi ? "Địa điểm tập luyện" : "Training location", value: club.location },
    {
      icon: CalendarDays,
      title: vi ? "Lịch sinh hoạt" : "Training schedule",
      value: club.schedule,
    },
    { icon: Users, title: vi ? "Dành cho" : "Who can join", value: club.suitableFor },
  ];
  return (
    <div
      className={`${styles.surface} min-h-screen bg-[var(--club-bg)] text-[var(--club-text)] selection:bg-[var(--club-border)]`}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
        {!preview && (
          <Link
            href="/clubs"
            className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--club-muted)] hover:underline"
          >
            <ArrowLeft size={16} />
            {vi ? "Tất cả câu lạc bộ" : "All clubs"}
          </Link>
        )}
        <header className="grid items-end gap-8 pb-10 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-[var(--club-muted)]">
              {splitClubSports(club.sport).length > 0 ? (
                splitClubSports(club.sport).map((clubSport) => (
                  <span
                    key={clubSport}
                    className="rounded-full border border-[var(--club-text)]/20 px-3 py-1"
                  >
                    {clubSport}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-[var(--club-text)]/20 px-3 py-1">
                  {vi ? "Thể thao cộng đồng" : "Community sports"}
                </span>
              )}
              <span>Vietnam ParaSports · {vi ? "Câu lạc bộ" : "Club"}</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-1.2px] sm:text-5xl lg:text-6xl">
              {club.name}
            </h1>
            {d.tagline && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--club-muted)]">
                {d.tagline}
              </p>
            )}
          </div>
          <a
            href="#club-contact"
            className="inline-flex min-h-12 w-fit items-center justify-center gap-4 rounded-md bg-[var(--club-contrast)] px-6 py-3 text-[var(--club-on-contrast)] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.2)] transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {vi ? "Kết nối với câu lạc bộ" : "Connect with the club"}
            <ArrowUpRight size={18} />
          </a>
        </header>

        <div className="relative overflow-hidden rounded-2xl border border-[var(--club-border)] bg-[linear-gradient(120deg,#e9e1d3,#eee5df_45%,#dce3df)] dark:bg-[linear-gradient(120deg,#303028,#302a29_45%,#263330)]">
          {image ? (
            <img
              src={image}
              alt={club.name}
              className="aspect-[16/7] max-h-[480px] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/7] max-h-[400px] items-center justify-center">
              <Activity className="h-24 w-24 text-[var(--club-text)]/25" strokeWidth={1} />
            </div>
          )}
          {d.foundedYear && (
            <span className="absolute bottom-5 left-5 rounded-md bg-[var(--club-bg)] px-4 py-2 text-sm">
              {vi ? "Đồng hành từ" : "Together since"} {d.foundedYear}
            </span>
          )}
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:py-16">
          <div className="min-w-0 space-y-14">
            <nav
              aria-label={vi ? "Nội dung trang" : "Page sections"}
              className="flex flex-wrap gap-5 border-b border-[var(--club-border)] pb-5 text-sm text-[var(--club-muted)]"
            >
              <a href="#club-about" className="hover:underline">
                {vi ? "Giới thiệu" : "About"}
              </a>
              {d.facilities.length > 0 && (
                <a href="#club-facilities" className="hover:underline">
                  {vi ? "Tiện ích" : "Facilities"}
                </a>
              )}
              {gallery.length > 0 && (
                <a href="#club-gallery" className="hover:underline">
                  {vi ? "Hình ảnh" : "Gallery"}
                </a>
              )}
              <a href="#club-join" className="hover:underline">
                {vi ? "Tham gia" : "Joining"}
              </a>
            </nav>
            <section id="club-about" className="scroll-mt-44">
              <p className="mb-3 text-sm text-[var(--club-muted)]">
                01 / {vi ? "Câu chuyện của chúng tôi" : "Our story"}
              </p>
              <h2 className="mb-6 text-3xl font-semibold tracking-[-0.9px]">
                {vi ? "Một cộng đồng. Nhiều khả năng." : "One community. Many possibilities."}
              </h2>
              {club.description && (
                <div
                  className="prose max-w-none text-[var(--club-muted)] prose-headings:font-semibold prose-headings:text-[var(--club-text)]"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(club.description) }}
                />
              )}
              {d.content && (
                <div
                  className="prose mt-6 max-w-none text-[var(--club-text)]/80 prose-headings:font-semibold prose-headings:text-[var(--club-text)] prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(d.content) }}
                />
              )}
              {!club.description && !d.content && (
                <p className="text-[var(--club-muted)]">
                  {vi
                    ? "Thông tin giới thiệu đang được cập nhật. Bạn có thể liên hệ trực tiếp để tìm hiểu thêm."
                    : "An introduction is coming soon. Contact the club to learn more."}
                </p>
              )}
            </section>
            {d.facilities.length > 0 && (
              <section id="club-facilities" className="scroll-mt-44">
                <p className="mb-3 text-sm text-[var(--club-muted)]">
                  02 / {vi ? "Không gian cho bạn" : "A space for you"}
                </p>
                <h2 className="mb-6 text-3xl font-semibold tracking-[-0.9px]">
                  {vi ? "Tiện ích & hỗ trợ" : "Facilities & support"}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {d.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-[var(--club-border)] p-4"
                    >
                      <Check size={18} className="mt-0.5 shrink-0" />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {gallery.length > 0 && (
              <section id="club-gallery" className="scroll-mt-44">
                <h2 className="mb-6 text-3xl font-semibold tracking-[-0.9px]">
                  {vi ? "Những khoảnh khắc cùng nhau" : "Moments together"}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${vi ? "Mở ảnh" : "Open image"} ${index + 1}`}
                    >
                      <img
                        src={url}
                        alt={`${club.name} — ${vi ? "hoạt động" : "activity"} ${index + 1}`}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-xl border border-[var(--club-border)] object-cover transition hover:opacity-80"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
            <section
              id="club-join"
              className="scroll-mt-44 rounded-2xl border border-[var(--club-border)] p-6 sm:p-8"
            >
              <p className="mb-3 text-sm text-[var(--club-muted)]">
                {vi ? "Bước đầu tiên" : "Your first step"}
              </p>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.9px]">
                {vi ? "Hẹn gặp bạn ở buổi tập tới." : "See you at the next session."}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-[var(--club-muted)]">
                {d.joiningInstructions ||
                  (vi
                    ? "Liên hệ với người phụ trách để được tư vấn lịch tập và điều kiện tham gia phù hợp với bạn."
                    : "Contact the club coordinator to find a training session and participation options that suit you.")}
              </p>
              <a
                href="#club-contact"
                className="mt-6 inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
              >
                {vi ? "Thông tin liên hệ" : "Contact details"}
                <ArrowUpRight size={16} />
              </a>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-44 lg:self-start">
            <div className="rounded-2xl border border-[var(--club-border)] p-6">
              <h2 className="mb-6 text-xl font-semibold">
                {vi ? "Thông tin nhanh" : "At a glance"}
              </h2>
              <dl className="space-y-6">
                {facts.map(({ icon: Icon, title, value }) => (
                  <div key={title} className="flex gap-3">
                    <Icon size={19} className="mt-0.5 shrink-0 text-[var(--club-muted)]" />
                    <div>
                      <dt className="mb-1 text-sm text-[var(--club-muted)]">{title}</dt>
                      <dd className="whitespace-pre-line leading-relaxed">
                        {value || (vi ? "Đang cập nhật" : "Coming soon")}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
            <section
              id="club-contact"
              className="scroll-mt-44 rounded-2xl bg-[var(--club-contrast)] p-6 text-[var(--club-on-contrast)]"
            >
              <p className="mb-2 text-sm text-[var(--club-on-contrast)]/65">
                {vi ? "Chúng tôi luôn sẵn lòng" : "We are here to help"}
              </p>
              <h2 className="mb-5 text-2xl font-semibold">
                {vi ? "Cùng bắt đầu nhé." : "Let’s get started."}
              </h2>
              {club.contactInfo && (
                <p className="mb-5 whitespace-pre-line break-words text-sm leading-relaxed text-[var(--club-on-contrast)]/80">
                  {club.contactInfo}
                </p>
              )}
              <div className="space-y-3 text-sm">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex min-h-11 items-center gap-3 break-all rounded-md border border-[var(--club-on-contrast)]/20 px-3 py-2 hover:bg-[var(--club-on-contrast)]/5"
                  >
                    <Phone size={17} />
                    {d.phone}
                  </a>
                )}
                {d.email && (
                  <a
                    href={`mailto:${d.email}`}
                    className="flex min-h-11 items-center gap-3 break-all rounded-md border border-[var(--club-on-contrast)]/20 px-3 py-2 hover:bg-[var(--club-on-contrast)]/5"
                  >
                    <Mail size={17} />
                    {d.email}
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--club-on-contrast)]/20 px-3 py-2 hover:bg-[var(--club-on-contrast)]/5"
                  >
                    <Globe size={17} />
                    {vi ? "Website câu lạc bộ" : "Club website"}
                    <ArrowUpRight size={15} />
                  </a>
                )}
                {!club.contactInfo && !phone && !d.email && !website && (
                  <p className="text-[var(--club-on-contrast)]/70">
                    {vi
                      ? "Thông tin liên hệ đang được cập nhật."
                      : "Contact information is coming soon."}
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
