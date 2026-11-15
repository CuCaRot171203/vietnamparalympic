"use client";

import { useEffect, useState } from "react";
import {
  ConfigProvider,
  Drawer,
  Pagination,
  Select,
  Skeleton,
  theme,
} from "antd";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Download,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { getApiUrl } from "@/utils/api";
import { useLanguage } from "@/hooks/useTranslation";
import { SPORT_LOGOS } from "@/lib/sport-logos";
import NewsImage from "@/components/news/NewsImage";
import styles from "./matches.module.css";

type Entity = {
  id: string;
  name?: string;
  nameVi?: string;
  nameEn?: string;
  slug?: string;
  code?: string;
  sportId?: string;
};
type Tournament = Entity & {
  startDate?: string;
  endDate?: string;
  location?: string;
  status: string;
  bannerUrl?: string;
};
type Match = {
  id: string;
  title: string;
  startTime?: string;
  location?: string;
  status: string;
  round?: string;
  result?: string;
  tournamentId?: string;
  tournament?: Tournament;
  sport?: Entity;
  event?: Entity;
  classification?: Entity;
  participants?: (string | { id?: string; name?: string; score?: number })[];
};
type Filters = {
  sports: string[];
  tournaments: string[];
  statuses: string[];
  weights: string[];
  classifications: string[];
  date: string;
  location?: string;
  startDate: string;
  endDate: string;
};
const initialFilters: Filters = {
  sports: [],
  tournaments: [],
  statuses: [],
  weights: [],
  classifications: [],
  date: "",
  location: undefined,
  startDate: "",
  endDate: "",
};
const weights = ["49", "54", "59", "65", "72", "over_72"];
async function read<T>(path: string): Promise<T> {
  const res = await apiClient.request(path);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}
function list<T>(data: T[] | { data: T[] }): T[] {
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
}

export default function PublicMatchesPage() {
  const { language } = useLanguage();
  const vi = language === "vi";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"matches" | "tournaments">("matches");
  const [sports, setSports] = useState<Entity[]>([]);
  const [tournamentOptions, setTournamentOptions] = useState<Tournament[]>([]);
  const [classifications, setClassifications] = useState<Entity[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [optionsError, setOptionsError] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const pageSize = 9;
  const dark = mounted && resolvedTheme === "dark";
  const name = (item?: Entity) =>
    item
      ? (vi ? item.nameVi : item.nameEn) ||
        item.name ||
        item.nameVi ||
        item.nameEn ||
        item.code ||
        "—"
      : "—";
  const status = (value: string) =>
    ({
      SCHEDULED: vi ? "Sắp diễn ra" : "Scheduled",
      UPCOMING: vi ? "Sắp diễn ra" : "Upcoming",
      ONGOING: vi ? "Đang diễn ra" : "Live",
      COMPLETED: vi ? "Đã kết thúc" : "Completed",
      CANCELLED: vi ? "Đã hủy" : "Cancelled",
    })[value] || value;
  const date = (value?: string, options?: Intl.DateTimeFormatOptions) =>
    value && !Number.isNaN(Date.parse(value))
      ? new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          ...options,
        }).format(new Date(value))
      : vi
        ? "Đang cập nhật"
        : "To be announced";
  const change = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  };
  const clear = () => {
    setFilters(initialFilters);
    setPage(1);
  };
  const filterCount =
    filters.sports.length +
    filters.statuses.length +
    filters.weights.length +
    filters.classifications.length +
    (filters.location ? 1 : 0) +
    (tab === "matches"
      ? filters.tournaments.length + (filters.date ? 1 : 0)
      : (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0));
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    let current = true;
    setOptionsError(false);
    Promise.all([
      read<Entity[] | { data: Entity[] }>("/sports"),
      read<Tournament[] | { data: Tournament[] }>("/tournaments"),
      read<Entity[] | { data: Entity[] }>("/sport-classifications"),
      read<string[]>("/matches/locations"),
    ])
      .then(([s, t, c, l]) => {
        if (current) {
          setSports(list(s));
          setTournamentOptions(list(t));
          setClassifications(list(c));
          setLocations(Array.isArray(l) ? l : []);
        }
      })
      .catch(() => {
        if (current) setOptionsError(true);
      });
    return () => {
      current = false;
    };
  }, [retry]);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(false);
    const query = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (filters.sports.length) query.set("sportId", filters.sports.join(","));
    if (filters.statuses.length)
      query.set(
        "status",
        filters.statuses
          .map((value) =>
            tab === "tournaments" && value === "SCHEDULED" ? "UPCOMING" : value,
          )
          .join(","),
      );
    if (filters.weights.length)
      query.set("weightClass", filters.weights.join(","));
    if (filters.classifications.length)
      query.set("classificationId", filters.classifications.join(","));
    if (filters.location) query.set("location", filters.location);
    if (tab === "matches") {
      if (filters.date) query.set("date", filters.date);
      if (filters.tournaments.length)
        query.set("tournamentId", filters.tournaments.join(","));
    } else {
      if (filters.startDate) query.set("startDate", filters.startDate);
      if (filters.endDate) query.set("endDate", filters.endDate);
    }
    read<
      | {
          data: (Match | Tournament)[];
          meta?: { total: number; totalPages: number };
        }
      | (Match | Tournament)[]
    >(`/${tab}?${query}`)
      .then((data) => {
        if (!current) return;
        const rows = list(data);
        if (tab === "matches") setMatches(rows as Match[]);
        else setTournaments(rows as Tournament[]);
        const count = !Array.isArray(data)
          ? (data.meta?.total ?? rows.length)
          : rows.length;
        setTotal(count);
        const lastPage = Math.max(1, Math.ceil(count / pageSize));
        if (page > lastPage) setPage(lastPage);
      })
      .catch(() => {
        if (current) {
          setError(true);
          setTotal(0);
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [tab, page, filters, retry]);
  const multi = (
    key: "sports" | "tournaments" | "statuses" | "weights" | "classifications",
    label: string,
    options: { value: string; label: string }[],
    scope = "drawer",
  ) => (
    <div className={styles.field}>
      <label htmlFor={`schedule-${scope}-${key}`}>{label}</label>
      <Select
        id={`schedule-${scope}-${key}`}
        aria-label={label}
        mode="multiple"
        showSearch
        optionFilterProp="label"
        allowClear
        placeholder={vi ? "Tất cả" : "All"}
        value={filters[key]}
        options={options}
        onChange={(value: string[]) => change(key, value)}
        maxTagCount="responsive"
      />
    </div>
  );
  const entityOptions = (items: Entity[]) =>
    items.map((item) => ({ value: item.id, label: name(item) }));
  const time = (value?: string) =>
    value && !Number.isNaN(Date.parse(value))
      ? new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(value))
      : "--:--";
  const googleCalendar = (match: Match) => {
    if (!match.startTime || Number.isNaN(Date.parse(match.startTime))) return;
    const start = new Date(match.startTime);
    const stamp = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const query = new URLSearchParams({
      action: "TEMPLATE",
      text: match.title,
      dates: `${stamp(start)}/${stamp(start)}`,
      location: match.location || "",
      details: `${window.location.origin}/${language}/matches/${match.id}`,
    });
    window.open(
      `https://calendar.google.com/calendar/render?${query}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: dark ? "#ef9fb0" : "#7c293b",
          colorBgContainer: dark ? "#1d1d19" : "#fcfbf8",
          colorBgElevated: dark ? "#24241f" : "#fcfbf8",
          colorText: dark ? "#f7f4ed" : "#1c1c1c",
          colorTextSecondary: dark ? "#aaa9a0" : "#666660",
          colorBorder: dark ? "#393932" : "#dedbd2",
          borderRadius: 8,
          controlHeight: 44,
          fontFamily: "inherit",
          fontSize: 13,
        },
      }}
    >
      <main id="main-content" className={styles.page}>
        <div className={styles.container}>
          <nav
            className={styles.breadcrumb}
            aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
          >
            <Link href={`/${language}`}>{vi ? "Trang chủ" : "Home"}</Link>
            <span>/</span>
            <span aria-current="page">{vi ? "Lịch thi đấu" : "Schedule"}</span>
          </nav>
          <header className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>
                <span />
                Vietnam ParaSports · Competition
              </p>
              <h1>
                {vi ? (
                  <>
                    Theo nhịp
                    <br />
                    <span>từng cuộc đấu.</span>
                  </>
                ) : (
                  <>
                    Every match.
                    <br />
                    <span>Every moment.</span>
                  </>
                )}
              </h1>
              <p className={styles.heroText}>
                {vi
                  ? "Lịch thi đấu, giải đấu và những khoảnh khắc bứt phá. Cùng dõi theo hành trình của thể thao người khuyết tật Việt Nam."
                  : "Follow the fixtures, tournaments and breakthrough moments of Vietnam’s para athletes."}
              </p>
            </div>
            <div className={styles.heroAside}>
              <CalendarDays size={42} strokeWidth={1.2} />
              <span>
                {vi
                  ? "Sẵn sàng cho khoảnh khắc tiếp theo"
                  : "Ready for the next moment"}
              </span>
              <p>
                {vi
                  ? "Tìm trận đấu bạn quan tâm. Lưu lịch và cùng tiếp sức cho vận động viên."
                  : "Find your event, save the date and support the athletes."}
              </p>
              <a href="#schedule-content">
                {vi ? "Khám phá lịch thi đấu" : "Explore the schedule"}
                <ArrowRight size={16} />
              </a>
            </div>
          </header>
          <section
            className={styles.content}
            id="schedule-content"
            aria-labelledby="schedule-heading"
          >
            <div className={styles.sectionTop}>
              <div>
                <p className={styles.eyebrow}>
                  {vi ? "Đường đua & khán đài" : "On the field"}
                </p>
                <h2 id="schedule-heading">
                  {vi ? "Lịch thi đấu & giải đấu" : "Fixtures & tournaments"}
                </h2>
              </div>
              <span className={styles.timezone}>
                {vi ? "Giờ Việt Nam · GMT+7" : "Vietnam time · GMT+7"}
              </span>
            </div>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label={vi ? "Loại lịch thi đấu" : "Schedule type"}
            >
              {(["matches", "tournaments"] as const).map((value) => (
                <button
                  key={value}
                  id={`tab-${value}`}
                  role="tab"
                  aria-selected={tab === value}
                  aria-controls="schedule-results"
                  onClick={() => {
                    setTab(value);
                    setPage(1);
                  }}
                  onKeyDown={(event) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    ) {
                      event.preventDefault();
                      const next =
                        event.key === "Home"
                          ? "matches"
                          : event.key === "End"
                            ? "tournaments"
                            : value === "matches"
                              ? "tournaments"
                              : "matches";
                      setTab(next);
                      setPage(1);
                      document.getElementById(`tab-${next}`)?.focus();
                    }
                  }}
                  tabIndex={tab === value ? 0 : -1}
                >
                  {value === "matches" ? (
                    <CalendarDays size={17} />
                  ) : (
                    <Trophy size={17} />
                  )}
                  {value === "matches"
                    ? vi
                      ? "Trận đấu"
                      : "Matches"
                    : vi
                      ? "Giải đấu"
                      : "Tournaments"}
                </button>
              ))}
            </div>
            <div className={styles.toolbar}>
              {multi(
                "sports",
                vi ? "Bộ môn thi đấu" : "Sports",
                entityOptions(sports),
                "toolbar",
              )}
              <div className={styles.field}>
                <label htmlFor="schedule-date">
                  {vi
                    ? tab === "matches"
                      ? "Ngày thi đấu"
                      : "Từ ngày"
                    : tab === "matches"
                      ? "Match date"
                      : "From date"}
                </label>
                <input
                  id="schedule-date"
                  type="date"
                  value={tab === "matches" ? filters.date : filters.startDate}
                  max={
                    tab === "tournaments"
                      ? filters.endDate || undefined
                      : undefined
                  }
                  onChange={(e) =>
                    change(
                      tab === "matches" ? "date" : "startDate",
                      e.target.value,
                    )
                  }
                />
              </div>
              <button
                className={styles.filterButton}
                onClick={() => setDrawer(true)}
              >
                <SlidersHorizontal size={16} />
                {vi ? "Bộ lọc" : "Filters"}
                {filterCount > 0 && <span>{filterCount}</span>}
                <ChevronDown size={14} />
              </button>
            </div>
            {optionsError && (
              <p className={styles.optionError} role="alert">
                {vi
                  ? "Chưa tải được tùy chọn bộ lọc."
                  : "Filter options are unavailable."}
                <button onClick={() => setRetry((value) => value + 1)}>
                  {vi ? "Thử lại" : "Retry"}
                </button>
              </p>
            )}
            <div className={styles.resultBar}>
              <span aria-live="polite">
                {loading ? (
                  vi ? (
                    "Đang tải lịch thi đấu…"
                  ) : (
                    "Loading schedule…"
                  )
                ) : (
                  <>
                    <strong>
                      {total.toLocaleString(vi ? "vi-VN" : "en-GB")}
                    </strong>{" "}
                    {tab === "matches"
                      ? vi
                        ? "trận đấu"
                        : "matches"
                      : vi
                        ? "giải đấu"
                        : "tournaments"}
                  </>
                )}
              </span>
              {filterCount > 0 && (
                <button onClick={clear}>
                  <RotateCcw size={13} />
                  {vi ? "Xóa bộ lọc" : "Clear filters"}
                </button>
              )}
            </div>
            <div
              role="tabpanel"
              id="schedule-results"
              aria-labelledby={`tab-${tab}`}
              aria-busy={loading}
            >
              {loading ? (
                <div className={styles.loading}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      active
                      title={{ width: "55%" }}
                      paragraph={{ rows: 2 }}
                    />
                  ))}
                </div>
              ) : error ? (
                <div className={styles.empty} role="alert">
                  <CalendarDays size={36} />
                  <h3>
                    {vi ? "Chưa thể tải lịch thi đấu" : "Schedule unavailable"}
                  </h3>
                  <p>
                    {vi
                      ? "Vui lòng thử tải lại dữ liệu sau ít phút."
                      : "Please try loading the schedule again."}
                  </p>
                  <button onClick={() => setRetry((value) => value + 1)}>
                    {vi ? "Thử lại" : "Try again"}
                    <RotateCcw size={14} />
                  </button>
                </div>
              ) : (
                  tab === "matches"
                    ? matches.length === 0
                    : tournaments.length === 0
                ) ? (
                <div className={styles.empty}>
                  <CalendarDays size={36} />
                  <h3>{vi ? "Chưa có lịch phù hợp" : "No matching events"}</h3>
                  <p>
                    {vi
                      ? "Thử chọn ngày khác hoặc điều chỉnh bộ lọc để khám phá thêm lịch thi đấu."
                      : "Try another date or adjust your filters to discover more events."}
                  </p>
                  {filterCount > 0 && (
                    <button onClick={clear}>
                      {vi ? "Xóa bộ lọc" : "Clear filters"}
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              ) : tab === "matches" ? (
                <div className={styles.matchList}>
                  {matches.map((match) => (
                    <article className={styles.match} key={match.id}>
                      <div className={styles.matchDate}>
                        <time dateTime={match.startTime}>
                          <strong>
                            {match.startTime
                              ? date(match.startTime, {
                                  day: "2-digit",
                                  month: undefined,
                                  year: undefined,
                                })
                              : "—"}
                          </strong>
                          <span>
                            {match.startTime
                              ? date(match.startTime, {
                                  day: undefined,
                                  month: "short",
                                  year: "numeric",
                                })
                              : vi
                                ? "Chưa có lịch"
                                : "Date TBA"}
                          </span>
                        </time>
                        <span className={styles.time}>
                          {time(match.startTime)}
                        </span>
                      </div>
                      <div className={styles.matchBody}>
                        <div className={styles.matchMeta}>
                          <span
                            className={styles.status}
                            data-status={match.status}
                          >
                            <i />
                            {status(match.status)}
                          </span>
                          {match.sport && (
                            <span className={styles.sportName}>
                              {SPORT_LOGOS[match.sport.slug || ""] && (
                                <Image
                                  src={`/subjects/${SPORT_LOGOS[match.sport.slug || ""]}`}
                                  alt=""
                                  width={22}
                                  height={22}
                                />
                              )}
                              {name(match.sport)}
                            </span>
                          )}
                          {match.round && <span>{match.round}</span>}
                        </div>
                        <h3>
                          <Link href={`/${language}/matches/${match.id}`}>
                            {match.title}
                          </Link>
                        </h3>
                        {match.tournament && (
                          <p className={styles.tournamentName}>
                            {match.tournament.name}
                          </p>
                        )}
                        <p className={styles.location}>
                          <MapPin size={13} />
                          {match.location ||
                            (vi
                              ? "Địa điểm đang cập nhật"
                              : "Venue to be announced")}
                        </p>
                        {!!match.participants?.length && (
                          <div className={styles.participants}>
                            {match.participants.map((person, index) => (
                              <span
                                key={
                                  typeof person === "string"
                                    ? `${person}-${index}`
                                    : person.id || index
                                }
                              >
                                {index > 0 && <em>vs</em>}
                                <span>
                                  {typeof person === "string"
                                    ? person
                                    : person.name || "—"}
                                </span>
                                {typeof person !== "string" &&
                                  person.score !== undefined &&
                                  ["ONGOING", "COMPLETED"].includes(
                                    match.status,
                                  ) && <strong>{person.score}</strong>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.matchAction}>
                        {match.result && (
                          <div className={styles.result}>
                            <small>{vi ? "Kết quả" : "Result"}</small>
                            <strong>{match.result}</strong>
                          </div>
                        )}
                        <Link href={`/${language}/matches/${match.id}`}>
                          {vi ? "Xem chi tiết" : "View match"}
                          <ArrowUpRight size={16} />
                        </Link>
                        <div className={styles.calendarActions}>
                          {match.startTime && (
                            <button
                              onClick={() => googleCalendar(match)}
                              title={
                                vi
                                  ? "Thêm vào Google Calendar"
                                  : "Add to Google Calendar"
                              }
                            >
                              <CalendarDays size={14} />
                              {vi ? "Lưu lịch" : "Save date"}
                            </button>
                          )}
                          {match.tournamentId && (
                            <a
                              href={getApiUrl(
                                `/calendar/tournaments/${match.tournamentId}/ics`,
                              )}
                              aria-label={
                                vi
                                  ? "Tải lịch giải đấu dạng ICS"
                                  : "Download tournament ICS"
                              }
                              title={vi ? "Tải lịch .ics" : "Download .ics"}
                            >
                              <Download size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.tournamentGrid}>
                  {tournaments.map((item) => (
                    <article className={styles.tournament} key={item.id}>
                      <Link
                        href={`/${language}/tournaments/${item.id}`}
                        className={styles.tournamentImage}
                        aria-label={item.name}
                      >
                        <NewsImage
                          src={item.bannerUrl || "/wp169/wp1.jpg"}
                          className={styles.photo}
                          sizes="(max-width: 767px) 100vw, 50vw"
                        />
                        <span className={styles.imageArrow}>
                          <ArrowUpRight size={20} />
                        </span>
                      </Link>
                      <div className={styles.tournamentMeta}>
                        <span
                          className={styles.status}
                          data-status={item.status}
                        >
                          <i />
                          {status(item.status)}
                        </span>
                        <Trophy size={15} />
                      </div>
                      <h3>
                        <Link href={`/${language}/tournaments/${item.id}`}>
                          {item.name}
                        </Link>
                      </h3>
                      <p className={styles.location}>
                        <CalendarDays size={14} />
                        {date(item.startDate)} — {date(item.endDate)}
                      </p>
                      <p className={styles.location}>
                        <MapPin size={14} />
                        {item.location ||
                          (vi
                            ? "Địa điểm đang cập nhật"
                            : "Venue to be announced")}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
            {!loading && !error && total > 0 && (
              <div className={styles.pagination}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger={false}
                  onChange={(value: number) => setPage(value)}
                  showLessItems
                />
                <span>
                  {vi
                    ? `Trang ${page} / ${Math.ceil(total / pageSize)}`
                    : `Page ${page} of ${Math.ceil(total / pageSize)}`}
                </span>
              </div>
            )}
          </section>
        </div>
      </main>
      <Drawer
        title={vi ? "Tìm lịch thi đấu" : "Find your event"}
        open={drawer}
        onClose={() => setDrawer(false)}
        size={400}
        rootClassName={styles.drawer}
        footer={
          <button className={styles.apply} onClick={() => setDrawer(false)}>
            {vi ? "Xem kết quả" : "View results"}
            <ArrowRight size={16} />
          </button>
        }
      >
        <div className={styles.drawerIntro}>
          <p>
            {vi
              ? "Tinh chỉnh lịch theo bộ môn, giải đấu và địa điểm bạn quan tâm."
              : "Find events by sport, competition and venue."}
          </p>
          <button onClick={clear}>
            <RotateCcw size={13} />
            {vi ? "Xóa bộ lọc" : "Reset filters"}
          </button>
        </div>
        <div className={styles.drawerFields}>
          {multi(
            "sports",
            vi ? "Bộ môn thi đấu" : "Sports",
            entityOptions(sports),
          )}
          {tab === "matches" &&
            multi(
              "tournaments",
              vi ? "Giải đấu" : "Tournament",
              entityOptions(tournamentOptions),
            )}
          {multi(
            "statuses",
            vi ? "Trạng thái" : "Status",
            ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"].map((value) => ({
              value,
              label: status(value),
            })),
          )}
          {multi(
            "weights",
            vi ? "Phân khúc / Hạng cân" : "Weight class",
            weights.map((value, index) => ({
              value,
              label: vi
                ? [
                    "Dưới 49 kg",
                    "49 kg – 54 kg",
                    "55 kg – 59 kg",
                    "60 kg – 65 kg",
                    "66 kg – 72 kg",
                    "Trên 72 kg",
                  ][index]
                : [
                    "Under 49 kg",
                    "49 kg – 54 kg",
                    "55 kg – 59 kg",
                    "60 kg – 65 kg",
                    "66 kg – 72 kg",
                    "Over 72 kg",
                  ][index],
            })),
          )}
          {multi(
            "classifications",
            vi ? "Hạng thương tật" : "Sport classification",
            classifications
              .filter(
                (item) =>
                  !filters.sports.length ||
                  !item.sportId ||
                  filters.sports.includes(item.sportId),
              )
              .map((item) => ({
                value: item.id,
                label: item.code || name(item),
              })),
          )}
          <div className={styles.field}>
            <label htmlFor="schedule-location">
              {vi ? "Địa điểm" : "Venue"}
            </label>
            <Select
              id="schedule-location"
              aria-label={vi ? "Địa điểm" : "Venue"}
              showSearch
              allowClear
              placeholder={vi ? "Tất cả địa điểm" : "All venues"}
              value={filters.location}
              options={locations.map((value) => ({ value, label: value }))}
              onChange={(value: string | undefined) =>
                change("location", value)
              }
            />
          </div>
          {tab === "matches" ? (
            <div className={styles.field}>
              <label htmlFor="drawer-match-date">
                {vi ? "Ngày thi đấu" : "Match date"}
              </label>
              <input
                id="drawer-match-date"
                type="date"
                value={filters.date}
                onChange={(e) => change("date", e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor="drawer-start-date">
                  {vi ? "Từ ngày" : "From date"}
                </label>
                <input
                  id="drawer-start-date"
                  type="date"
                  value={filters.startDate}
                  max={filters.endDate || undefined}
                  onChange={(e) => change("startDate", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="drawer-end-date">
                  {vi ? "Đến ngày" : "To date"}
                </label>
                <input
                  id="drawer-end-date"
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate || undefined}
                  onChange={(e) => change("endDate", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </ConfigProvider>
  );
}
