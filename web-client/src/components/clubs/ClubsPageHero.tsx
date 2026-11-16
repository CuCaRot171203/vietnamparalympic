"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  LocateFixed,
} from "lucide-react";
import { ConfigProvider, Modal, Select, theme } from "antd";
import { Link } from "@/i18n/routing";
import { homeBeVietnam } from "@/lib/home-fonts";
import styles from "./clubs-page-hero.module.css";

const calvera = localFont({
  src: "../../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-clubs-calvera",
});
type Option = { label: string; value: string };
type Props = {
  language: string;
  dark: boolean;
  region: string;
  sport: string;
  search: string;
  regions: Option[];
  sports: Option[];
  near: boolean;
  locating: boolean;
  locationMessage: string;
  onRegion: (value: string) => void;
  onSport: (value: string) => void;
  onSearch: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onNearby: () => void;
  onRegister: () => void;
};

export default function ClubsPageHero(props: Props) {
  const { language, dark, region, sport, search, regions, sports } = props;
  const vi = language === "vi";
  const [guideOpen, setGuideOpen] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") setKeyboardFocus(true);
    };
    const onPointer = () => setKeyboardFocus(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);
  const filtered = Boolean(region || sport || search || props.near);
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#e10e20",
          fontFamily: "var(--font-be-vietnam-pro), sans-serif",
          borderRadius: 16,
        },
      }}
    >
      <section
        className={`${styles.hero} ${calvera.variable} ${homeBeVietnam.variable}`}
        aria-labelledby="clubs-page-heading"
        data-keyboard-focus={keyboardFocus}
      >
        <div className={styles.background} aria-hidden="true" />
        <div className={styles.container}>
          <nav
            className={styles.breadcrumb}
            aria-label={vi ? "Đường dẫn" : "Breadcrumb"}
          >
            <Link href="/">{vi ? "Trang chủ" : "Home"}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{vi ? "Câu lạc bộ" : "Clubs"}</span>
          </nav>
          <div className={styles.intro}>
            <div className={styles.copy}>
              <h1 id="clubs-page-heading">
                {vi ? (
                  <>
                    <span>CÂU LẠC BỘ</span>
                    <span>THỂ THAO</span>
                  </>
                ) : (
                  <>
                    <span>SPORTS</span>
                    <span>CLUBS</span>
                  </>
                )}
              </h1>
              <p>
                {vi
                  ? "Tìm kiếm và gia nhập cộng đồng câu lạc bộ thể thao phù hợp trên toàn quốc."
                  : "Find and join a suitable sports club community nationwide."}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.register}
                  onClick={props.onRegister}
                >
                  {vi ? "Đăng ký CLB mới" : "Register a club"}
                  <span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.guide}
                  onClick={() => setGuideOpen(true)}
                >
                  {vi ? "Cách tham gia" : "How to join"}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className={styles.collage}>
              <div className={styles.mainPhoto}>
                <Image
                  src="/CLUB/CLUB_02.jpg"
                  alt={
                    vi
                      ? "Cộng đồng câu lạc bộ thể thao người khuyết tật"
                      : "An inclusive sports club community"
                  }
                  fill
                  priority
                  sizes="(max-width:767px) 60vw, 30vw"
                />
              </div>
              <div className={styles.smallPhotos}>
                <div>
                  <Image
                    src="/back_subjects/ba_mon_phoi_hop.jpg"
                    alt={
                      vi
                        ? "Vận động viên thi đấu thể thao"
                        : "Athletes competing"
                    }
                    fill
                    sizes="(max-width:767px) 30vw, 17vw"
                  />
                </div>
                <div>
                  <Image
                    src="/uploads/1781644852147-pcy2n1.jpg"
                    alt={
                      vi
                        ? "Vận động viên Việt Nam tại giải vô địch cờ vua"
                        : "Vietnamese athletes at a chess championship"
                    }
                    fill
                    sizes="(max-width:767px) 30vw, 17vw"
                  />
                </div>
              </div>
            </div>
          </div>
          <form
            className={styles.filters}
            role="search"
            aria-label={vi ? "Tìm câu lạc bộ" : "Find a club"}
            onSubmit={(event) => {
              event.preventDefault();
              props.onSubmit();
            }}
          >
            <div className={styles.field}>
              <label htmlFor="filterRegion">{vi ? "Khu vực" : "Region"}</label>
              <Select
                id="filterRegion"
                value={region || undefined}
                placeholder={vi ? "Tất cả khu vực" : "All regions"}
                options={regions}
                onChange={(value) => props.onRegion(value ?? "")}
                allowClear
                variant="borderless"
                className={styles.select}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="filterSport">
                {vi ? "Môn thể thao" : "Sport"}
              </label>
              <Select
                id="filterSport"
                value={sport || undefined}
                placeholder={vi ? "Tất cả môn" : "All sports"}
                options={sports}
                onChange={(value) => props.onSport(value ?? "")}
                showSearch
                optionFilterProp="label"
                allowClear
                variant="borderless"
                className={styles.select}
              />
            </div>
            <div className={`${styles.field} ${styles.searchField}`}>
              <label htmlFor="clubSearch">
                {vi ? "Tìm theo tên" : "Search by name"}
              </label>
              <input
                id="clubSearch"
                type="search"
                value={search}
                onChange={(event) => props.onSearch(event.target.value)}
                placeholder={
                  vi ? "Tên câu lạc bộ, địa điểm..." : "Club name, location..."
                }
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className={styles.submit}
              aria-label={vi ? "Tìm câu lạc bộ" : "Search clubs"}
            >
              <ArrowUpRight size={23} aria-hidden="true" />
            </button>
          </form>
          <div
            className={styles.quickFilters}
            aria-label={vi ? "Lọc nhanh" : "Quick filters"}
          >
            <button
              type="button"
              aria-pressed={!filtered}
              onClick={props.onReset}
            >
              {vi ? "Tất cả" : "All"}
            </button>
            <button
              type="button"
              aria-pressed={props.near}
              disabled={props.locating}
              onClick={props.onNearby}
            >
              <LocateFixed size={13} aria-hidden="true" />
              {props.locating
                ? vi
                  ? "Đang tìm vị trí..."
                  : "Locating..."
                : vi
                  ? "Gần bạn"
                  : "Near you"}
            </button>
            {filtered && (
              <button
                type="button"
                className={styles.clear}
                onClick={props.onReset}
              >
                {vi ? "Xóa bộ lọc" : "Clear filters"}
              </button>
            )}
          </div>
          <p className={styles.locationMessage} role="status">
            {props.locationMessage}
          </p>
        </div>
      </section>
      <Modal
        title={vi ? "Cách tham gia câu lạc bộ" : "How to join a club"}
        open={guideOpen}
        onCancel={() => setGuideOpen(false)}
        footer={null}
      >
        <ol className={styles.steps}>
          <li>
            {vi
              ? "Chọn khu vực, bộ môn hoặc tìm theo tên để khám phá câu lạc bộ phù hợp."
              : "Choose a region, sport or club name to find a suitable club."}
          </li>
          <li>
            {vi
              ? "Mở “Xem chi tiết” để tìm hiểu địa điểm, lịch tập và đối tượng tham gia."
              : "Open a club’s details to explore its location, schedule and participants."}
          </li>
          <li>
            {vi
              ? "Liên hệ người phụ trách theo thông tin của câu lạc bộ để trao đổi cách tham gia và đăng ký tập luyện."
              : "Contact the club coordinator using the listed contact details to discuss joining and training."}
          </li>
        </ol>
      </Modal>
    </ConfigProvider>
  );
}
