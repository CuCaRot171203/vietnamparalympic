"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, ConfigProvider, Input, Select, Table, theme } from "antd";
import type { TableColumnsType } from "antd";
import { useTheme } from "next-themes";
import {
  ArrowDownUp,
  ArrowUpRight,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { SPORT_LOGOS } from "@/lib/sport-logos";
import { useLanguage } from "@/hooks/useTranslation";
import PublicPageHero from "@/components/PublicPageHero";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import styles from "./rankings.module.css";

type Entity = {
  id: string;
  name?: string;
  nameVi?: string;
  nameEn?: string;
  slug?: string;
  code?: string;
  description?: string;
};
type Ranking = {
  id: string;
  sportId: string;
  rank: number;
  points: number;
  athlete?: {
    id: string;
    userId?: string;
    achievements?: string;
    user?: { id: string; fullName?: string; avatarUrl?: string };
  };
  team?: Entity;
  tournament?: Entity;
  event?: Entity;
  classification?: Entity;
};
type Options = {
  sports: Entity[];
  tournaments: Entity[];
  classifications: Entity[];
  teams: Entity[];
  organizations: Entity[];
};
const initialOptions: Options = {
  sports: [],
  tournaments: [],
  classifications: [],
  teams: [],
  organizations: [],
};
const initialFilters = {
  tournamentId: undefined as string | undefined,
  classificationId: undefined as string | undefined,
  eventId: undefined as string | undefined,
  teamId: undefined as string | undefined,
  organizationId: undefined as string | undefined,
};
async function read<T>(url: string): Promise<T> {
  const res = await apiClient.request(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
function list<T>(value: T[] | { data: T[] }): T[] {
  return Array.isArray(value)
    ? value
    : Array.isArray(value?.data)
      ? value.data
      : [];
}

export default function PublicRankingsPage() {
  const { language } = useLanguage();
  const vi = language === "vi";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState<Options>(initialOptions);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [events, setEvents] = useState<Entity[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const sportById = useMemo(
    () => new Map(options.sports.map((item) => [item.id, item])),
    [options.sports],
  );
  const advancedCount = Object.values(filters).filter(Boolean).length;
  const activeCount = advancedCount + (search.trim() ? 1 : 0);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let current = true;
    setInitializing(true);
    setError(false);
    setLoading(true);
    Promise.all(
      [
        "/sports",
        "/tournaments",
        "/sport-classifications",
        "/teams",
        "/organizations",
      ].map((url) => read<Entity[] | { data: Entity[] }>(url)),
    )
      .then(([sports, tournaments, classifications, teams, organizations]) => {
        if (!current) return;
        const data = {
          sports: list(sports),
          tournaments: list(tournaments),
          classifications: list(classifications),
          teams: list(teams),
          organizations: list(organizations),
        };
        setOptions(data);
        setSelectedSports((previous) =>
          previous.length
            ? previous.filter((id) => data.sports.some((s) => s.id === id))
            : data.sports.slice(0, 1).map((s) => s.id),
        );
      })
      .catch(() => {
        if (current) setError(true);
      })
      .finally(() => {
        if (current) {
          setInitializing(false);
          setLoading(false);
        }
      });
    return () => {
      current = false;
    };
  }, [retry]);
  const eventSport =
    selectedSports.length === 1 ? selectedSports[0] : undefined;
  useEffect(() => {
    let current = true;
    setEvents([]);
    if (eventSport)
      read<Entity[] | { data: Entity[] }>(
        `/sport-events?sportId=${encodeURIComponent(eventSport)}`,
      )
        .then((data) => {
          if (current) setEvents(list(data));
        })
        .catch(() => {
          if (current) setEvents([]);
        });
    return () => {
      current = false;
    };
  }, [eventSport]);
  useEffect(() => {
    if (initializing) return;
    let current = true;
    setPage(1);
    if (!selectedSports.length) {
      setRankings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key === "eventId" ? "event" : key, value);
    });
    if (debouncedSearch) query.set("athleteName", debouncedSearch);
    Promise.all(
      selectedSports.map((id) =>
        read<Ranking[]>(`/rankings/sport/${encodeURIComponent(id)}?${query}`),
      ),
    )
      .then((results) => {
        if (!current) return;
        setRankings(
          results
            .flat()
            .sort(
              (a, b) =>
                selectedSports.indexOf(a.sportId) -
                  selectedSports.indexOf(b.sportId) || a.rank - b.rank,
            ),
        );
      })
      .catch(() => {
        if (current) {
          setRankings([]);
          setError(true);
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [selectedSports, filters, debouncedSearch, initializing]);

  const changeSports = (ids: string[]) => {
    setSelectedSports(ids);
    setFilters((previous) => ({ ...previous, eventId: undefined }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(initialFilters);
    setSearch("");
    setPage(1);
  };
  const athletes = new Set(rankings.map((r) => r.athlete?.id).filter(Boolean))
    .size;
  const tournaments = new Set(
    rankings.map((r) => r.tournament?.id).filter(Boolean),
  ).size;
  const optionItems = (items: Entity[]) =>
    items.map((item) => ({ value: item.id, label: name(item) }));
  const columns: TableColumnsType<Ranking> = [
    {
      title: vi ? "Hạng" : "Rank",
      key: "rank",
      dataIndex: "rank",
      width: 82,
      sorter: (a, b) => a.rank - b.rank,
      render: (rank: number) => (
        <span className={styles.rank} data-rank={rank}>
          {String(rank).padStart(2, "0")}
        </span>
      ),
    },
    {
      title: vi ? "Vận động viên" : "Athlete",
      key: "athlete",
      width: 255,
      sorter: (a, b) =>
        (a.athlete?.user?.fullName || "").localeCompare(
          b.athlete?.user?.fullName || "",
        ),
      render: (_, row) => {
        const user = row.athlete?.user;
        const userId = row.athlete?.userId || user?.id;
        const content = (
          <>
            <Avatar size={40} src={user?.avatarUrl} className={styles.avatar}>
              {user?.fullName?.charAt(0) || "V"}
            </Avatar>
            <span>
              <strong>
                {user?.fullName || (vi ? "Chưa cập nhật" : "Not available")}
              </strong>
              <small>
                {row.classification?.code || (vi ? "Vận động viên" : "Athlete")}
              </small>
            </span>
            {userId && <ArrowUpRight size={15} />}
          </>
        );
        return userId ? (
          <Link
            href={`/${language}/users/${userId}`}
            className={styles.athlete}
          >
            {content}
          </Link>
        ) : (
          <div className={styles.athlete}>{content}</div>
        );
      },
    },
    {
      title: vi ? "Bộ môn / Nội dung" : "Sport / Event",
      key: "sport",
      width: 220,
      render: (_, row) => (
        <div className={styles.cell}>
          <strong>{name(sportById.get(row.sportId))}</strong>
          <span>{name(row.event)}</span>
        </div>
      ),
    },
    {
      title: vi ? "Đội tuyển / Giải đấu" : "Team / Tournament",
      key: "team",
      width: 215,
      render: (_, row) => (
        <div className={styles.cell}>
          <strong>{name(row.team)}</strong>
          <span>{name(row.tournament)}</span>
        </div>
      ),
    },
    {
      title: vi ? "Điểm số" : "Points",
      key: "points",
      dataIndex: "points",
      align: "right",
      width: 110,
      sorter: (a, b) => a.points - b.points,
      render: (points: number) => (
        <strong className={styles.points}>
          {Number.isFinite(points)
            ? points.toLocaleString(vi ? "vi-VN" : "en-GB")
            : "—"}
        </strong>
      ),
    },
  ];
  const selectFilter = (
    key: keyof typeof filters,
    label: string,
    items: Entity[],
    disabled = false,
  ) => (
    <div className={styles.field} key={key}>
      <label htmlFor={`ranking-${key}`}>{label}</label>
      <Select
        id={`ranking-${key}`}
        aria-label={label}
        showSearch
        optionFilterProp="label"
        allowClear
        value={filters[key]}
        placeholder={vi ? "Tất cả" : "All"}
        options={optionItems(items)}
        disabled={disabled}
        onChange={(value: string | undefined) =>
          setFilters((previous) => ({ ...previous, [key]: value }))
        }
      />
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: dark ? "#ff626e" : "#e10e20",
          colorBgContainer: dark ? "#201b18" : "#fff",
          colorBgElevated: dark ? "#24241f" : "#fff",
          colorText: dark ? "#fff" : "#291b18",
          colorTextSecondary: dark ? "#c0b2a8" : "#80736d",
          colorBorder: dark ? "#393932" : "#dedbd2",
          borderRadius: 14,
          controlHeight: 42,
          fontFamily: "inherit",
          fontSize: 13,
        },
        components: {
          Table: {
            headerBg: dark ? "#24241f" : "#faf5f1",
            rowHoverBg: dark ? "#25251f" : "#fff4ee",
            cellPaddingBlock: 20,
            headerColor: dark ? "#c0b2a8" : "#80736d",
          },
        },
      }}
    >
      <main
        id="main-content"
        className={[
          styles.page,
          homeBeVietnam.variable,
          homeNeusharp.variable,
        ].join(" ")}
      >
        <PublicPageHero
          locale={language}
          title={vi ? "Bảng xếp hạng" : "Rankings"}
          tagline={
            vi
              ? "Những nỗ lực. Những dấu ấn."
              : "Every effort. Every achievement."
          }
          description={
            vi
              ? "Theo dõi thứ hạng, ghi nhận thành tích và đồng hành cùng hành trình bứt phá của vận động viên thể thao người khuyết tật Việt Nam."
              : "Follow the rankings and celebrate every milestone on the journey of Vietnam’s para athletes."
          }
          image="/PAGES/RANKS.jpg"
          imageAlt={
            vi
              ? "Thể thao người khuyết tật và những dấu ấn thi đấu"
              : "Celebrating para sports achievements"
          }
          primary={{
            label: vi ? "Khám phá bảng xếp hạng" : "Explore the rankings",
            href: "#rankings-content",
          }}
        />
        <div className={styles.container}>
          <section
            className={styles.sports}
            aria-labelledby="rankings-sports-heading"
          >
            <div className={styles.sectionLabel}>
              <h2 id="rankings-sports-heading">
                {vi ? "Theo từng bộ môn" : "Explore by sport"}
              </h2>
              <span>
                {vi
                  ? "Chọn bộ môn để xem thứ hạng"
                  : "Choose a sport to view rankings"}
              </span>
            </div>
            <div className={styles.sportTrack}>
              {options.sports.map((sport) => (
                <button
                  type="button"
                  key={sport.id}
                  aria-pressed={selectedSports.includes(sport.id)}
                  className={styles.sport}
                  onClick={() => changeSports([sport.id])}
                >
                  {SPORT_LOGOS[sport.slug || ""] && (
                    <span className={styles.sportLogo}>
                      <Image
                        src={`/subjects/${SPORT_LOGOS[sport.slug || ""]}`}
                        alt=""
                        width={32}
                        height={32}
                      />
                    </span>
                  )}
                  <span>{name(sport)}</span>
                </button>
              ))}
              {initializing && (
                <span className={styles.status}>
                  {vi ? "Đang tải bộ môn…" : "Loading sports…"}
                </span>
              )}
            </div>
          </section>
          <section
            id="rankings-content"
            className={styles.results}
            aria-labelledby="rankings-heading"
          >
            <div className={styles.resultsHeading}>
              <div>
                <p className={styles.eyebrow}>
                  {vi ? "Thành tích & thứ hạng" : "Performance & standings"}
                </p>
                <h2 id="rankings-heading">
                  {vi ? "Bảng xếp hạng" : "Rankings"}
                  <ArrowDownUp size={22} />
                </h2>
              </div>
              <p>
                {vi
                  ? "Thứ hạng theo từng nội dung và giải đấu."
                  : "Rankings within each event and tournament."}
              </p>
            </div>
            <div className={styles.filterPanel}>
              <div className={styles.primaryFilters}>
                <div className={styles.field}>
                  <label htmlFor="ranking-search">
                    {vi ? "Vận động viên" : "Athlete"}
                  </label>
                  <Input
                    id="ranking-search"
                    aria-label={vi ? "Tìm vận động viên" : "Search athletes"}
                    prefix={<Search size={16} />}
                    allowClear
                    placeholder={
                      vi ? "Tìm tên vận động viên…" : "Search athlete name…"
                    }
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="ranking-sports">
                    {vi ? "Bộ môn thi đấu" : "Sports"}
                  </label>
                  <Select
                    id="ranking-sports"
                    aria-label={vi ? "Chọn bộ môn" : "Select sports"}
                    mode="multiple"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    maxTagCount="responsive"
                    value={selectedSports}
                    placeholder={
                      vi
                        ? "Chọn một hoặc nhiều bộ môn"
                        : "Choose one or more sports"
                    }
                    options={optionItems(options.sports)}
                    onChange={changeSports}
                  />
                </div>
                <button
                  className={styles.filterToggle}
                  aria-expanded={expanded}
                  aria-controls="ranking-filters"
                  onClick={() => setExpanded((value) => !value)}
                >
                  <SlidersHorizontal size={16} />
                  {vi ? "Bộ lọc" : "Filters"}
                  {advancedCount > 0 && <span>{advancedCount}</span>}
                  <ChevronDown
                    size={14}
                    className={expanded ? styles.rotated : ""}
                  />
                </button>
              </div>
              <div id="ranking-filters" hidden={!expanded}>
                <div className={styles.advancedFilters}>
                  {selectFilter(
                    "tournamentId",
                    vi ? "Giải đấu" : "Tournament",
                    options.tournaments,
                  )}
                  {selectFilter(
                    "eventId",
                    vi ? "Nội dung / Hạng cân" : "Event / Weight class",
                    events,
                    !eventSport,
                  )}
                  {selectFilter(
                    "classificationId",
                    vi ? "Hạng thương tật" : "Sport classification",
                    options.classifications.map((item) => ({
                      ...item,
                      name: [item.code, item.description]
                        .filter(Boolean)
                        .join(" · "),
                    })),
                  )}
                  {selectFilter(
                    "teamId",
                    vi ? "Đội tuyển" : "Team",
                    options.teams,
                  )}
                  {selectFilter(
                    "organizationId",
                    vi ? "Câu lạc bộ" : "Club",
                    options.organizations,
                  )}
                </div>
                {!eventSport && (
                  <p className={styles.filterHint}>
                    {vi
                      ? "Chọn một bộ môn để lọc theo nội dung hoặc hạng cân."
                      : "Select a single sport to filter by event or weight class."}
                  </p>
                )}
              </div>
              {activeCount > 0 && (
                <div className={styles.filterSummary}>
                  <span>
                    {activeCount}{" "}
                    {vi ? "bộ lọc đang áp dụng" : "active filters"}
                  </span>
                  <button onClick={clearFilters}>
                    <RotateCcw size={13} />
                    {vi ? "Xóa bộ lọc" : "Clear filters"}
                  </button>
                </div>
              )}
            </div>
            <div
              className={styles.summary}
              aria-live="polite"
              aria-busy={loading}
            >
              <span>
                <strong>
                  {loading
                    ? "—"
                    : rankings.length.toLocaleString(vi ? "vi-VN" : "en-GB")}
                </strong>
                {vi ? "kết quả xếp hạng" : "ranking entries"}
              </span>
              <span>
                <strong>{loading ? "—" : athletes}</strong>
                {vi ? "vận động viên" : "athletes"}
              </span>
              <span>
                <strong>{loading ? "—" : tournaments}</strong>
                {vi ? "giải đấu" : "tournaments"}
              </span>
            </div>
            {error ? (
              <div className={styles.empty} role="alert">
                <Trophy size={34} strokeWidth={1.3} />
                <h3>
                  {vi
                    ? "Chưa thể tải bảng xếp hạng"
                    : "Rankings are unavailable"}
                </h3>
                <p>
                  {vi
                    ? "Vui lòng thử lại để tải dữ liệu mới nhất."
                    : "Please try again to load the latest results."}
                </p>
                <button onClick={() => setRetry((value) => value + 1)}>
                  {vi ? "Thử lại" : "Try again"}
                  <RotateCcw size={14} />
                </button>
              </div>
            ) : (
              <div className={styles.table}>
                <Table<Ranking>
                  rowKey="id"
                  columns={columns}
                  dataSource={rankings}
                  loading={loading}
                  scroll={{ x: 882 }}
                  showSorterTooltip={false}
                  pagination={{
                    current: page,
                    pageSize,
                    total: rankings.length,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50],
                    onChange: (next: number, size: number) => {
                      setPage(size !== pageSize ? 1 : next);
                      setPageSize(size);
                    },
                    showTotal: (total: number, range: [number, number]) =>
                      vi
                        ? `${range[0]}–${range[1]} / ${total} kết quả`
                        : `${range[0]}–${range[1]} of ${total} results`,
                  }}
                  locale={{
                    emptyText: (
                      <div className={styles.empty}>
                        <Trophy size={34} strokeWidth={1.3} />
                        <h3>
                          {!selectedSports.length
                            ? vi
                              ? "Chọn bộ môn bạn quan tâm"
                              : "Choose your sport"
                            : vi
                              ? "Chưa có kết quả phù hợp"
                              : "No matching results"}
                        </h3>
                        <p>
                          {!selectedSports.length
                            ? vi
                              ? "Bảng xếp hạng sẽ xuất hiện khi bạn chọn bộ môn."
                              : "Select a sport to see its rankings."
                            : vi
                              ? "Thử thay đổi bộ môn hoặc điều chỉnh bộ lọc tìm kiếm."
                              : "Try another sport or adjust your filters."}
                        </p>
                        {activeCount > 0 && (
                          <button onClick={clearFilters}>
                            {vi ? "Xóa bộ lọc" : "Clear filters"}
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    ),
                    triggerAsc: vi ? "Sắp xếp tăng dần" : "Sort ascending",
                    triggerDesc: vi ? "Sắp xếp giảm dần" : "Sort descending",
                    cancelSort: vi ? "Bỏ sắp xếp" : "Clear sorting",
                  }}
                />
              </div>
            )}
            <p className={styles.footnote}>
              {vi
                ? "Mỗi thứ hạng là dấu ấn của một hành trình nỗ lực. Điểm số và thứ hạng được hiển thị theo dữ liệu từng giải đấu."
                : "Every rank marks a journey of effort. Scores and standings reflect the records of each tournament."}
            </p>
          </section>
        </div>
      </main>
    </ConfigProvider>
  );
}
