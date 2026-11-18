import { cache } from "react";
import Image from "next/image";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trophy,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { sportIconSource, sportThumbnailSource } from "@/lib/sport-media";
import SportRichContent from "@/components/sports/SportRichContent";
import { SPORT_STORIES } from "@/lib/sport-assets";
import { clubSlug } from "@/lib/organizations";
import NewsImage from "@/components/news/NewsImage";
import NewsSportsRail from "@/components/news/NewsSportsRail";
import styles from "./sport.module.css";

const pageClass = [
  styles.page,
  homeBeVietnam.variable,
  homeNeusharp.variable,
].join(" ");

type Sport = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn?: string;
  icon?: string;
  thumbnail?: string | null;
  descVi?: string;
  descEn?: string;
  detailDescVi?: string;
  detailDescEn?: string;
};
type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt: string;
  publishedAt?: string;
  category?: { name: string };
};
type Club = {
  id: string;
  slug?: string;
  name: string;
  location?: string;
  schedule?: string;
  imageUrl?: string;
};
type Tournament = {
  id: string;
  name: string;
  status: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bannerUrl?: string;
};
type Page<T> = { data: T[]; meta: { total: number; totalPages: number } };
type Read<T> = { data: T | null; status: number };
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
};
async function read<T>(path: string, fresh = false): Promise<Read<T>> {
  try {
    const response = await apiClient.request(path, {
      ...(fresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
    });
    return {
      data: response.ok ? await response.json() : null,
      status: response.status,
    };
  } catch {
    return { data: null, status: 0 };
  }
}
const getSport = cache((slug: string) =>
  read<Sport>(`/sports/slug/${encodeURIComponent(slug)}`, true),
);
const plain = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const result = await getSport(slug);
  return {
    title: result.data
      ? `${locale === "vi" ? result.data.nameVi : result.data.nameEn || result.data.nameVi} | Vietnam ParaSports`
      : "Vietnam ParaSports",
    description: result.data
      ? locale === "vi"
        ? result.data.descVi
        : result.data.descEn
      : undefined,
  };
}
export default async function SportDetailPage({ params, searchParams }: Props) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  const vi = locale === "vi";
  const result = await getSport(slug);
  if (result.status === 404) notFound();
  if (!result.data)
    return (
      <main id="main-content" className={pageClass}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <Trophy size={32} />
            <h1>
              {vi
                ? "Chưa thể tải thông tin bộ môn"
                : "Sport information is unavailable"}
            </h1>
            <p>
              {vi
                ? "Vui lòng thử tải lại trang sau ít phút."
                : "Please try again in a moment."}
            </p>
            <a href={`/${locale}/sports/${slug}`}>
              {vi ? "Thử lại" : "Try again"}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </main>
    );
  const sport = result.data;
  const name = (vi ? sport.nameVi : sport.nameEn) || sport.nameVi;
  const story = SPORT_STORIES[slug];
  const summary =
    plain((vi ? sport.descVi : sport.descEn) || sport.descVi || "") ||
    (story ? story[vi ? 1 : 3] : "");
  const detail =
    (vi ? sport.detailDescVi : sport.detailDescEn) ||
    sport.detailDescVi ||
    (vi ? sport.descVi : sport.descEn) ||
    sport.descVi ||
    "";
  const icon = sportIconSource(sport.icon, slug);
  const page = Math.max(
    1,
    Number.isSafeInteger(Number(query.page)) ? Number(query.page) : 1,
  );
  const pageSize = 6;
  const now = new Date();
  const [allSports, newsData, clubData, tournamentData] = await Promise.all([
    read<Sport[]>("/sports"),
    read<Page<Post>>(
      `/posts/paginated?${new URLSearchParams({ search: sport.nameVi, page: String(page), limit: String(pageSize) })}`,
    ),
    read<Club[]>(`/organizations?sport=${encodeURIComponent(sport.nameVi)}`),
    read<Page<Tournament> | Tournament[]>(
      "/tournaments?" +
        new URLSearchParams({
          sportId: sport.id,
          status: "UPCOMING",
          startDate: now.toISOString(),
          page: "1",
          limit: "3",
        }).toString(),
      true,
    ),
  ]);
  const posts = newsData.data?.data || [];
  const total = newsData.data?.meta.total ?? posts.length;
  const last = Math.max(1, newsData.data?.meta.totalPages || 1);
  if (newsData.data && page > last)
    redirect(
      `/${locale}/sports/${slug}${last > 1 ? `?page=${last}` : ""}#sport-news`,
    );
  const clubs = Array.isArray(clubData.data) ? clubData.data : [];
  const tournamentItems = Array.isArray(tournamentData.data)
    ? tournamentData.data
    : tournamentData.data?.data || [];
  const tournaments = tournamentItems
    .filter(
      (item) =>
        item.status === "UPCOMING" &&
        item.startDate &&
        Date.parse(item.startDate) >= now.getTime(),
    )
    .sort((a, b) => Date.parse(a.startDate!) - Date.parse(b.startDate!))
    .slice(0, 3);
  const background = sportThumbnailSource(sport.thumbnail, slug);
  const date = (value?: string, time = false) =>
    value && !Number.isNaN(Date.parse(value))
      ? new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          ...(time
            ? { hour: "2-digit", minute: "2-digit", hour12: false }
            : {}),
        }).format(new Date(value))
      : vi
        ? "Đang cập nhật"
        : "To be announced";
  const status = (value: string) =>
    ({
      SCHEDULED: vi ? "Sắp diễn ra" : "Scheduled",
      UPCOMING: vi ? "Sắp diễn ra" : "Upcoming",
      ONGOING: vi ? "Đang diễn ra" : "Ongoing",
      COMPLETED: vi ? "Đã kết thúc" : "Completed",
      CANCELLED: vi ? "Đã hủy" : "Cancelled",
    })[value] || value;
  const heading = (
    id: string,
    eyebrow: string,
    title: string,
    href?: string,
    label?: string,
  ) => (
    <div className={styles.sectionHeading}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {href && (
        <Link href={href}>
          {label || (vi ? "Khám phá thêm" : "Explore more")}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
  const empty = (failed: boolean, text: string) => (
    <div className={styles.empty}>
      <p>
        {failed
          ? vi
            ? "Chưa thể tải dữ liệu. Vui lòng thử lại sau ít phút."
            : "Unable to load this section. Please try again later."
          : text}
      </p>
      {failed && (
        <a href={`/${locale}/sports/${slug}`}>
          {vi ? "Tải lại trang" : "Reload page"}
          <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
  const pages = [...new Set([1, page - 1, page, page + 1, last])]
    .filter((value) => value > 0 && value <= last)
    .sort((a, b) => a - b);
  return (
    <main id="main-content" className={pageClass}>
      <section className={styles.heroSection} aria-labelledby="sport-heading">
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.container}>
          <nav
            className={styles.breadcrumb}
            aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
          >
            <Link href={`/${locale}`}>{vi ? "Trang chủ" : "Home"}</Link>
            <span>/</span>
            <Link href={`/${locale}/sports`}>
              {vi ? "Bộ môn & Thương tật" : "Sports & Classifications"}
            </Link>
            <span>/</span>
            <span aria-current="page">{name}</span>
          </nav>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              {icon && (
                <span className={styles.heroLogo}>
                  <img
                    src={icon}
                    alt={vi ? `Logo ${name}` : `${name} pictogram`}
                    width={56}
                    height={56}
                  />
                </span>
              )}
              <p className={styles.heroEyebrow}>
                Vietnam ParaSports ·{" "}
                {vi ? "Khám phá bộ môn" : "Explore the sport"}
              </p>
              <div className={styles.heroText}>
                <h1 id="sport-heading">{name}</h1>
                {story && <p className={styles.tagline}>{story[vi ? 0 : 2]}</p>}
                <p className={styles.heroDescription}>{summary}</p>
              </div>
              <div className={styles.heroActions}>
                <a href="#sport-news">
                  {vi ? "Theo nhịp bộ môn" : "Follow the sport"}
                  <ArrowRight size={16} />
                </a>
                <a href="#sport-clubs">
                  {vi ? "Tìm câu lạc bộ" : "Find a club"}
                  <MapPin size={15} />
                </a>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <img src={background} alt={name} className={styles.cover} />
              <div className={styles.visualCaption}>
                <span>Vietnam ParaSports</span>
                <span>
                  {vi ? "Tinh thần không giới hạn" : "A spirit without limits"}
                </span>
              </div>
            </div>
          </header>
        </div>
      </section>
      <div className={styles.container}>
        <nav
          className={styles.sectionNav}
          aria-label={vi ? "Nội dung bộ môn" : "Sport sections"}
        >
          {[
            ["sport-intro", vi ? "Giới thiệu" : "Overview"],
            [
              "sport-classifications",
              vi ? "Hạng thương tật" : "Classifications",
              `/${locale}/sports?${new URLSearchParams({ tab: "classes", sportId: sport.id })}#sports-directory`,
            ],
            ["sport-clubs", vi ? "Câu lạc bộ" : "Clubs"],
            ["sport-news", vi ? "Tin tức" : "News"],
            ["sport-events", vi ? "Sự kiện sắp tới" : "Upcoming events"],
          ].map(([id, label, href]) => (
            <Link href={href || `#${id}`} key={id}>
              {label}
            </Link>
          ))}
        </nav>
        <section
          className={styles.articleLayout}
          id="sport-intro"
          aria-labelledby="intro-heading"
        >
          <article className={styles.sportArticle}>
            <p className={styles.eyebrow}>
              {vi ? "Giới thiệu bộ môn" : "About this sport"}
            </p>
            <h2 id="intro-heading">
              {vi ? "Tìm hiểu về " : "Discover "}
              {name}
            </h2>
            <SportRichContent html={detail} />
          </article>
          <aside
            className={styles.articleAside}
            aria-label={vi ? "Kết nối cùng bộ môn" : "Connect with the sport"}
          >
            <span className={styles.eyebrow}>Vietnam ParaSports</span>
            <h3>{vi ? "Cùng khám phá" : "Keep exploring"}</h3>
            <p>
              {vi
                ? "Theo dõi câu chuyện, tìm nơi tập luyện và kết nối với cộng đồng của bộ môn."
                : "Follow the stories, find a place to train and connect with the community."}
            </p>
            <a href="#sport-news">
              {vi ? "Tin tức bộ môn" : "Sport news"}
              <ArrowRight size={16} />
            </a>
            <a href="#sport-clubs">
              {vi ? "Tìm câu lạc bộ" : "Find clubs"}
              <ArrowRight size={16} />
            </a>
            <div className={styles.numbers}>
              <span>
                <strong>{newsData.data ? total : "—"}</strong>
                {vi ? "tin bài liên quan" : "related stories"}
              </span>
              <span>
                <strong>{clubData.data ? clubs.length : "—"}</strong>
                {vi ? "câu lạc bộ kết nối" : "connected clubs"}
              </span>
            </div>
          </aside>
        </section>
        <section
          id="sport-clubs"
          className={styles.section}
          aria-labelledby="clubs-heading"
        >
          {heading(
            "clubs-heading",
            vi
              ? "Cùng tập luyện. Cùng tiến bộ."
              : "Train together. Grow together.",
            vi ? "Kết nối câu lạc bộ" : "Find your community",
            `/${locale}/clubs`,
            vi ? "Khám phá CLB" : "Explore clubs",
          )}
          {!clubs.length ? (
            empty(
              !clubData.data,
              vi
                ? "Chưa có câu lạc bộ của bộ môn này được công bố. Bạn có thể khám phá thêm tại danh sách câu lạc bộ."
                : "No clubs for this sport have been published yet. Explore the club directory for more options.",
            )
          ) : (
            <div className={styles.clubGrid}>
              {clubs.slice(0, 6).map((club) => (
                <article className={styles.club} key={club.id}>
                  {club.imageUrl ? (
                    <Link
                      className={styles.clubImage}
                      href={`/${locale}/clubs/detail/${clubSlug(club)}`}
                      aria-label={club.name}
                    >
                      <NewsImage
                        src={club.imageUrl}
                        className={styles.photo}
                        sizes="(max-width:639px) 100vw, 33vw"
                      />
                    </Link>
                  ) : (
                    <span className={styles.clubIcon}>
                      <MapPin size={20} strokeWidth={1.5} />
                    </span>
                  )}
                  <h3>
                    <Link href={`/${locale}/clubs/detail/${clubSlug(club)}`}>
                      {club.name}
                    </Link>
                  </h3>
                  <p>
                    <MapPin size={13} />
                    {club.location ||
                      (vi ? "Địa điểm đang cập nhật" : "Venue to be announced")}
                  </p>
                  <p>
                    <CalendarDays size={13} />
                    {club.schedule ||
                      (vi
                        ? "Lịch tập đang cập nhật"
                        : "Schedule to be announced")}
                  </p>
                  <Link
                    className={styles.cardAction}
                    href={`/${locale}/clubs/detail/${clubSlug(club)}`}
                  >
                    {vi ? "Khám phá câu lạc bộ" : "Explore club"}
                    <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
        <section
          id="sport-news"
          className={styles.section}
          aria-labelledby="news-heading"
        >
          {heading(
            "news-heading",
            vi ? "Dòng chảy thể thao" : "The sporting world",
            vi ? "Tin tức & câu chuyện" : "News & stories",
            `/${locale}/news?q=${encodeURIComponent(sport.nameVi)}`,
            vi ? "Tất cả tin tức" : "All news",
          )}
          {!posts.length ? (
            empty(
              !newsData.data,
              vi
                ? "Tin tức về bộ môn đang được cập nhật."
                : "Stories about this sport will appear here.",
            )
          ) : (
            <>
              <div className={styles.newsGrid}>
                {posts.map((post) => (
                  <article key={post.id} className={styles.story}>
                    <Link
                      href={`/${locale}/news/${post.slug}`}
                      aria-label={post.title}
                      className={styles.storyImage}
                    >
                      <NewsImage
                        src={post.thumbnail}
                        className={styles.photo}
                        sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw"
                      />
                      <span className={styles.imageArrow}>
                        <ArrowUpRight size={18} />
                      </span>
                    </Link>
                    <div className={styles.meta}>
                      <span>
                        {post.category?.name || (vi ? "Tin tức" : "News")}
                      </span>
                      <time dateTime={post.publishedAt || post.createdAt}>
                        {date(post.publishedAt || post.createdAt)}
                      </time>
                    </div>
                    <h3>
                      <Link href={`/${locale}/news/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt && <p>{plain(post.excerpt)}</p>}
                  </article>
                ))}
              </div>
              {last > 1 && (
                <nav
                  className={styles.pagination}
                  aria-label={
                    vi ? "Phân trang tin bộ môn" : "Sport news pagination"
                  }
                >
                  {page > 1 ? (
                    <Link
                      href={`?page=${page - 1}#sport-news`}
                      aria-label={vi ? "Trang trước" : "Previous page"}
                    >
                      <ChevronLeft size={16} />
                    </Link>
                  ) : (
                    <span aria-disabled="true">
                      <ChevronLeft size={16} />
                    </span>
                  )}
                  {pages.map((value, index) => (
                    <span key={value} className={styles.pageItem}>
                      {index > 0 && value > pages[index - 1] + 1 && <i>…</i>}
                      <Link
                        href={`?page=${value}#sport-news`}
                        aria-current={page === value ? "page" : undefined}
                      >
                        {value}
                      </Link>
                    </span>
                  ))}
                  {page < last ? (
                    <Link
                      href={`?page=${page + 1}#sport-news`}
                      aria-label={vi ? "Trang sau" : "Next page"}
                    >
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span aria-disabled="true">
                      <ChevronRight size={16} />
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </section>
        <section
          id="sport-events"
          className={styles.section}
          aria-labelledby="events-heading"
        >
          {heading(
            "events-heading",
            vi ? "Hẹn gặp tại sự kiện" : "Meet at the next event",
            vi ? "Sự kiện sắp tới" : "Upcoming events",
            `/${locale}/tournaments`,
            vi ? "Khám phá thêm" : "Explore more",
          )}
          {!tournaments.length ? (
            empty(
              !tournamentData.data,
              vi
                ? "Các sự kiện sắp tới của bộ môn đang được cập nhật."
                : "Upcoming events for this sport will appear here.",
            )
          ) : (
            <div className={styles.tournaments}>
              {tournaments.map((item) => (
                <Link key={item.id} href={`/${locale}/tournaments/${item.id}`}>
                  <span className={styles.tournamentIcon}>
                    <CalendarDays size={20} strokeWidth={1.5} />
                  </span>
                  <div>
                    <span className={styles.status} data-status={item.status}>
                      {status(item.status)}
                    </span>
                    <h3>{item.name}</h3>
                    <p>
                      {date(item.startDate)}
                      {item.endDate ? ` — ${date(item.endDate)}` : ""}
                    </p>
                    {item.location && <p>{item.location}</p>}
                  </div>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </section>
        {!!allSports.data?.length && (
          <div className={styles.otherSports}>
            <NewsSportsRail
              sports={allSports.data}
              locale={locale}
              activeSlug={slug}
            />
          </div>
        )}
      </div>
    </main>
  );
}
