"use client";

import { Link } from "@/i18n/routing";
import { clubSlug, joinClubSports, splitClubSports } from "@/lib/organizations";
import { apiClient } from "@/lib/api-client";
import { getApiUrl } from "@/utils/api";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Filter,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Calendar,
  CheckSquare,
  PhoneCall,
  Compass,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { ConfigProvider, Select, theme as antTheme } from "antd";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useTranslation";
import styles from "./clubs.module.css";
import ClubsHeroBackground from "@/components/clubs/ClubsHeroBackground";

interface Club {
  id: string;
  slug?: string;
  name: string;
  location: string;
  sport: string;
  schedule: string;
  suitableFor: string;
  contactInfo: string;
  description: string;
}

const translations: Record<string, Record<string, string>> = {
  vi: {
    eyebrow: "Cộng đồng thể thao",
    heading: "Câu lạc bộ Thể thao",
    subheading:
      "Tìm kiếm và gia nhập cộng đồng câu lạc bộ thể thao phù hợp trên toàn quốc.",
    btnRegisterClub: "Đăng ký CLB mới",
    filterHeading: "Bộ lọc",
    filterRegion: "Khu vực",
    filterSport: "Môn thể thao",
    allRegions: "Tất cả khu vực",
    allSports: "Tất cả môn thể thao",
    clearFilters: "Xóa bộ lọc",
    searchPlaceholder: "Tìm câu lạc bộ, môn thể thao, địa điểm...",
    searchLabel: "Tìm kiếm",
    noClubsFound: "Không tìm thấy câu lạc bộ nào phù hợp với bộ lọc hiện tại.",
    noClubsHint: "Hãy thử bỏ bớt điều kiện lọc hoặc đăng ký câu lạc bộ mới.",
    resultCount: "câu lạc bộ",
    labelLocation: "Địa điểm:",
    labelSchedule: "Lịch tập:",
    labelSuitable: "Đối tượng:",
    labelContact: "Liên hệ:",
    explore: "Khám phá câu lạc bộ",
    modalTitle: "Đăng Ký Thông Tin CLB Mới",
    successTitle: "Đăng ký thành công!",
    successDesc:
      "Thông tin CLB đã được ghi nhận. Ban quản trị sẽ kiểm duyệt nội dung trước khi hiển thị công khai.",
    errorTitle: "Lỗi gửi dữ liệu",
    formName: "Tên Câu lạc bộ",
    formLocation: "Địa chỉ sinh hoạt",
    formSport: "Các môn thể thao",
    sportHint: "Có thể chọn nhiều bộ môn mà câu lạc bộ đang tổ chức tập luyện.",
    sportRequired: "Vui lòng chọn ít nhất một môn thể thao.",
    formSchedule: "Lịch tập luyện",
    formSuitable: "Đối tượng phù hợp",
    formContact: "Liên hệ / Người phụ trách",
    formDesc: "Mô tả chi tiết CLB & hoạt động",
    placeholderName: "VD: CLB Bắn cung Hà Nội",
    placeholderLocation: "VD: Hà Nội (Miền Bắc)",
    placeholderSport: "VD: Cử tạ, Bơi lội...",
    placeholderSchedule: "VD: Chiều Thứ 2, 4, 6 từ 15h00",
    placeholderSuitable: "VD: Người khuyết tật vận động...",
    placeholderContact: "VD: HLV Nguyễn Văn A - 09xx xxx xxx",
    placeholderDesc:
      "Mô tả cơ sở vật chất, hoạt động chính, các thành tích tiêu biểu (nếu có)...",
    selectSport: "Chọn một hoặc nhiều môn thể thao",
    btnClose: "Đóng lại",
    btnSubmit: "Gửi phê duyệt",
    submitting: "Đang gửi...",
  },
  en: {
    eyebrow: "Sports community",
    heading: "Sports Clubs",
    subheading: "Find and join a suitable sports club community nationwide.",
    btnRegisterClub: "Register New Club",
    filterHeading: "Filters",
    filterRegion: "Region",
    filterSport: "Sport",
    allRegions: "All Regions",
    allSports: "All Sports",
    clearFilters: "Clear Filters",
    searchPlaceholder: "Search clubs, sports, locations...",
    searchLabel: "Search",
    noClubsFound: "No clubs found matching the selected filters.",
    noClubsHint: "Try relaxing your filters, or register a new club.",
    resultCount: "clubs",
    labelLocation: "Location:",
    labelSchedule: "Schedule:",
    labelSuitable: "Suitable For:",
    labelContact: "Contact:",
    explore: "Explore this club",
    modalTitle: "Register New Club Information",
    successTitle: "Registration successful!",
    successDesc:
      "Club information has been recorded. The administration will review it before displaying publicly.",
    errorTitle: "Data submission error",
    formName: "Club Name",
    formLocation: "Activity Location",
    formSport: "Sports",
    sportHint: "Choose all sports offered by your club.",
    sportRequired: "Please select at least one sport.",
    formSchedule: "Training Schedule",
    formSuitable: "Suitable For",
    formContact: "Contact / Person in Charge",
    formDesc: "Detailed description of club & activities",
    placeholderName: "e.g., Hanoi Archery Club",
    placeholderLocation: "e.g., Hanoi (North Region)",
    placeholderSport: "e.g., Powerlifting, Swimming...",
    placeholderSchedule: "e.g., Mon, Wed, Fri from 3:00 PM",
    placeholderSuitable: "e.g., Motor disabled individuals...",
    placeholderContact: "e.g., Coach John Doe - 09xx xxx xxx",
    placeholderDesc:
      "Describe facilities, main activities, outstanding achievements (if any)...",
    selectSport: "Select one or more sports",
    btnClose: "Close",
    btnSubmit: "Submit for Approval",
    submitting: "Submitting...",
  },
};

const ICON_STROKE = 1.7;

export default function ClubsPage() {
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tStr = translations[language] || translations.vi;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    sport: "",
    schedule: "",
    suitableFor: "",
    contactInfo: "",
    description: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");
  const [sportError, setSportError] = useState(false);

  const [sports, setSports] = useState<{ label: string; value: string }[]>([]);

  const fetchSports = async () => {
    try {
      const res = await apiClient.request("/sports");
      if (res.ok) {
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((sp: any) => ({
          label: language === "vi" ? sp.nameVi : sp.nameEn,
          value: sp.nameVi,
        }));
        setSports(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch sports:", err);
    }
  };

  const regions = [
    { label: language === "vi" ? "Miền Bắc" : "North", value: "Bắc" },
    { label: language === "vi" ? "Miền Trung" : "Central", value: "Trung" },
    { label: language === "vi" ? "Miền Nam" : "South", value: "Nam" },
  ];

  // Fetch approved clubs
  const fetchClubs = async () => {
    setLoading(true);
    try {
      let url = getApiUrl("/organizations");
      const params = new URLSearchParams();

      if (selectedSport) params.append("sport", selectedSport);
      if (selectedRegion) params.append("location", selectedRegion);
      if (searchTerm) params.append("search", searchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const envelope = await res.json();
        setClubs(envelope?.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search term so every keystroke does not hit the API.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchSports();
  }, [language]);

  useEffect(() => {
    fetchClubs();
  }, [selectedRegion, selectedSport, searchTerm]);

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitClubSports(formData.sport).length) {
      setSportError(true);
      document.getElementById("clubSport")?.focus();
      return;
    }
    setSportError(false);
    setSubmitLoading(true);
    setSubmitStatus("idle");
    setSubmitError("");

    try {
      const res = await apiClient.request("/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(
          language === "vi"
            ? "Gửi thông tin thất bại. Vui lòng kiểm tra lại."
            : "Submission failed. Please check your data.",
        );
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        location: "",
        sport: "",
        schedule: "",
        suitableFor: "",
        contactInfo: "",
        description: "",
      });
      // Refresh list in case of changes
      fetchClubs();
    } catch (err: any) {
      console.error(err);
      setSubmitStatus("error");
      setSubmitError(
        err.message ||
          (language === "vi" ? "Có lỗi xảy ra." : "An error occurred."),
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const hasFilters = Boolean(selectedRegion || selectedSport || searchTerm);

  const sportOptions = useMemo(
    () => sports.map((s) => ({ label: s.label, value: s.value })),
    [sports],
  );

  const regionOptions = regions.map((r) => ({
    label: r.label,
    value: r.value,
  }));

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.blob} ${styles.blobOne}`} />
        <span className={`${styles.blob} ${styles.blobTwo}`} />
        <span className={`${styles.blob} ${styles.blobThree}`} />
      </div>

      {/* HERO */}
      <section className={styles.hero}>
        <ClubsHeroBackground language={language} />
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {tStr.eyebrow}
            </span>
            <h1 className={styles.heroTitle}>{tStr.heading}</h1>
            <p className={styles.heroSubtitle}>{tStr.subheading}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setSubmitStatus("idle");
              setSportError(false);
            }}
            className={styles.primaryCta}
          >
            <PlusCircle
              size={18}
              strokeWidth={ICON_STROKE}
              aria-hidden="true"
            />
            {tStr.btnRegisterClub}
          </button>
        </div>
      </section>

      {/* BODY: FILTER BAND + GRID */}
      <div className={`${styles.container} ${styles.body}`}>
        <section className={styles.filters} aria-label={tStr.filterHeading}>
          <div className={styles.filtersHead}>
            <span className={styles.filtersTitle}>
              <Filter size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              {tStr.filterHeading}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion("");
                  setSelectedSport("");
                  setSearchInput("");
                }}
                className={styles.clearBtn}
              >
                {tStr.clearFilters}
              </button>
            )}
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.searchField}>
              <label className={styles.fieldLabel} htmlFor="clubSearch">
                {tStr.searchLabel}
              </label>
              <div className={styles.searchWrap}>
                <Search
                  size={16}
                  strokeWidth={ICON_STROKE}
                  className={styles.searchIcon}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  id="clubSearch"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={styles.searchInput}
                  placeholder={tStr.searchPlaceholder}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="filterRegion">
                {tStr.filterRegion}
              </label>
              <ConfigProvider
                theme={{
                  algorithm: isDark
                    ? antTheme.darkAlgorithm
                    : antTheme.defaultAlgorithm,
                  token: {
                    colorPrimary: isDark ? "#f7f4ed" : "#1c1c1c",
                    colorBgElevated: isDark ? "#1b1b18" : "#fcfbf8",
                    colorText: isDark ? "#f7f4ed" : "#1c1c1c",
                    colorTextPlaceholder: isDark ? "#b5b2a9" : "#5f5f5d",
                    colorBorder: isDark ? "#3b3b34" : "#eceae4",
                    borderRadius: 10,
                    fontFamily: "inherit",
                  },
                }}
              >
                <Select
                  id="filterRegion"
                  className={styles.selectWrap}
                  value={selectedRegion || undefined}
                  placeholder={tStr.allRegions}
                  options={regionOptions}
                  onChange={(value) => setSelectedRegion(value ?? "")}
                  allowClear
                  popupMatchSelectWidth
                />
              </ConfigProvider>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="filterSport">
                {tStr.filterSport}
              </label>
              <ConfigProvider
                theme={{
                  algorithm: isDark
                    ? antTheme.darkAlgorithm
                    : antTheme.defaultAlgorithm,
                  token: {
                    colorPrimary: isDark ? "#f7f4ed" : "#1c1c1c",
                    colorBgElevated: isDark ? "#1b1b18" : "#fcfbf8",
                    colorText: isDark ? "#f7f4ed" : "#1c1c1c",
                    colorTextPlaceholder: isDark ? "#b5b2a9" : "#5f5f5d",
                    colorBorder: isDark ? "#3b3b34" : "#eceae4",
                    borderRadius: 10,
                    fontFamily: "inherit",
                  },
                }}
              >
                <Select
                  id="filterSport"
                  className={styles.selectWrap}
                  value={selectedSport || undefined}
                  placeholder={tStr.allSports}
                  options={sportOptions}
                  onChange={(value) => setSelectedSport(value ?? "")}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  popupMatchSelectWidth
                />
              </ConfigProvider>
            </div>
          </div>
        </section>

        <section aria-label="Danh sách câu lạc bộ">
          {!loading && (
            <div className={styles.resultMeta}>
              <span className={styles.resultCount}>
                <strong>{clubs.length}</strong> {tStr.resultCount}
              </span>
            </div>
          )}

          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : clubs.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <Compass
                  size={24}
                  strokeWidth={ICON_STROKE}
                  aria-hidden="true"
                />
              </span>
              <p className={styles.emptyText}>{tStr.noClubsFound}</p>
              <p className={styles.emptyText}>{tStr.noClubsHint}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {clubs.map((club) => (
                <article key={club.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <h2 className={styles.cardTitle}>
                      <Link
                        href={"/clubs/detail/" + clubSlug(club)}
                        className={styles.cardLink}
                      >
                        {club.name}
                      </Link>
                    </h2>
                    {splitClubSports(club.sport).length > 0 && (
                      <span className={styles.sportPills}>
                        {splitClubSports(club.sport).map((clubSport) => (
                          <span key={clubSport} className={styles.sportPill}>
                            {clubSport}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>

                  {club.description && (
                    <p className={styles.cardDesc}>
                      {club.description.replace(/<[^>]*>/g, " ")}
                    </p>
                  )}

                  <ul className={styles.metaList}>
                    {club.location && (
                      <li className={styles.metaItem}>
                        <MapPin
                          size={15}
                          strokeWidth={ICON_STROKE}
                          className={styles.metaIcon}
                          aria-hidden="true"
                        />
                        <span>
                          <span className={styles.metaLabel}>
                            {tStr.labelLocation}
                          </span>{" "}
                          {club.location}
                        </span>
                      </li>
                    )}
                    {club.schedule && (
                      <li className={styles.metaItem}>
                        <Calendar
                          size={15}
                          strokeWidth={ICON_STROKE}
                          className={styles.metaIcon}
                          aria-hidden="true"
                        />
                        <span>
                          <span className={styles.metaLabel}>
                            {tStr.labelSchedule}
                          </span>{" "}
                          {club.schedule}
                        </span>
                      </li>
                    )}
                    {club.suitableFor && (
                      <li className={styles.metaItem}>
                        <CheckSquare
                          size={15}
                          strokeWidth={ICON_STROKE}
                          className={styles.metaIcon}
                          aria-hidden="true"
                        />
                        <span>
                          <span className={styles.metaLabel}>
                            {tStr.labelSuitable}
                          </span>{" "}
                          {club.suitableFor}
                        </span>
                      </li>
                    )}
                    {club.contactInfo && (
                      <li className={styles.metaItem}>
                        <PhoneCall
                          size={15}
                          strokeWidth={ICON_STROKE}
                          className={styles.metaIcon}
                          aria-hidden="true"
                        />
                        <span>
                          <span className={styles.metaLabel}>
                            {tStr.labelContact}
                          </span>{" "}
                          {club.contactInfo}
                        </span>
                      </li>
                    )}
                  </ul>

                  <span className={styles.cardFoot} aria-hidden="true">
                    {tStr.explore}
                    <ArrowUpRight size={14} strokeWidth={ICON_STROKE} />
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="club-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 id="club-modal-title" className={styles.modalTitle}>
                {tStr.modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                aria-label={tStr.btnClose}
              >
                <X size={18} strokeWidth={ICON_STROKE} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {submitStatus === "success" && (
                <div
                  className={`${styles.alert} ${styles.alertSuccess}`}
                  role="status"
                >
                  <CheckCircle2
                    size={18}
                    strokeWidth={ICON_STROKE}
                    className={styles.alertIcon}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles.alertTitle}>{tStr.successTitle}</p>
                    <p className={styles.alertText}>{tStr.successDesc}</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div
                  className={`${styles.alert} ${styles.alertError}`}
                  role="alert"
                >
                  <AlertCircle
                    size={18}
                    strokeWidth={ICON_STROKE}
                    className={styles.alertIcon}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles.alertTitle}>{tStr.errorTitle}</p>
                    <p className={styles.alertText}>{submitError}</p>
                  </div>
                </div>
              )}

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="clubName">
                    {tStr.formName} <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <Users
                      size={16}
                      strokeWidth={ICON_STROKE}
                      className={styles.inputIcon}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      id="clubName"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={styles.input}
                      placeholder={tStr.placeholderName}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="clubLocation">
                    {tStr.formLocation}{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <MapPin
                      size={16}
                      strokeWidth={ICON_STROKE}
                      className={styles.inputIcon}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      id="clubLocation"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className={styles.input}
                      placeholder={tStr.placeholderLocation}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="clubSport">
                    {tStr.formSport} <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.sportSelectField}>
                    <ConfigProvider
                      theme={{
                        algorithm: isDark
                          ? antTheme.darkAlgorithm
                          : antTheme.defaultAlgorithm,
                        token: {
                          colorPrimary: isDark ? "#ef9fb0" : "#7c293b",
                          colorBgContainer: isDark ? "#1b1b18" : "#fcfbf8",
                          colorBgElevated: isDark ? "#1b1b18" : "#fcfbf8",
                          colorText: isDark ? "#f7f4ed" : "#1c1c1c",
                          colorTextPlaceholder: isDark ? "#b5b2a9" : "#5f5f5d",
                          colorBorder: isDark ? "#3b3b34" : "#eceae4",
                          borderRadius: 10,
                          controlHeight: 46,
                          fontFamily: "inherit",
                        },
                      }}
                    >
                      <Select<string[]>
                        id="clubSport"
                        mode="multiple"
                        aria-required="true"
                        aria-invalid={sportError}
                        aria-describedby={
                          sportError
                            ? "club-sport-hint club-sport-error"
                            : "club-sport-hint"
                        }
                        status={sportError ? "error" : undefined}
                        value={splitClubSports(formData.sport)}
                        onChange={(values) => {
                          setFormData((current) => ({
                            ...current,
                            sport: joinClubSports(values),
                          }));
                          setSportError(false);
                        }}
                        options={sportOptions}
                        placeholder={tStr.selectSport}
                        className={styles.sportSelect}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        getPopupContainer={(trigger) => trigger.parentElement!}
                      />
                    </ConfigProvider>
                  </div>
                  <p id="club-sport-hint" className={styles.formHint}>
                    {tStr.sportHint}
                  </p>
                  {sportError && (
                    <p
                      id="club-sport-error"
                      className={styles.formError}
                      role="alert"
                    >
                      {tStr.sportRequired}
                    </p>
                  )}
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="clubSchedule">
                    {tStr.formSchedule}{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <Calendar
                      size={16}
                      strokeWidth={ICON_STROKE}
                      className={styles.inputIcon}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      id="clubSchedule"
                      required
                      value={formData.schedule}
                      onChange={(e) =>
                        setFormData({ ...formData, schedule: e.target.value })
                      }
                      className={styles.input}
                      placeholder={tStr.placeholderSchedule}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="clubSuitable">
                    {tStr.formSuitable}{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <CheckSquare
                      size={16}
                      strokeWidth={ICON_STROKE}
                      className={styles.inputIcon}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      id="clubSuitable"
                      required
                      value={formData.suitableFor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          suitableFor: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder={tStr.placeholderSuitable}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel} htmlFor="clubContact">
                    {tStr.formContact}{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <PhoneCall
                      size={16}
                      strokeWidth={ICON_STROKE}
                      className={styles.inputIcon}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      id="clubContact"
                      required
                      value={formData.contactInfo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder={tStr.placeholderContact}
                    />
                  </div>
                </div>

                <div className={`${styles.formField} ${styles.formFieldFull}`}>
                  <label className={styles.formLabel} htmlFor="clubDesc">
                    {tStr.formDesc} <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="clubDesc"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder={tStr.placeholderDesc}
                  />
                </div>
              </div>

              <div className={styles.modalFoot}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.ghostCta}
                >
                  {tStr.btnClose}
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={styles.primaryCta}
                >
                  {submitLoading ? tStr.submitting : tStr.btnSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
