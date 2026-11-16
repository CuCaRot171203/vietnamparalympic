"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConfigProvider, Select, theme } from "antd";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { getApiUrl } from "@/utils/api";
import { clubSlug, safeMediaUrl, splitClubSports } from "@/lib/organizations";
import type { Organization } from "@/lib/organizations";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import styles from "./home-clubs.module.css";

type Sport = { id?: string; nameVi: string; nameEn?: string };
const fallbackImage = "/CLUB/CLUB_02.jpg";

function ClubImage({ club }: { club: Organization }) {
  const [failed, setFailed] = useState(false);
  const source =
    safeMediaUrl(club.imageUrl) ||
    safeMediaUrl(club.details?.coverImage) ||
    fallbackImage;
  useEffect(() => setFailed(false), [source]);
  return (
    <Image
      src={failed ? fallbackImage : source}
      alt=""
      fill
      unoptimized
      sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 25vw"
      className={styles.photo}
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeClubs({
  language,
  sports,
}: {
  language: string;
  sports: Sport[];
}) {
  const vi = language === "vi";
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [sport, setSport] = useState<string>();
  const [region, setRegion] = useState<string>();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 350);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const params = new URLSearchParams();
    if (sport) params.set("sport", sport);
    if (region) params.set("location", region);
    if (search) params.set("search", search);
    setLoading(true);
    setError(false);
    fetch(`${getApiUrl("/organizations")}${params.size ? `?${params}` : ""}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load clubs");
        const body = await response.json();
        const data = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(data)) throw new Error("Invalid clubs response");
        if (active) setClubs(data.slice(0, 4));
      })
      .catch(() => {
        if (active) {
          setClubs([]);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [sport, region, search, retry]);

  const sportOptions = useMemo(
    () =>
      sports.map((item) => ({
        value: item.nameVi,
        label: (vi ? item.nameVi : item.nameEn) || item.nameVi,
      })),
    [sports, vi],
  );
  const regions = [
    { value: "Bắc", label: vi ? "Miền Bắc" : "North" },
    { value: "Trung", label: vi ? "Miền Trung" : "Central" },
    { value: "Nam", label: vi ? "Miền Nam" : "South" },
  ];
  const filtered = !!(sport || region || input);
  const clear = () => {
    setSport(undefined);
    setRegion(undefined);
    setInput("");
    setSearch("");
  };

  return (
    <section
      id="home-clubs"
      aria-labelledby="home-clubs-heading"
      className={`${styles.section} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
    >
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.badge}>
              <span aria-hidden="true" />
              {vi ? "Câu lạc bộ" : "Clubs"}
            </span>
            <h2 id="home-clubs-heading">
              {vi
                ? "TÌM NƠI TẬP, KẾT NỐI CỘNG ĐỒNG"
                : "FIND YOUR PLACE. CONNECT YOUR COMMUNITY."}
            </h2>
          </div>
          <div className={styles.intro}>
            <p>
              {vi
                ? "Khám phá các câu lạc bộ, trung tâm và lớp học thể thao dành cho người khuyết tật. Tìm hiểu địa điểm, lịch tập và cách tham gia để lựa chọn nơi tập luyện phù hợp."
                : "Explore sports clubs, centres and classes for people with disabilities. Find locations, training schedules and ways to join the right community for you."}
            </p>
            <Link href={`/${language}/clubs`} className={styles.explore}>
              {vi ? "Khám phá câu lạc bộ" : "Explore clubs"}
              <span aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </header>
        <ConfigProvider
          theme={{
            algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              colorPrimary: dark ? "#ef9fb0" : "#7c293b",
              colorBgContainer: dark ? "#231c19" : "#fffdf8",
              colorBgElevated: dark ? "#231c19" : "#fffdf8",
              colorText: dark ? "#f7f4ed" : "#231916",
              colorBorder: dark ? "#54413b" : "#e8ded7",
              colorTextPlaceholder: dark ? "#c6b9b2" : "#766b65",
              borderRadius: 10,
              controlHeight: 50,
              fontFamily: homeBeVietnam.style.fontFamily,
              fontSize: 13,
            },
          }}
        >
          <div
            className={styles.filters}
            role="search"
            aria-label={vi ? "Tìm câu lạc bộ" : "Find clubs"}
          >
            <Select
              id="home-club-sport"
              aria-label={vi ? "Bộ môn" : "Sport"}
              placeholder={vi ? "Bộ môn" : "Sport"}
              value={sport}
              onChange={setSport}
              options={sportOptions}
              allowClear
              showSearch
              optionFilterProp="label"
              className={styles.select}
            />
            <Select
              id="home-club-region"
              aria-label={vi ? "Khu vực" : "Region"}
              placeholder={vi ? "Khu vực" : "Region"}
              value={region}
              onChange={setRegion}
              options={regions}
              allowClear
              className={styles.select}
            />
            <div className={styles.search}>
              <Search size={17} strokeWidth={1.6} aria-hidden="true" />
              <input
                aria-label={
                  vi
                    ? "Tìm câu lạc bộ, trung tâm, lớp học"
                    : "Search clubs, centres and classes"
                }
                placeholder={
                  vi
                    ? "Tìm câu lạc bộ, trung tâm, lớp học..."
                    : "Search clubs, centres and classes..."
                }
                value={input}
                onChange={(event) => setInput(event.target.value)}
                type="search"
              />
              {input && (
                <button
                  type="button"
                  aria-label={vi ? "Xóa từ khóa" : "Clear search"}
                  onClick={() => setInput("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </ConfigProvider>
        <div className={styles.results} aria-busy={loading}>
          {loading ? (
            <>
              <span className={styles.srOnly} role="status">
                {vi ? "Đang tải câu lạc bộ…" : "Loading clubs…"}
              </span>
              <div className={styles.grid} aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <div className={styles.skeleton} key={index} />
                ))}
              </div>
            </>
          ) : error ? (
            <div className={styles.empty} role="status">
              <p>
                {vi
                  ? "Chưa thể tải danh sách câu lạc bộ."
                  : "Unable to load clubs."}
              </p>
              <button onClick={() => setRetry((value) => value + 1)}>
                {vi ? "Thử lại" : "Try again"}
              </button>
            </div>
          ) : !clubs.length ? (
            <div className={styles.empty} role="status">
              <p>
                {vi
                  ? "Không tìm thấy câu lạc bộ phù hợp."
                  : "No matching clubs found."}
              </p>
              {filtered && (
                <button onClick={clear}>
                  {vi ? "Xóa bộ lọc" : "Clear filters"}
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {clubs.map((club) => {
                const sports = [...new Set(splitClubSports(club.sport))];
                const href = `/${language}/clubs/detail/${clubSlug(club)}`;
                return (
                  <article className={styles.card} key={club.id}>
                    <Link
                      href={href}
                      className={styles.image}
                      aria-label={club.name}
                    >
                      <ClubImage club={club} />
                      {!!sports.length && (
                        <span className={styles.sports}>
                          {sports.slice(0, 2).map((name) => (
                            <span key={name}>{name}</span>
                          ))}
                          {sports.length > 2 && (
                            <span title={sports.slice(2).join(", ")}>
                              +{sports.length - 2}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                    <div className={styles.cardBody}>
                      <h3>
                        <Link href={href}>{club.name}</Link>
                      </h3>
                      <p>
                        <MapPin size={13} aria-hidden="true" />
                        {club.location ||
                          (vi
                            ? "Địa điểm đang cập nhật"
                            : "Venue to be announced")}
                      </p>
                      <p>
                        <CalendarDays size={13} aria-hidden="true" />
                        {club.schedule ||
                          (vi
                            ? "Lịch tập đang cập nhật"
                            : "Schedule to be announced")}
                      </p>
                      <Link href={href} className={styles.detail}>
                        {vi ? "Xem chi tiết" : "View details"}
                        <span aria-hidden="true">
                          <ArrowUpRight size={14} />
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
