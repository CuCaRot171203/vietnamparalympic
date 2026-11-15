import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trophy,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { SPORT_LOGOS } from "@/lib/sport-logos";
import { SPORT_BACKGROUNDS, SPORT_STORIES } from "@/lib/sport-assets";
import { clubSlug } from "@/lib/organizations";
import NewsImage from "@/components/news/NewsImage";
import NewsSportsRail from "@/components/news/NewsSportsRail";
import styles from "./sport.module.css";

type Sport = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn?: string;
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
type Course = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  lessonCount?: number;
};
type Club = {
  id: string;
  slug?: string;
  name: string;
  location?: string;
  schedule?: string;
  imageUrl?: string;
};
type Match = {
  id: string;
  title: string;
  startTime?: string;
  location?: string;
  status: string;
  tournament?: { name: string };
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
type Ranking = {
  id: string;
  rank: number;
  points: number;
  athlete?: { userId?: string; user?: { id: string; fullName?: string } };
  team?: { name: string };
  event?: { name: string };
  tournament?: { name: string };
};
type Page<T> = { data: T[]; meta: { total: number; totalPages: number } };
type Read<T> = { data: T | null; status: number };
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
};
async function read<T>(path: string): Promise<Read<T>> {
  try {
    const response = await apiClient.request(path, {
      next: { revalidate: 60 },
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
  read<Sport>(`/sports/slug/${encodeURIComponent(slug)}`),
);
const plain = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const normalize = (value: string) =>
  plain(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
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
      <main className={styles.page}>
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
    plain(
      (vi ? sport.detailDescVi : sport.detailDescEn) ||
        sport.detailDescVi ||
        "",
    ) || summary;
  const page = Math.max(
    1,
    Number.isSafeInteger(Number(query.page)) ? Number(query.page) : 1,
  );
  const pageSize = 6;
  const [
    allSports,
    newsData,
    courseData,
    clubData,
    matchData,
    rankingData,
    tournamentData,
  ] = await Promise.all([
    read<Sport[]>("/sports"),
    read<Page<Post>>(
      `/posts/paginated?${new URLSearchParams({ search: sport.nameVi, page: String(page), limit: String(pageSize) })}`,
    ),
    read<Course[]>("/courses"),
    read<Club[]>(`/organizations?sport=${encodeURIComponent(sport.nameVi)}`),
    read<Page<Match>>(`/matches?sportId=${sport.id}&limit=4`),
    read<Ranking[]>(`/rankings/sport/${sport.id}`),
    read<Page<Tournament>>(`/tournaments?sportId=${sport.id}&limit=3`),
  ]);
  const posts = newsData.data?.data || [];
  const total = newsData.data?.meta.total ?? posts.length;
  const last = Math.max(1, newsData.data?.meta.totalPages || 1);
  if (newsData.data && page > last)
    redirect(
      `/${locale}/sports/${slug}${last > 1 ? `?page=${last}` : ""}#sport-news`,
    );
  const courses = Array.isArray(courseData.data) ? courseData.data : [];
  const dedicated = courses.filter((course) =>
    normalize(`${course.title} ${course.description || ""}`).includes(
      normalize(sport.nameVi),
    ),
  );
  const learning = (dedicated.length ? dedicated : courses).slice(0, 3);
  const clubs = Array.isArray(clubData.data) ? clubData.data : [];
  const matches = matchData.data?.data || [];
  const rankings = Array.isArray(rankingData.data)
    ? rankingData.data.slice(0, 5)
    : [];
  const tournaments = tournamentData.data?.data || [];
  const background = SPORT_BACKGROUNDS[slug]
    ? `/back_subjects/${SPORT_BACKGROUNDS[slug]}`
    : slug === "ban-cung"
      ? "/wp169/wp1.jpg"
      : "/assets/homepage/creator-lab-launch.jpg";
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
    <main className={styles.page}>
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
        >
          <Link href={`/${locale}`}>{vi ? "Trang chủ" : "Home"}</Link>
          <span>/</span>
          <span>{vi ? "Bộ môn" : "Sports"}</span>
          <span>/</span>
          <span aria-current="page">{name}</span>
        </nav>
        <header className={styles.hero}>
          <Image
            src={background}
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 100vw, 1300px"
            className={styles.cover}
          />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            {SPORT_LOGOS[slug] && (
              <span className={styles.heroLogo}>
                <Image
                  src={`/subjects/${SPORT_LOGOS[slug]}`}
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
            <h1>{name}</h1>
            {story && <p className={styles.tagline}>{story[vi ? 0 : 2]}</p>}
            <p className={styles.heroDescription}>{summary}</p>
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
        </header>
        <nav
          className={styles.sectionNav}
          aria-label={vi ? "Nội dung bộ môn" : "Sport sections"}
        >
          {[
            ["sport-intro", vi ? "Giới thiệu" : "Overview"],
            ["sport-news", vi ? "Tin tức" : "News"],
            ["sport-learning", vi ? "Học tập" : "Learning"],
            ["sport-clubs", vi ? "Câu lạc bộ" : "Clubs"],
            ["sport-calendar", vi ? "Lịch thi đấu" : "Fixtures"],
            ["sport-rankings", vi ? "Xếp hạng" : "Rankings"],
          ].map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>
        <section
          className={styles.introduction}
          id="sport-intro"
          aria-labelledby="intro-heading"
        >
          <div>
            <p className={styles.eyebrow}>
              {vi
                ? "Nhịp điệu riêng. Tinh thần chung."
                : "A unique rhythm. A shared spirit."}
            </p>
            <h2 id="intro-heading">
              {vi ? "Khám phá" : "Discover"}
              <br />
              {name.toLocaleLowerCase(vi ? "vi-VN" : "en-GB")}.
            </h2>
          </div>
          <div>
            <p>{detail}</p>
            <div className={styles.numbers}>
              <span>
                <strong>{newsData.data ? total : "—"}</strong>
                {vi ? "tin bài liên quan" : "related stories"}
              </span>
              <span>
                <strong>{clubData.data ? clubs.length : "—"}</strong>
                {vi ? "câu lạc bộ kết nối" : "connected clubs"}
              </span>
              <span>
                <strong>
                  {matchData.data
                    ? (matchData.data.meta?.total ?? matches.length)
                    : "—"}
                </strong>
                {vi ? "trận đấu cập nhật" : "listed matches"}
              </span>
            </div>
          </div>
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
          id="sport-learning"
          className={styles.section}
          aria-labelledby="learning-heading"
        >
          {heading(
            "learning-heading",
            vi ? "Học hỏi & phát triển" : "Learn & develop",
            vi ? "Khóa học & kỹ năng" : "Courses & skills",
            `/${locale}/creator-lab`,
            "Creator Lab",
          )}
          <p className={styles.sectionDescription}>
            {dedicated.length
              ? vi
                ? `Học liệu liên quan đến ${name.toLocaleLowerCase("vi-VN")}.`
                : `Learning resources related to ${name.toLowerCase()}.`
              : vi
                ? "Khám phá các khóa học bổ trợ về dinh dưỡng, phục hồi và kỹ năng truyền thông trong thể thao."
                : "Explore supporting courses in nutrition, recovery and sports communication."}
          </p>
          {!learning.length ? (
            empty(
              !courseData.data,
              vi
                ? "Học liệu đang được cập nhật."
                : "Learning resources are being updated.",
            )
          ) : (
            <div className={styles.newsGrid}>
              {learning.map((course) => (
                <article key={course.id} className={styles.story}>
                  <Link
                    href={`/${locale}/creator-lab/courses/${course.slug}`}
                    className={styles.storyImage}
                    aria-label={course.title}
                  >
                    <NewsImage
                      src={course.thumbnail}
                      className={styles.photo}
                      sizes="(max-width:639px) 100vw, 33vw"
                    />
                    <span className={styles.imageArrow}>
                      <BookOpen size={18} />
                    </span>
                  </Link>
                  <div className={styles.meta}>
                    <span>
                      {dedicated.length
                        ? vi
                          ? "Khóa học"
                          : "Course"
                        : vi
                          ? "Kỹ năng bổ trợ"
                          : "Supporting skills"}
                    </span>
                    <span>
                      {course.lessonCount ?? 0} {vi ? "bài học" : "lessons"}
                    </span>
                  </div>
                  <h3>
                    <Link
                      href={`/${locale}/creator-lab/courses/${course.slug}`}
                    >
                      {course.title}
                    </Link>
                  </h3>
                  <p>{plain(course.description)}</p>
                </article>
              ))}
            </div>
          )}
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
                  <span className={styles.clubIcon}>
                    <MapPin size={20} strokeWidth={1.5} />
                  </span>
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
          id="sport-calendar"
          className={styles.section}
          aria-labelledby="calendar-heading"
        >
          {heading(
            "calendar-heading",
            vi ? "Theo nhịp những cuộc đấu" : "Follow the competition",
            vi ? "Lịch thi đấu" : "Fixtures",
            `/${locale}/matches`,
            vi ? "Xem lịch thi đấu" : "All fixtures",
          )}
          {!matches.length ? (
            empty(
              !matchData.data,
              vi
                ? "Lịch thi đấu của bộ môn đang được cập nhật."
                : "Fixtures for this sport will appear here.",
            )
          ) : (
            <div className={styles.matchGrid}>
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/${locale}/matches/${match.id}`}
                  className={styles.match}
                >
                  <div className={styles.matchTop}>
                    <span className={styles.status} data-status={match.status}>
                      {status(match.status)}
                    </span>
                    <ArrowUpRight size={17} />
                  </div>
                  <h3>{match.title}</h3>
                  <p>
                    <CalendarDays size={13} />
                    {date(match.startTime, true)} · GMT+7
                  </p>
                  <p>
                    <MapPin size={13} />
                    {match.location ||
                      (vi ? "Địa điểm đang cập nhật" : "Venue to be announced")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
        <div className={styles.competitionGrid}>
          <section
            id="sport-rankings"
            className={styles.section}
            aria-labelledby="rankings-heading"
          >
            {heading(
              "rankings-heading",
              vi ? "Dấu ấn thành tích" : "Performance highlights",
              vi ? "Bảng xếp hạng" : "Rankings",
              `/${locale}/rankings`,
              vi ? "Xem tất cả" : "View all",
            )}
            <p className={styles.sectionDescription}>
              {vi
                ? "Thứ hạng theo từng nội dung và giải đấu."
                : "Standings within each event and tournament."}
            </p>
            {!rankings.length ? (
              empty(
                !rankingData.data,
                vi
                  ? "Chưa có dữ liệu xếp hạng cho bộ môn này."
                  : "Rankings are not available for this sport yet.",
              )
            ) : (
              <div className={styles.rankingTable}>
                <table>
                  <caption className={styles.srOnly}>
                    {vi ? `Bảng xếp hạng ${name}` : `${name} standings`}
                  </caption>
                  <thead>
                    <tr>
                      <th>{vi ? "Hạng" : "Rank"}</th>
                      <th>{vi ? "Vận động viên / Đội" : "Athlete / Team"}</th>
                      <th>{vi ? "Điểm" : "Points"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((row) => {
                      const userId =
                        row.athlete?.userId || row.athlete?.user?.id;
                      const athlete =
                        row.athlete?.user?.fullName || row.team?.name || "—";
                      return (
                        <tr key={row.id}>
                          <td>
                            <span className={styles.rank} data-rank={row.rank}>
                              {row.rank}
                            </span>
                          </td>
                          <td>
                            {userId ? (
                              <Link href={`/${locale}/users/${userId}`}>
                                {athlete}
                              </Link>
                            ) : (
                              athlete
                            )}
                            <small>
                              {[row.event?.name, row.tournament?.name]
                                .filter(Boolean)
                                .join(" · ")}
                            </small>
                          </td>
                          <td>
                            {Number.isFinite(row.points)
                              ? row.points.toLocaleString(
                                  vi ? "vi-VN" : "en-GB",
                                )
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section
            className={styles.section}
            aria-labelledby="tournaments-heading"
          >
            {heading(
              "tournaments-heading",
              vi ? "Sân chơi & cơ hội" : "Places to compete",
              vi ? "Giải đấu" : "Tournaments",
              `/${locale}/matches`,
              vi ? "Khám phá thêm" : "Explore more",
            )}
            {!tournaments.length ? (
              empty(
                !tournamentData.data,
                vi
                  ? "Các giải đấu liên quan đang được cập nhật."
                  : "Related tournaments will appear here.",
              )
            ) : (
              <div className={styles.tournaments}>
                {tournaments.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/tournaments/${item.id}`}
                  >
                    <span className={styles.tournamentIcon}>
                      <Trophy size={20} strokeWidth={1.5} />
                    </span>
                    <div>
                      <span className={styles.status} data-status={item.status}>
                        {status(item.status)}
                      </span>
                      <h3>{item.name}</h3>
                      <p>
                        {date(item.startDate)} — {date(item.endDate)}
                      </p>
                      {item.location && <p>{item.location}</p>}
                    </div>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
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
