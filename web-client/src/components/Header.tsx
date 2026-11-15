"use client";

import {
  Activity,
  ArrowRight,
  Bookmark,
  ChevronDown,
  LogOut,
  Menu,
  Mic,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useTranslation";
import { useSettings } from "@/components/SettingsProvider";
import { toast } from "sonner";
import styles from "./header.module.css";

const LOGO = "/assets/brand/vietnam-parasports-2026-full.png";
const DEFAULT_ORDER = [
  "news",
  "about",
  "matches",
  "rankings",
  "creator-lab",
  "clubs",
  "companion",
];
const ROUTES: Record<string, string> = {
  about: "/about",
  sports: "/sports",
  matches: "/matches",
  rankings: "/rankings",
  "creator-lab": "/creator-lab",
  news: "/news",
  clubs: "/clubs",
  companion: "/companion",
};
type Panel = "sports" | "account" | "search" | "mobile" | null;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, language } = useLanguage();
  const { settings } = useSettings();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const sportsButtonRef = useRef<HTMLButtonElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<{ abort: () => void } | null>(null);
  const vi = language === "vi";
  const dark = mounted && resolvedTheme === "dark";
  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const labels: Record<string, string> = {
    about: t("navAbout"),
    sports: t("navSports"),
    matches: t("navMatches"),
    rankings: t("navRankings"),
    "creator-lab": t("navCreatorLab"),
    news: vi ? "Tin tức" : "News",
    clubs: t("navClubs"),
    companion: t("navCompanion"),
  };
  const configuredOrder = Array.isArray(settings.HEADER_MENU_ORDER)
    ? settings.HEADER_MENU_ORDER
    : DEFAULT_ORDER;
  // Keep hidden items out of older saved menu configurations as well.
  const menu = [...new Set(configuredOrder)].filter(
    (id) => id !== "marketplace" && id !== "sports" && ROUTES[id] && settings.HEADER_MENU_VISIBILITY?.[id] !== false
  );
  const newsIndex = menu.indexOf("news");
  if (newsIndex !== -1 && menu.includes("about")) {
    menu.splice(newsIndex, 1);
    menu.splice(menu.indexOf("about"), 0, "news");
  }
  const sports = [
    ["cu-ta", "Cử tạ", "Powerlifting"],
    ["boi-loi", "Bơi lội", "Swimming"],
    ["dien-kinh", "Điền kinh", "Athletics"],
    ["bong-ban", "Bóng bàn", "Table tennis"],
    ["cau-long", "Cầu lông", "Badminton"],
    ["ban-cung", "Bắn cung", "Archery"],
    ["bong-ro-xe-lan", "Bóng rổ xe lăn", "Wheelchair basketball"],
    ["quan-vot-xe-lan", "Quần vợt xe lăn", "Wheelchair tennis"],
    ["co-vua", "Cờ vua", "Chess"],
    ["co-tuong", "Cờ tướng", "Xiangqi"],
    ["judo-khiem-thi", "Judo khiếm thị", "Para judo"],
  ];
  const active = (href: string) => {
    const route = pathname?.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
    return route === href || route.startsWith(`${href}/`);
  };
  const toggle = (next: Exclude<Panel, null>) =>
    setPanel((current) => (current === next ? null : next));

  useEffect(() => {
    setMounted(true);
    return () => recognitionRef.current?.abort();
  }, []);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 12;
      setScrolled((prev) => (prev === scrolled ? prev : scrolled));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setPanel(null);
  }, [pathname]);
  useEffect(() => {
    if (panel === "search") inputRef.current?.focus();
  }, [panel]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setPanel(null);
    };
    const resized = () => setPanel(null);
    const media = window.matchMedia("(min-width: 1280px)");
    document.addEventListener("pointerdown", outside);
    media.addEventListener("change", resized);
    return () => {
      document.removeEventListener("pointerdown", outside);
      media.removeEventListener("change", resized);
    };
  }, []);

  const search = (query: string) => {
    if (!query.trim()) return;
    setPanel(null);
    router.push(`/${language}/search?q=${encodeURIComponent(query.trim())}`);
  };
  const voiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(
        vi
          ? "Trình duyệt chưa hỗ trợ tìm kiếm bằng giọng nói."
          : "Voice search is not supported by this browser."
      );
      return;
    }
    recognitionRef.current?.abort();
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = vi ? "vi-VN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const query = event.results[0][0].transcript;
      setSearchQuery(query);
      search(query);
    };
    recognition.start();
  };

  if (pathname && (pathname.startsWith("/admin") || /^\/[a-z]{2}\/admin/.test(pathname)))
    return null;

  return (
    <header
      ref={rootRef}
      className={styles.header}
      data-scrolled={scrolled}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        setPanel(null);
        const button =
          panel === "search"
            ? searchButtonRef
            : panel === "mobile"
              ? mobileButtonRef
              : panel === "sports"
                ? sportsButtonRef
                : accountButtonRef;
        button.current?.focus();
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))
          setPanel(null);
      }}
    >
      <div className={styles.bar}>
        <Link
          href="/"
          className={styles.logo}
          aria-label={vi ? "Trang chủ Vietnam ParaSports" : "Vietnam ParaSports home"}
          onClick={() => setPanel(null)}
        >
          <img src={LOGO} alt="Vietnam ParaSports 2026" width={159} height={64} />
        </Link>
        <nav className={styles.desktopNav} aria-label={vi ? "Menu chính" : "Main navigation"}>
          {menu.map((id) =>
            id === "sports" ? (
              <div key={id} className={styles.sportsAnchor}>
                <button
                  ref={sportsButtonRef}
                  type="button"
                  className={`${styles.navLink} ${active("/sports") ? styles.active : ""}`}
                  aria-expanded={panel === "sports"}
                  aria-controls="header-sports"
                  onClick={() => toggle("sports")}
                >
                  {labels[id]}
                  <ChevronDown size={13} className={panel === "sports" ? styles.rotated : ""} />
                </button>
                {panel === "sports" && (
                  <div id="header-sports" className={`${styles.popover} ${styles.sportsPanel}`}>
                    <div className={styles.panelIntro}>
                      <span className={styles.eyebrow}>PARASPORTS</span>
                      <p>{vi ? "Tìm bộ môn dành cho bạn." : "Find your way to move."}</p>
                    </div>
                    <nav
                      aria-label={vi ? "Các môn thể thao" : "Sports"}
                      className={styles.sportsGrid}
                    >
                      {sports.map(([slug, vn, en]) => (
                        <Link
                          key={slug}
                          href={`/sports/${slug}`}
                          className={styles.sportLink}
                          onClick={() => setPanel(null)}
                        >
                          <Activity size={15} aria-hidden="true" />
                          {vi ? vn : en}
                          <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      ))}
                    </nav>
                    <Link
                      href="/sports"
                      onClick={() => setPanel(null)}
                      className={styles.panelFooter}
                    >
                      {vi ? "Khám phá tất cả bộ môn" : "Explore all sports"}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={id}
                href={ROUTES[id]}
                aria-current={active(ROUTES[id]) ? "page" : undefined}
                className={`${styles.navLink} ${active(ROUTES[id]) ? styles.active : ""}`}
                onClick={() => setPanel(null)}
              >
                {labels[id]}
              </Link>
            )
          )}
        </nav>
        <div className={styles.actions}>
          <button
            ref={searchButtonRef}
            type="button"
            className={styles.iconButton}
            onClick={() => toggle("search")}
            aria-label={vi ? "Mở tìm kiếm" : "Open search"}
            aria-expanded={panel === "search"}
            aria-controls="header-search"
          >
            <Search size={19} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.themeButton}`}
            disabled={!mounted}
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={
              dark
                ? vi
                  ? "Chuyển sang giao diện sáng"
                  : "Switch to light theme"
                : vi
                  ? "Chuyển sang giao diện tối"
                  : "Switch to dark theme"
            }
            title={vi ? "Đổi giao diện" : "Change theme"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className={styles.divider} aria-hidden="true" />
          {status !== "loading" && user ? (
            <div className={styles.accountAnchor}>
              <button
                ref={accountButtonRef}
                type="button"
                className={styles.accountButton}
                onClick={() => toggle("account")}
                aria-label={`${vi ? "Tài khoản" : "Account"}: ${user.name || "User"}`}
                aria-expanded={panel === "account"}
                aria-controls="header-account"
              >
                <span className={styles.avatar}>
                  <UserIcon size={16} />
                </span>
                <span className={styles.accountName}>
                  {user.name || (vi ? "Tài khoản" : "Account")}
                </span>
                <ChevronDown size={13} />
              </button>
              {panel === "account" && (
                <div id="header-account" className={`${styles.popover} ${styles.accountPanel}`}>
                  <div className={styles.userInfo}>
                    <p>{user.name}</p>
                    <span>{user.email}</span>
                  </div>
                  <div className={styles.accountLinks}>
                    <Link href="/profile" onClick={() => setPanel(null)}>
                      <UserIcon size={16} />
                      {t("btnProfile")}
                    </Link>
                    <Link href="/bookmarks" onClick={() => setPanel(null)}>
                      <Bookmark size={16} />
                      {t("btnBookmarks")}
                    </Link>
                    <Link href="/settings" onClick={() => setPanel(null)}>
                      <Settings size={16} />
                      {t("btnSettings")}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setPanel(null)}>
                        <Shield size={16} />
                        {t("btnAdmin")}
                      </Link>
                    )}
                    <button
                      type="button"
                      className={styles.signOut}
                      onClick={() => {
                        setPanel(null);
                        signOut({ callbackUrl: `/${language}` });
                      }}
                    >
                      <LogOut size={16} />
                      {t("btnSignOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.signIn}>
              {t("btnSignIn")}
              <ArrowRight size={14} className={styles.signInArrow} />
            </Link>
          )}
          <button
            ref={mobileButtonRef}
            type="button"
            className={`${styles.iconButton} ${styles.mobileToggle}`}
            onClick={() => toggle("mobile")}
            aria-label={
              panel === "mobile" ? (vi ? "Đóng menu" : "Close menu") : vi ? "Mở menu" : "Open menu"
            }
            aria-expanded={panel === "mobile"}
            aria-controls="header-mobile"
          >
            {panel === "mobile" ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {panel === "search" && (
        <div id="header-search" className={`${styles.popover} ${styles.searchPanel}`}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              search(searchQuery);
            }}
            role="search"
            aria-label={vi ? "Tìm kiếm trên website" : "Search the website"}
          >
            <label htmlFor="header-search-query" className={styles.searchLabel}>
              {vi ? "Bạn đang tìm điều gì?" : "What are you looking for?"}
            </label>
            <div className={styles.searchField}>
              <Search size={19} aria-hidden="true" />
              <input
                ref={inputRef}
                id="header-search-query"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={voiceSearch}
                className={`${styles.iconButton} ${isListening ? styles.listening : ""}`}
                aria-label={vi ? "Tìm kiếm bằng giọng nói" : "Voice search"}
                aria-pressed={isListening}
              >
                <Mic size={18} />
              </button>
            </div>
            <div className={styles.searchFooter}>
              <span>
                {isListening
                  ? vi
                    ? "Đang nghe…"
                    : "Listening…"
                  : vi
                    ? "Tin tức, bộ môn, câu lạc bộ và nhiều hơn nữa."
                    : "News, sports, clubs and more."}
              </span>
              <button type="submit" className={styles.searchSubmit}>
                {vi ? "Tìm kiếm" : "Search"}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
      {panel === "mobile" && (
        <nav
          id="header-mobile"
          className={`${styles.popover} ${styles.mobilePanel}`}
          aria-label={vi ? "Menu di động" : "Mobile navigation"}
        >
          <div className={styles.panelIntro}>
            <span className={styles.eyebrow}>VIETNAM PARASPORTS</span>
            <p>{vi ? "Cùng nhau, vượt giới hạn." : "Beyond limits, together."}</p>
          </div>
          <div className={styles.mobileLinks}>
            {menu.map((id) =>
              id === "sports" ? (
                <details key={id} className={styles.mobileSports}>
                  <summary>
                    {labels[id]}
                    <ChevronDown size={16} />
                  </summary>
                  <div>
                    {sports.map(([slug, vn, en]) => (
                      <Link key={slug} href={`/sports/${slug}`} onClick={() => setPanel(null)}>
                        {vi ? vn : en}
                      </Link>
                    ))}
                    <Link href="/sports" onClick={() => setPanel(null)}>
                      {vi ? "Tất cả bộ môn" : "All sports"}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </details>
              ) : (
                <Link
                  key={id}
                  href={ROUTES[id]}
                  aria-current={active(ROUTES[id]) ? "page" : undefined}
                  onClick={() => setPanel(null)}
                >
                  {labels[id]}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )
            )}
          </div>
          <div className={styles.mobileFooter}>
            <span>
              {vi ? "Một cộng đồng. Nhiều khả năng." : "One community. Many possibilities."}
            </span>
            <button
              type="button"
              className={styles.iconButton}
              disabled={!mounted}
              onClick={() => setTheme(dark ? "light" : "dark")}
              aria-label={vi ? "Đổi giao diện" : "Change theme"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
