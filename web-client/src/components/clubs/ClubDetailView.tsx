"use client";

import listStyles from "@/components/rich-text-lists.module.css";

import { useEffect, useState } from "react";
import Image from "next/image";
import { sanitizeRichText } from "@/lib/rich-text";
import { ConfigProvider, Modal, theme } from "antd";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Coins,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/useTranslation";
import {
  normalizeClubDetails,
  clubContacts,
  type Organization,
  safeMediaUrl,
  splitClubSports,
} from "@/lib/organizations";
import { clubCover, trainingSessions } from "@/lib/club-presentation";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import { ClubSummaryCard } from "./ClubsDirectory";
import styles from "./club-detail.module.css";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.badge}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
function ClubImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <Image
      src={failed ? "/CLUB/CLUB_02.jpg" : src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}
export function ClubDetailView({
  club,
  related = [],
  preview = false,
}: {
  club: Organization;
  related?: Organization[];
  preview?: boolean;
}) {
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const vi = language === "vi";
  const d = normalizeClubDetails(club.details);
  const [contactMode, setContactMode] = useState<"join" | "contact" | null>(
    null,
  );
  const [shareStatus, setShareStatus] = useState("");
  const cover = clubCover(club);
  const gallery = [
    ...new Set(
      d.gallery
        .map(safeMediaUrl)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const galleryImages = gallery.length
    ? gallery
    : [
        ...new Set(
          [safeMediaUrl(d.coverImage), safeMediaUrl(club.imageUrl)].filter(
            (value): value is string => Boolean(value),
          ),
        ),
      ];
  const coordinators = clubContacts(club);
  const phoneSource =
    d.phone || club.contactInfo?.match(/(?:\+84|0)[\d ().-]{8,20}/)?.[0] || "";
  const phone = /^[+\d\s().-]+$/.test(phoneSource)
    ? phoneSource.replace(/[^+\d]/g, "")
    : "";
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) ? d.email : "";
  const website = /^https?:\/\//i.test(d.website) ? d.website : "";
  const canMap =
    Boolean(club.location?.trim()) ||
    (typeof club.lat === "number" && typeof club.lng === "number");
  const mapQuery =
    typeof club.lat === "number" && typeof club.lng === "number"
      ? club.lat + "," + club.lng
      : club.location || "";
  const mapUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(mapQuery);
  const sessions = trainingSessions(club.schedule, vi);
  const joinItems = [
    club.suitableFor,
    ...d.joiningInstructions.split(/\n/),
  ].filter((value): value is string => Boolean(value?.trim()));
  const updated =
    club.updatedAt && Number.isFinite(new Date(club.updatedAt).getTime())
      ? new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date(club.updatedAt))
      : "";
  const facts = [
    {
      Icon: MapPin,
      label: vi ? "Địa điểm" : "Location",
      value: club.location || (vi ? "Đang cập nhật" : "Coming soon"),
    },
    {
      Icon: CalendarDays,
      label: vi ? "Lịch tập" : "Training",
      value: club.schedule || (vi ? "Liên hệ CLB" : "Contact the club"),
    },
    {
      Icon: Coins,
      label: vi ? "Học phí" : "Training fee",
      value: vi ? "Liên hệ CLB" : "Contact the club",
    },
    {
      Icon: Users,
      label: vi ? "Đối tượng" : "Who can join",
      value:
        club.suitableFor ||
        (vi ? "Liên hệ để được tư vấn" : "Contact for guidance"),
    },
  ];
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus(vi ? "Đã sao chép liên kết CLB" : "Club link copied");
    } catch {
      setShareStatus(
        vi
          ? "Bạn có thể sao chép địa chỉ trang để chia sẻ."
          : "Copy this page’s address to share it.",
      );
    }
  };
  const ContactLinks = () => (
    <div className={styles.contactLinks}>
      {phone &&
        !coordinators.some(
          (person) => person.phone.replace(/[^+\d]/g, "") === phone,
        ) && (
          <a href={"tel:" + phone}>
            <Phone size={17} aria-hidden="true" />
            <span>{phoneSource}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        )}
      {email && (
        <a href={"mailto:" + email}>
          <Mail size={17} aria-hidden="true" />
          <span>{email}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      )}
      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer">
          <Globe size={17} aria-hidden="true" />
          <span>{vi ? "Website câu lạc bộ" : "Club website"}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      )}
    </div>
  );
  return (
    <ConfigProvider
      theme={{
        algorithm:
          resolvedTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#e10e20",
          borderRadius: 20,
          fontFamily: "inherit",
        },
      }}
    >
      <div
        className={[
          styles.page,
          homeBeVietnam.variable,
          homeNeusharp.variable,
          preview ? styles.preview : "",
        ].join(" ")}
      >
        <section className={styles.hero} aria-labelledby="club-detail-title">
          <div className={styles.heroBackground} aria-hidden="true" />
          <div className={styles.cover} aria-hidden="true">
            <ClubImage src={cover} alt="" priority />
          </div>
          <div className={styles.texture} aria-hidden="true" />
          <div className={styles.container}>
            {!preview && (
              <nav
                className={styles.breadcrumb}
                aria-label={vi ? "Đường dẫn" : "Breadcrumb"}
              >
                <Link href="/">{vi ? "Trang chủ" : "Home"}</Link>
                <ChevronRight size={12} aria-hidden="true" />
                <Link href="/clubs">{vi ? "Câu lạc bộ" : "Clubs"}</Link>
                <ChevronRight size={12} aria-hidden="true" />
                <span aria-current="page">{club.name}</span>
              </nav>
            )}
            <div className={styles.heroCopy}>
              <div className={styles.tags}>
                {splitClubSports(club.sport).map((sport) => (
                  <span key={sport}>{sport}</span>
                ))}
                {club.location && <span>{club.location}</span>}
              </div>
              <h1 id="club-detail-title">
                {club.name.split(/(khuyết tật)/gi).map((part, index) =>
                  /khuyết tật/i.test(part) ? (
                    <span className={styles.keepTogether} key={index}>
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </h1>
              {d.tagline && <p className={styles.tagline}>{d.tagline}</p>}
              <div className={styles.heroBottom}>
                <p className={styles.history}>
                  {d.foundedYear && (
                    <span>
                      {vi ? "Thành lập" : "Founded"} {d.foundedYear}
                    </span>
                  )}
                  {updated && (
                    <span>
                      {vi ? "Cập nhật" : "Updated"} {updated}
                    </span>
                  )}
                  {!d.foundedYear && !updated && (
                    <span>
                      Vietnam ParaSports ·{" "}
                      {vi
                        ? "Kết nối cộng đồng thể thao"
                        : "Connecting the sports community"}
                    </span>
                  )}
                </p>
                {!preview && (
                  <div className={styles.share}>
                    <span role="status">{shareStatus}</span>
                    <button
                      type="button"
                      onClick={copyLink}
                      aria-label={
                        vi ? "Sao chép liên kết chia sẻ CLB" : "Copy club link"
                      }
                    >
                      <Share2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <dl className={styles.facts}>
              {facts.map(({ Icon, label, value }) => (
                <div key={label}>
                  <span className={styles.factIcon}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.storyColumn}>
              <section id="club-about" className={styles.section}>
                <Badge>{vi ? "Giới thiệu" : "About"}</Badge>
                <h2>{vi ? "CÂU CHUYỆN CỦA CHÚNG TÔI" : "OUR STORY"}</h2>
                {club.description && (
                  <div
                    className={`${styles.description} ${listStyles.lists}`}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichText(club.description),
                    }}
                  />
                )}
                {d.content && (
                  <div
                    className={`${styles.richText} ${listStyles.lists}`}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichText(d.content),
                    }}
                  />
                )}
                {!club.description && !d.content && (
                  <p className={styles.muted}>
                    {vi
                      ? "Thông tin giới thiệu đang được cập nhật. Liên hệ người phụ trách để tìm hiểu thêm về câu lạc bộ."
                      : "An introduction is coming soon. Contact the club coordinator to learn more."}
                  </p>
                )}
                <div id="club-join" className={styles.joinBox}>
                  <h3>{vi ? "Điều kiện tham gia" : "Joining the club"}</h3>
                  <ul>
                    {(joinItems.length
                      ? joinItems
                      : [
                          vi
                            ? "Liên hệ người phụ trách để được tư vấn lịch tập và điều kiện tham gia phù hợp với bạn."
                            : "Contact the coordinator for a suitable training session and participation options.",
                        ]
                    ).map((item, index) => (
                      <li key={index}>
                        <CheckCircle2 size={15} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              {d.facilities.length > 0 && (
                <section className={styles.section} id="club-facilities">
                  <Badge>{vi ? "Tiện ích" : "Facilities"}</Badge>
                  <h2>{vi ? "KHÔNG GIAN & HỖ TRỢ" : "FACILITIES & SUPPORT"}</h2>
                  <ul className={styles.facilities}>
                    {d.facilities.map((facility, index) => (
                      <li key={index}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        {facility}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className={styles.section} id="club-gallery">
                <Badge>{vi ? "Hình ảnh" : "Gallery"}</Badge>
                <h2>{vi ? "KHOẢNH KHẮC TẬP LUYỆN" : "TRAINING MOMENTS"}</h2>
                {galleryImages.length ? (
                  <div
                    className={styles.gallery}
                    data-count={Math.min(galleryImages.length, 3)}
                  >
                    {galleryImages.map((src, index) => (
                      <a
                        key={src}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={
                          (vi ? "Mở ảnh hoạt động " : "Open activity photo ") +
                          (index + 1)
                        }
                      >
                        <ClubImage
                          src={src}
                          alt={
                            club.name +
                            " — " +
                            (vi ? "hoạt động " : "activity ") +
                            (index + 1)
                          }
                          sizes="(max-width:767px) 90vw, 45vw"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className={styles.galleryPlaceholder}>
                    <div>
                      <ClubImage
                        src={cover}
                        alt={
                          vi
                            ? "Ảnh minh họa bộ môn thể thao"
                            : "Sport illustration"
                        }
                        sizes="(max-width:767px) 90vw, 60vw"
                      />
                    </div>
                    <p>
                      {vi
                        ? "Ảnh minh họa bộ môn. Hình ảnh hoạt động riêng của câu lạc bộ đang được cập nhật."
                        : "Sport illustration. Club activity photos are coming soon."}
                    </p>
                  </div>
                )}
              </section>
              <section className={styles.section} id="club-location">
                <Badge>{vi ? "Địa điểm" : "Location"}</Badge>
                <div className={styles.location}>
                  {canMap ? (
                    <a
                      className={styles.map}
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        vi
                          ? "Xem địa điểm trên Google Maps"
                          : "View location on Google Maps"
                      }
                    >
                      <span>
                        <MapPin size={24} aria-hidden="true" />
                      </span>
                    </a>
                  ) : (
                    <div className={styles.map}>
                      <span>
                        <MapPin size={24} aria-hidden="true" />
                      </span>
                    </div>
                  )}
                  <div>
                    <h3>
                      {club.location ||
                        (vi
                          ? "Địa điểm đang cập nhật"
                          : "Location coming soon")}
                    </h3>
                    {canMap ? (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {vi ? "Chỉ đường" : "Get directions"}
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    ) : (
                      <p className={styles.muted}>
                        {vi
                          ? "Liên hệ CLB để biết địa điểm tập luyện."
                          : "Contact the club for its training location."}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
            <aside className={styles.sidebar}>
              <section
                id="club-contact"
                className={styles.contactCard}
                aria-label={vi ? "Liên hệ câu lạc bộ" : "Contact club"}
              >
                <button
                  className={styles.joinButton}
                  type="button"
                  onClick={() => setContactMode("join")}
                >
                  {vi ? "Đăng ký tham gia" : "Join this club"}
                  <span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </button>
                {email ? (
                  <a className={styles.messageButton} href={"mailto:" + email}>
                    {vi ? "Nhắn tin cho CLB" : "Message the club"}
                    <span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </a>
                ) : (
                  <button
                    className={styles.messageButton}
                    type="button"
                    onClick={() => setContactMode("contact")}
                  >
                    {vi ? "Liên hệ CLB" : "Contact the club"}
                    <span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </button>
                )}
                <section
                  aria-label={vi ? "Người phụ trách CLB" : "Club coordinators"}
                  className={styles.coordinators}
                >
                  <h3 className={styles.coordinatorHeading}>
                    {vi ? "Người phụ trách CLB" : "Club coordinators"}
                  </h3>
                  {coordinators.length ? (
                    coordinators.map((person, index) => (
                      <div className={styles.coordinatorPerson} key={index}>
                        <div className={styles.coordinator}>
                          <span className={styles.avatar}>
                            <Users size={19} aria-hidden="true" />
                          </span>
                          <div>
                            <h4>{person.name}</h4>
                            {person.role && <p>{person.role}</p>}
                          </div>
                        </div>
                        {/^[+\d\s().-]+$/.test(person.phone) && (
                          <a
                            className={styles.personPhone}
                            href={"tel:" + person.phone.replace(/[^+\d]/g, "")}
                            aria-label={
                              (vi ? "Gọi " : "Call ") +
                              person.name +
                              ": " +
                              person.phone
                            }
                          >
                            <Phone size={17} aria-hidden="true" />
                            <span>{person.phone}</span>
                            <ArrowRight size={16} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>
                      {club.contactInfo ||
                        (vi
                          ? "Thông tin đang được cập nhật"
                          : "Contact details coming soon")}
                    </p>
                  )}
                </section>
                <ContactLinks />
              </section>
              <section
                className={styles.schedule}
                aria-labelledby="club-schedule-heading"
              >
                <Badge>{vi ? "Lịch tập" : "Training"}</Badge>
                <h2 id="club-schedule-heading" className={styles.srOnly}>
                  {vi ? "Lịch tập của câu lạc bộ" : "Club training schedule"}
                </h2>
                {sessions.length ? (
                  <div>
                    {sessions.map((session, index) => (
                      <article key={index}>
                        <h3>{session.day}</h3>
                        {session.time && <strong>{session.time}</strong>}
                        <p>{session.note}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.scheduleEmpty}>
                    {vi
                      ? "Lịch tập đang được cập nhật. Liên hệ CLB để được tư vấn."
                      : "Training times are coming soon. Contact the club for guidance."}
                  </p>
                )}
              </section>
            </aside>
          </div>
          {!preview && related.length > 0 && (
            <section
              className={styles.related}
              aria-labelledby="related-clubs-heading"
            >
              <Badge>{vi ? "Gợi ý" : "Discover"}</Badge>
              <div className={styles.relatedHeading}>
                <h2 id="related-clubs-heading">
                  {vi ? "KHÁM PHÁ CÂU LẠC BỘ KHÁC" : "EXPLORE MORE CLUBS"}
                </h2>
                <Link href="/clubs">
                  {vi ? "Xem tất cả câu lạc bộ" : "View all clubs"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.relatedGrid}>
                {related.map((other) => (
                  <ClubSummaryCard key={other.id} club={other} vi={vi} />
                ))}
              </div>
            </section>
          )}
        </div>
        <Modal
          open={contactMode !== null}
          onCancel={() => setContactMode(null)}
          footer={null}
          title={
            contactMode === "join"
              ? vi
                ? "Đăng ký tham gia câu lạc bộ"
                : "Join this club"
              : vi
                ? "Liên hệ câu lạc bộ"
                : "Contact the club"
          }
        >
          <div className={styles.contactDialog}>
            <h3>{club.name}</h3>
            <p>
              {vi
                ? "Liên hệ người phụ trách để được tư vấn và xác nhận đăng ký tham gia."
                : "Contact the coordinator for guidance and to confirm your registration."}
            </p>
            {club.contactInfo && !coordinators.length && (
              <p>{club.contactInfo}</p>
            )}
            {coordinators.map((person, index) => (
              <div className={styles.coordinatorPerson} key={index}>
                <strong>{person.name}</strong>
                {person.role && <p>{person.role}</p>}
                {/^[+\d\s().-]+$/.test(person.phone) && (
                  <a
                    className={styles.personPhone}
                    href={"tel:" + person.phone.replace(/[^+\d]/g, "")}
                  >
                    <Phone size={17} aria-hidden="true" />
                    {person.phone}
                  </a>
                )}
              </div>
            ))}
            {d.joiningInstructions && (
              <p className={styles.instructions}>{d.joiningInstructions}</p>
            )}
            <ContactLinks />
            {!phone && !email && !website && !club.contactInfo && (
              <p>
                {vi
                  ? "Thông tin liên hệ đang được cập nhật."
                  : "Contact details are coming soon."}
              </p>
            )}
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
