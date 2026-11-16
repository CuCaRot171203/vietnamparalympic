"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { ConfigProvider, Select, theme } from "antd";
import { Link } from "@/i18n/routing";
import {
  clubSlug,
  splitClubSports,
  type Organization,
} from "@/lib/organizations";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import styles from "./clubs-directory.module.css";
import { clubCover } from "@/lib/club-presentation";

type Club = Pick<
  Organization,
  | "id"
  | "slug"
  | "name"
  | "location"
  | "sport"
  | "schedule"
  | "imageUrl"
  | "details"
>;
export type ClubSort = "latest" | "name" | "nearby";
function ClubPhoto({ club, vi }: { club: Club; vi: boolean }) {
  const [failed, setFailed] = useState(false);
  const source = clubCover(club);
  useEffect(() => setFailed(false), [source]);
  return (
    <Image
      src={failed ? "/CLUB/CLUB_02.jpg" : source}
      alt={vi ? `Hình ảnh ${club.name}` : club.name}
      fill
      sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
export function ClubSummaryCard({ club, vi }: { club: Club; vi: boolean }) {
  return (
    <article className={styles.card}>
      <Link
        href={`/clubs/detail/${clubSlug(club)}`}
        className={styles.cardLink}
      >
        <div className={styles.photo}>
          <ClubPhoto club={club} vi={vi} />
          {splitClubSports(club.sport).length > 0 && (
            <span className={styles.sports}>
              {splitClubSports(club.sport).map((sport) => (
                <span key={sport}>{sport}</span>
              ))}
            </span>
          )}
        </div>
        <div className={styles.cardBody}>
          <h3>{club.name}</h3>
          <div className={styles.meta}>
            <p>
              <MapPin size={15} aria-hidden="true" />
              <span>
                {club.location ||
                  (vi ? "Đang cập nhật địa điểm" : "Location coming soon")}
              </span>
            </p>
            <p>
              <CalendarDays size={15} aria-hidden="true" />
              <span>
                {club.schedule ||
                  (vi
                    ? "Liên hệ để biết lịch tập"
                    : "Contact for training times")}
              </span>
            </p>
          </div>
          <div className={styles.cardFoot}>
            <span>{vi ? "Xem chi tiết" : "View details"}</span>
            <span className={styles.arrow}>
              <ArrowUpRight size={15} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
export default function ClubsDirectory({
  clubs,
  loading,
  error,
  language,
  dark,
  sort,
  locating,
  onSort,
  onRegister,
  onRetry,
}: {
  clubs: Club[];
  loading: boolean;
  error: string;
  language: string;
  dark: boolean;
  sort: ClubSort;
  locating: boolean;
  onSort: (sort: ClubSort) => void;
  onRegister: () => void;
  onRetry: () => void;
}) {
  const vi = language === "vi";
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => setVisibleCount(6), [clubs, sort]);
  const visible = clubs.slice(0, visibleCount);
  return (
    <div
      className={`${styles.directory} ${homeBeVietnam.variable} ${homeNeusharp.variable}`}
    >
      <section
        id="clubs-results"
        className={styles.results}
        aria-labelledby="clubs-results-heading"
        aria-busy={loading}
      >
        <div className={styles.toolbar}>
          <h2 id="clubs-results-heading" aria-live="polite">
            {loading
              ? vi
                ? "Đang tìm câu lạc bộ..."
                : "Finding clubs..."
              : `${clubs.length} ${vi ? "câu lạc bộ" : "clubs"}`}
          </h2>
          <ConfigProvider
            theme={{
              algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
              token: { colorPrimary: "#df1021", fontFamily: "inherit" },
            }}
          >
            <div className={styles.sort}>
              <label htmlFor="club-sort">{vi ? "Sắp xếp:" : "Sort:"}</label>
              <Select
                id="club-sort"
                aria-label={vi ? "Sắp xếp câu lạc bộ" : "Sort clubs"}
                value={sort}
                onChange={onSort}
                variant="borderless"
                disabled={locating}
                options={[
                  { label: vi ? "Mới nhất" : "Newest", value: "latest" },
                  { label: vi ? "Tên A–Z" : "Name A–Z", value: "name" },
                  {
                    label: vi ? "Gần bạn nhất" : "Nearest to you",
                    value: "nearby",
                  },
                ]}
              />
            </div>
          </ConfigProvider>
        </div>
        {error ? (
          <div className={styles.empty} role="alert">
            <p>{error}</p>
            <button onClick={onRetry} type="button">
              {vi ? "Thử lại" : "Try again"}
            </button>
          </div>
        ) : loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className={styles.skeleton} aria-hidden="true" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className={styles.empty}>
            <h3>
              {vi
                ? "Chưa tìm thấy câu lạc bộ phù hợp"
                : "No matching clubs found"}
            </h3>
            <p>
              {vi
                ? "Thử thay đổi bộ môn, khu vực hoặc từ khóa tìm kiếm của bạn."
                : "Try another sport, region or search term."}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {visible.map((club) => (
                <ClubSummaryCard key={club.id} club={club} vi={vi} />
              ))}
            </div>
            <p className={styles.count} aria-live="polite">
              {vi
                ? `Đang hiển thị ${visible.length} / ${clubs.length} câu lạc bộ`
                : `Showing ${visible.length} / ${clubs.length} clubs`}
            </p>
            {visibleCount < clubs.length && (
              <button
                type="button"
                className={styles.more}
                onClick={() => setVisibleCount((count) => count + 6)}
              >
                {vi ? "Xem thêm câu lạc bộ" : "Show more clubs"}
                <ChevronDown size={18} aria-hidden="true" />
              </button>
            )}
          </>
        )}
      </section>
      <section
        className={styles.invite}
        aria-labelledby="club-register-heading"
      >
        <div>
          <span className={styles.badge}>
            <i aria-hidden="true" />
            {vi ? "Dành cho CLB" : "For clubs"}
          </span>
          <h2 id="club-register-heading">
            {vi
              ? "BẠN ĐANG QUẢN LÝ MỘT CÂU LẠC BỘ?"
              : "DO YOU MANAGE A SPORTS CLUB?"}
          </h2>
          <p>
            {vi
              ? "Đăng ký để CLB được giới thiệu tới cộng đồng thể thao người khuyết tật trên toàn quốc."
              : "Register your club to connect with the inclusive sports community nationwide."}
          </p>
        </div>
        <button type="button" onClick={onRegister}>
          {vi ? "Đăng ký CLB mới" : "Register a club"}
          <span>
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </button>
      </section>
    </div>
  );
}
