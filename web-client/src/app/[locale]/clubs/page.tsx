"use client";

import { joinClubSports, splitClubSports } from "@/lib/organizations";
import { apiClient } from "@/lib/api-client";
import { getApiUrl } from "@/utils/api";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Calendar,
  CheckSquare,
  PhoneCall,
} from "lucide-react";
import { ConfigProvider, Select, theme as antTheme } from "antd";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useTranslation";
import styles from "./clubs.module.css";
import ClubsPageHero from "@/components/clubs/ClubsPageHero";
import ClubsDirectory, {
  type ClubSort,
} from "@/components/clubs/ClubsDirectory";

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
  imageUrl?: string | null;
  details?: import("@/lib/organizations").Organization["details"];
  lat?: number | null;
  lng?: number | null;
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
  const [fetchError, setFetchError] = useState("");
  const [sort, setSort] = useState<ClubSort>("latest");

  // Filters
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [nearPosition, setNearPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const locationRequest = useRef(0);
  const [locationMessage, setLocationMessage] = useState("");

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
    { label: language === "vi" ? "Miền Bắc" : "North", value: "Miền Bắc" },
    {
      label: language === "vi" ? "Miền Trung" : "Central",
      value: "Miền Trung",
    },
    { label: language === "vi" ? "Miền Nam" : "South", value: "Miền Nam" },
  ];

  // Fetch approved clubs
  const fetchClubs = async (signal?: AbortSignal) => {
    setLoading(true);
    setFetchError("");
    try {
      let url = getApiUrl("/organizations");
      const params = new URLSearchParams();

      if (selectedSport) params.append("sport", selectedSport);
      if (selectedRegion) params.append("location", selectedRegion);
      if (searchTerm) params.append("search", searchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error("Failed to load clubs");
      if (!signal?.aborted) {
        const envelope = await res.json();
        setClubs(Array.isArray(envelope?.data) ? envelope.data : []);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error("Failed to fetch clubs:", error);
        setFetchError(
          language === "vi"
            ? "Chưa tải được danh sách câu lạc bộ. Vui lòng thử lại."
            : "Unable to load clubs. Please try again.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
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
    const controller = new AbortController();
    fetchClubs(controller.signal);
    return () => controller.abort();
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

  const resetFilters = () => {
    locationRequest.current += 1;
    setLocating(false);
    setSelectedRegion("");
    setSelectedSport("");
    setSearchInput("");
    setSearchTerm("");
    setNearPosition(null);
    setSort("latest");
    setLocationMessage("");
  };
  const findNearby = () => {
    if (nearPosition && sort === "nearby") {
      setSort("latest");
      setNearPosition(null);
      setLocationMessage("");
      return;
    }
    if (nearPosition) {
      setSort("nearby");
      return;
    }
    if (!navigator.geolocation) {
      setLocationMessage(
        language === "vi"
          ? "Trình duyệt chưa hỗ trợ vị trí. Bạn có thể chọn khu vực để tìm câu lạc bộ."
          : "Location is unavailable. Please choose a region instead.",
      );
      return;
    }
    setLocating(true);
    const request = ++locationRequest.current;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setSort("nearby");
        setNearPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationMessage(
          language === "vi"
            ? "CLB có tọa độ được sắp xếp từ gần đến xa; CLB chưa cập nhật tọa độ hiển thị phía sau."
            : "Clubs with coordinates are sorted by distance; those without coordinates appear afterwards.",
        );
      },
      () => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setLocationMessage(
          language === "vi"
            ? "Chưa lấy được vị trí. Vui lòng cho phép truy cập vị trí hoặc chọn khu vực để tìm câu lạc bộ."
            : "Unable to get your location. Allow location access or choose a region instead.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };
  const displayedClubs = useMemo(() => {
    if (sort === "name")
      return [...clubs].sort((a, b) =>
        a.name.localeCompare(b.name, language === "vi" ? "vi" : "en"),
      );
    if (!nearPosition || sort !== "nearby") return clubs;
    const radians = (value: number) => (value * Math.PI) / 180;
    const distance = (club: Club) => {
      if (
        typeof club.lat !== "number" ||
        typeof club.lng !== "number" ||
        !Number.isFinite(club.lat) ||
        !Number.isFinite(club.lng)
      )
        return Infinity;
      const deltaLat = radians(club.lat - nearPosition.lat);
      const deltaLng = radians(club.lng - nearPosition.lng);
      const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(radians(nearPosition.lat)) *
          Math.cos(radians(club.lat)) *
          Math.sin(deltaLng / 2) ** 2;
      return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
    };
    return [...clubs].sort((a, b) => distance(a) - distance(b));
  }, [clubs, nearPosition, sort, language]);

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
      <ClubsPageHero
        language={language}
        dark={isDark}
        region={selectedRegion}
        sport={selectedSport}
        search={searchInput}
        regions={regionOptions}
        sports={sportOptions}
        near={Boolean(nearPosition) && sort === "nearby"}
        locating={locating}
        locationMessage={locationMessage}
        onRegion={setSelectedRegion}
        onSport={setSelectedSport}
        onSearch={setSearchInput}
        onSubmit={() => {
          setSearchTerm(searchInput.trim());
          document.getElementById("clubs-results")?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
            block: "start",
          });
        }}
        onReset={resetFilters}
        onNearby={findNearby}
        onRegister={() => {
          setIsModalOpen(true);
          setSubmitStatus("idle");
          setSportError(false);
        }}
      />
      <ClubsDirectory
        clubs={displayedClubs}
        loading={loading}
        error={fetchError}
        language={language}
        dark={isDark}
        sort={sort}
        locating={locating}
        onSort={(value) => {
          if (value === "nearby") {
            if (sort !== "nearby") findNearby();
          } else {
            setSort(value);
            setLocationMessage("");
          }
        }}
        onRetry={() => {
          fetchClubs();
        }}
        onRegister={() => {
          setIsModalOpen(true);
          setSubmitStatus("idle");
          setSportError(false);
        }}
      />

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
