"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { sportIconSource, sportThumbnailSource } from "@/lib/sport-media";
import { SPORT_BACKGROUNDS } from "@/lib/sport-assets";
import styles from "./sports-directory.module.css";

export type DirectorySport = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn?: string;
  icon?: string;
  thumbnail?: string | null;
  descVi?: string;
  descEn?: string;
};
export type SportClass = {
  id: string;
  sportId: string;
  code: string;
  description?: string;
  medicalDesc?: string;
  disabilityCriteria?: string;
  requiresAssistant: boolean;
};
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const normalize = (value: string) =>
  plain(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

export default function SportsDirectory({
  locale,
  sports,
  classifications,
  sportsError,
  classesError,
  initialTab = "sports",
  initialSportId = "",
  initialQuery = "",
}: {
  locale: string;
  sports: DirectorySport[];
  classifications: SportClass[];
  sportsError: boolean;
  classesError: boolean;
  initialTab?: "sports" | "classes";
  initialSportId?: string;
  initialQuery?: string;
}) {
  const vi = locale === "vi";
  const [tab, setTab] = useState<"sports" | "classes">(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [sportId, setSportId] = useState(initialSportId);
  const [limit, setLimit] = useState(9);
  const name = (sport: DirectorySport) =>
    (vi ? sport.nameVi : sport.nameEn) || sport.nameVi;
  const term = normalize(query);
  const sportById = new Map(sports.map((sport) => [sport.id, sport]));
  const filteredSports = sports.filter((sport) =>
    normalize(
      `${sport.nameVi} ${sport.nameEn || ""} ${sport.descVi || ""} ${sport.descEn || ""}`,
    ).includes(term),
  );
  const filteredClasses = classifications.filter(
    (item) =>
      (!sportId || item.sportId === sportId) &&
      normalize(
        `${item.code} ${item.description || ""} ${item.medicalDesc || ""} ${item.disabilityCriteria || ""} ${sportById.get(item.sportId)?.nameVi || ""} ${sportById.get(item.sportId)?.nameEn || ""}`,
      ).includes(term),
  );
  const items = tab === "sports" ? filteredSports : filteredClasses;
  const failed = tab === "sports" ? sportsError : classesError;
  return (
    <section
      id="sports-directory"
      className={`${styles.container} ${styles.directory}`}
      aria-labelledby="directory-heading"
    >
      <span className={styles.badge}>
        {vi ? "Khám phá & tìm hiểu" : "Explore & understand"}
      </span>
      <h2 id="directory-heading">
        {tab === "sports"
          ? vi
            ? "Tìm bộ môn của bạn"
            : "Find your sport"
          : vi
            ? "Tìm hiểu hạng thương tật"
            : "Understand sport classifications"}
      </h2>
      <div className={styles.toolbar}>
        <div
          className={styles.tabs}
          role="group"
          aria-label={vi ? "Chọn nội dung" : "Choose content"}
        >
          <button
            type="button"
            aria-pressed={tab === "sports"}
            onClick={() => {
              setTab("sports");
              setLimit(9);
            }}
          >
            {vi ? "Bộ môn" : "Sports"}
            <span>{sports.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={tab === "classes"}
            onClick={() => {
              setTab("classes");
              setLimit(9);
            }}
          >
            {vi ? "Thương tật" : "Classifications"}
            <span>{classifications.length}</span>
          </button>
        </div>
        <div className={styles.filters}>
          {tab === "classes" && (
            <select
              aria-label={vi ? "Lọc theo bộ môn" : "Filter by sport"}
              value={sportId}
              onChange={(event) => {
                setSportId(event.target.value);
                setLimit(9);
              }}
            >
              <option value="">{vi ? "Tất cả bộ môn" : "All sports"}</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {name(sport)}
                </option>
              ))}
            </select>
          )}
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              aria-label={
                vi
                  ? "Tìm kiếm bộ môn hoặc hạng thương tật"
                  : "Search sports or classifications"
              }
              placeholder={
                tab === "sports"
                  ? vi
                    ? "Tìm kiếm bộ môn..."
                    : "Search sports..."
                  : vi
                    ? "Tìm mã hạng, mô tả..."
                    : "Search class codes, descriptions..."
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(9);
              }}
            />
          </label>
        </div>
      </div>
      {tab === "classes" && (
        <p className={styles.guidance}>
          {vi
            ? "Thông tin phân hạng theo từng bộ môn do hệ thống cập nhật. Kết quả phân hạng thi đấu cần được xác nhận bởi hội đồng chuyên môn."
            : "Classifications are listed by sport. Competition classification must be confirmed by qualified classifiers."}
        </p>
      )}
      {failed ? (
        <div className={styles.empty}>
          <p>
            {vi
              ? "Chưa thể tải dữ liệu. Vui lòng thử lại."
              : "Unable to load this data. Please try again."}
          </p>
          <a href={`/${locale}/sports`}>
            {vi ? "Tải lại trang" : "Reload page"}
            <ArrowRight size={14} />
          </a>
        </div>
      ) : !items.length ? (
        <p className={styles.empty} role="status">
          {vi ? "Không tìm thấy kết quả phù hợp." : "No matching results."}
        </p>
      ) : tab === "sports" ? (
        <div className={styles.grid}>
          {filteredSports.slice(0, limit).map((sport) => (
            <article key={sport.id} className={styles.card}>
              <Link
                className={styles.image}
                href={`/${locale}/sports/${sport.slug}`}
                aria-label={name(sport)}
              >
                {sport.thumbnail || SPORT_BACKGROUNDS[sport.slug] ? (
                  <Image
                    className={styles.cardPhoto}
                    src={sportThumbnailSource(sport.thumbnail, sport.slug)}
                    alt=""
                    fill
                    sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw"
                    unoptimized={Boolean(sport.thumbnail)}
                  />
                ) : (
                  <span className={styles.photoFallback}>
                    Vietnam ParaSports
                  </span>
                )}
                {sportIconSource(sport.icon, sport.slug) && (
                  <span className={styles.logo}>
                    <img
                      src={sportIconSource(sport.icon, sport.slug)!}
                      alt=""
                      width={36}
                      height={36}
                    />
                  </span>
                )}
              </Link>
              <div className={styles.cardBody}>
                <span className={styles.category}>
                  {vi ? "Bộ môn thể thao" : "Sport"}
                </span>
                <h3>
                  <Link href={`/${locale}/sports/${sport.slug}`}>
                    {name(sport)}
                  </Link>
                </h3>
                <p>
                  {plain((vi ? sport.descVi : sport.descEn) || sport.descVi) ||
                    (vi
                      ? "Khám phá tin tức, tập luyện và cộng đồng của bộ môn."
                      : "Explore the sport's stories, training and community.")}
                </p>
                <Link
                  className={styles.cardLink}
                  href={`/${locale}/sports/${sport.slug}`}
                >
                  {vi ? "Khám phá bộ môn" : "Explore sport"}
                  <span>
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.classGrid}>
          {filteredClasses.slice(0, limit).map((item) => {
            const sport = sportById.get(item.sportId);
            return (
              <article key={item.id} className={styles.classCard}>
                <div className={styles.classTop}>
                  <span className={styles.classCode}>{item.code}</span>
                  {sport && (
                    <Link href={`/${locale}/sports/${sport.slug}`}>
                      {name(sport)}
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
                <h3>{vi ? "Mô tả chức năng" : "Functional description"}</h3>
                <p>
                  {plain(item.description) ||
                    (vi ? "Đang cập nhật mô tả." : "Description coming soon.")}
                </p>
                {(item.medicalDesc || item.disabilityCriteria) && (
                  <details>
                    <summary>
                      {vi ? "Thông tin phân hạng" : "Classification details"}
                      <ChevronDown size={14} />
                    </summary>
                    {item.medicalDesc && (
                      <div>
                        <h4>{vi ? "Mô tả y khoa" : "Medical description"}</h4>
                        <p>{plain(item.medicalDesc)}</p>
                      </div>
                    )}
                    {item.disabilityCriteria && (
                      <div>
                        <h4>
                          {vi ? "Tiêu chí khuyết tật" : "Disability criteria"}
                        </h4>
                        <p>{plain(item.disabilityCriteria)}</p>
                      </div>
                    )}
                  </details>
                )}
                {item.requiresAssistant && (
                  <span className={styles.assistance}>
                    {vi
                      ? "Cần hỗ trợ viên khi thi đấu"
                      : "Assistant required in competition"}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
      {!failed && items.length > 0 && (
        <div className={styles.results} aria-live="polite">
          {vi
            ? `Đang hiển thị ${Math.min(limit, items.length)} / ${items.length} ${tab === "sports" ? "bộ môn" : "hạng thương tật"}`
            : `Showing ${Math.min(limit, items.length)} / ${items.length} results`}
        </div>
      )}
      {!failed && limit < items.length && (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() => setLimit((value) => value + 9)}
        >
          {vi ? "Xem thêm" : "Load more"}
          <ChevronDown size={16} />
        </button>
      )}
    </section>
  );
}
