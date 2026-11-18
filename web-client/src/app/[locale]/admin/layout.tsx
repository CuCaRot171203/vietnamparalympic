"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Avatar,
  ConfigProvider,
  Drawer,
  Dropdown,
  Menu,
  Tooltip,
  theme,
} from "antd";
import viVN from "antd/locale/vi_VN";
import enUS from "antd/locale/en_US";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Globe,
  Handshake,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Trophy,
  Users,
  Wand2,
  Wallet,
  Link as LinkIcon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useTranslation";
import { useSettings } from "@/components/SettingsProvider";
import { AdminUiContext } from "@/components/admin/AdminUiContext";
import "./admin-design.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const vi = language === "vi";
  const dark = mounted && resolvedTheme === "dark";
  const route = pathname?.replace(/^\/(vi|en)(?=\/|$)/, "") || "/admin";
  const links = [
    { path: "/admin", vi: "Tổng quan", en: "Overview", icon: LayoutDashboard },
    { path: "/admin/users", vi: "Người dùng", en: "Users", icon: Users },
    { path: "/admin/posts", vi: "Tin tức", en: "News", icon: FileText },
    {
      path: "/admin/creator-lab",
      vi: "Creator Lab",
      en: "Creator Lab",
      icon: Wand2,
    },
    {
      path: "/admin/organizations",
      vi: "Câu lạc bộ",
      en: "Clubs",
      icon: Building2,
    },
    { path: "/admin/teams", vi: "Đội tuyển", en: "Teams", icon: Users },
    {
      path: "/admin/companion",
      vi: "Yêu cầu đồng hành",
      en: "Companion requests",
      icon: Heart,
    },
    {
      path: "/admin/partners",
      vi: "Đối tác & tài trợ",
      en: "Partners & sponsors",
      icon: Handshake,
    },
    { path: "/admin/sports", vi: "Bộ môn", en: "Sports", icon: Trophy },
    {
      path: "/admin/tournaments",
      vi: "Giải đấu",
      en: "Tournaments",
      icon: Trophy,
    },
    {
      path: "/admin/rankings",
      vi: "Bảng xếp hạng",
      en: "Rankings",
      icon: BarChart3,
    },
    { path: "/admin/events", vi: "Sự kiện", en: "Events", icon: CalendarDays },
    {
      path: "/admin/audit-logs",
      vi: "Nhật ký hệ thống",
      en: "Audit logs",
      icon: ShieldCheck,
    },
    {
      path: "/admin/commissions",
      vi: "Hoa hồng",
      en: "Commissions",
      icon: Wallet,
    },
    {
      path: "/admin/affiliates",
      vi: "Affiliate",
      en: "Affiliates",
      icon: LinkIcon,
    },
    {
      path: "/admin/assistants",
      vi: "Người hỗ trợ",
      en: "Assistants",
      icon: Handshake,
    },
    {
      path: "/admin/marketplace",
      vi: "Chợ thể thao",
      en: "Marketplace",
      icon: ShoppingBag,
    },
    {
      path: "/admin/settings",
      vi: "Cài đặt hệ thống",
      en: "Settings",
      icon: Settings,
    },
  ];
  const current =
    [...links]
      .sort((a, b) => b.path.length - a.path.length)
      .find(
        (link) =>
          route === link.path ||
          (link.path !== "/admin" && route.startsWith(`${link.path}/`)),
      ) || links[0];
  const order = settings.ADMIN_SIDEBAR_ORDER || [];
  const visible = [...links]
    .sort((a, b) => {
      const ai = order.indexOf(a.path),
        bi = order.indexOf(b.path);
      return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi) || 0;
    })
    .filter((link) => settings.ADMIN_SIDEBAR_VISIBILITY?.[link.path] !== false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  const brand = (compact = false) => (
    <Link
      href={`/${language}/admin`}
      className={`admin-brand ${compact ? "is-compact" : ""}`}
      aria-label="Vietnam ParaSports Admin"
    >
      <span className="admin-brand-image">
        <img
          src={
            compact
              ? "/assets/brand/vietnam-parasports-2026-mark.png"
              : settings.logoPath ||
                "/assets/brand/vietnam-parasports-2026-full.png"
          }
          alt="Vietnam ParaSports"
        />
      </span>
      {!compact && (
        <span className="admin-brand-label">
          Workspace <span>ADMIN</span>
        </span>
      )}
    </Link>
  );
  const navigation = (compact = false) => (
    <Menu
      className="admin-menu"
      mode="inline"
      inlineCollapsed={compact}
      selectedKeys={[current.path]}
      onClick={() => setMobileOpen(false)}
      items={visible.map((link) => ({
        key: link.path,
        icon: <link.icon size={18} strokeWidth={1.65} />,
        label: (
          <Link href={`/${language}${link.path}`}>
            {vi ? link.vi : link.en}
          </Link>
        ),
        title: vi ? link.vi : link.en,
      }))}
    />
  );
  const accountItems = [
    {
      key: "profile",
      icon: <Users size={16} />,
      label: (
        <Link href={`/${language}/profile`}>
          {vi ? "Hồ sơ cá nhân" : "My profile"}
        </Link>
      ),
    },
    {
      key: "home",
      icon: <Home size={16} />,
      label: (
        <Link href={`/${language}`}>
          {vi ? "Về trang công khai" : "View public site"}
        </Link>
      ),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      danger: true,
      label: vi ? "Đăng xuất" : "Sign out",
      onClick: () => signOut({ callbackUrl: `/${language}/login` }),
    },
  ];
  return (
    <ConfigProvider
      locale={vi ? viVN : enUS}
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: dark ? "#ef9fb0" : "#7c293b",
          colorInfo: dark ? "#ef9fb0" : "#7c293b",
          colorBgLayout: dark ? "#151512" : "#f7f4ed",
          colorBgContainer: dark ? "#1d1d19" : "#fcfbf8",
          colorBgElevated: dark ? "#25251f" : "#fcfbf8",
          colorText: dark ? "#f7f4ed" : "#1c1c1c",
          colorTextSecondary: dark ? "#aaa99e" : "#6b6a62",
          colorBorder: dark ? "#3d3d34" : "#dfddd4",
          colorBorderSecondary: dark ? "#303029" : "#eeece4",
          borderRadius: 8,
          controlHeight: 40,
          fontSize: 13,
          fontFamily: "inherit",
          boxShadowSecondary: dark
            ? "0 12px 40px #0005"
            : "0 12px 40px #1c1c1c12",
        },
        components: {
          Menu: {
            itemHeight: 42,
            itemMarginInline: 10,
            itemBorderRadius: 8,
            itemSelectedBg: dark ? "#38262c" : "#f1e6e8",
            itemSelectedColor: dark ? "#ef9fb0" : "#7c293b",
            itemBg: "transparent",
            activeBarWidth: 0,
            collapsedWidth: 76,
          },
          Table: {
            headerBg: dark ? "#25251f" : "#f3f0e8",
            headerColor: dark ? "#aaa99e" : "#6b6a62",
            rowHoverBg: dark ? "#26261f" : "#f7f4ed",
            cellPaddingBlock: 17,
            cellPaddingInline: 18,
            fontSize: 13,
          },
          Button: {
            fontWeight: 500,
            primaryShadow: "inset 0 .5px 0 #ffffff26",
            defaultShadow: "none",
          },
          Drawer: { footerPaddingBlock: 16, footerPaddingInline: 24 },
        },
      }}
    >
      <AdminUiContext.Provider value={true}>
        <div
          className={`admin-workspace ${collapsed ? "sidebar-collapsed" : ""}`}
        >
          <aside
            className="admin-sidebar"
            aria-label={vi ? "Menu quản trị" : "Admin navigation"}
          >
            {brand(collapsed)}
            <span className="admin-nav-label">
              {collapsed
                ? "•••"
                : vi
                  ? "QUẢN LÝ NỀN TẢNG"
                  : "PLATFORM MANAGEMENT"}
            </span>
            <nav className="admin-nav-scroll">{navigation(collapsed)}</nav>
            <div className="admin-sidebar-footer">
              <Tooltip
                title={vi ? "Về trang công khai" : "View public site"}
                placement="right"
              >
                <Link href={`/${language}`}>
                  <Home size={17} />
                  {!collapsed && (
                    <>
                      <span>{vi ? "Trang công khai" : "Public site"}</span>
                      <ArrowUpRight size={15} />
                    </>
                  )}
                </Link>
              </Tooltip>
            </div>
          </aside>
          <div className="admin-main-area">
            <header className="admin-topbar">
              <div className="admin-topbar-leading">
                <button
                  className="admin-icon-button admin-desktop-toggle"
                  onClick={() => setCollapsed((value) => !value)}
                  aria-label={
                    collapsed
                      ? vi
                        ? "Mở rộng menu"
                        : "Expand navigation"
                      : vi
                        ? "Thu gọn menu"
                        : "Collapse navigation"
                  }
                >
                  {collapsed ? (
                    <PanelLeftOpen size={18} />
                  ) : (
                    <PanelLeftClose size={18} />
                  )}
                </button>
                <button
                  className="admin-icon-button admin-mobile-toggle"
                  onClick={() => setMobileOpen(true)}
                  aria-label={vi ? "Mở menu quản trị" : "Open admin navigation"}
                >
                  <MenuIcon size={20} />
                </button>
                <div className="admin-page-context">
                  <span>{vi ? "Không gian quản trị" : "Admin workspace"}</span>
                  <strong>{vi ? current.vi : current.en}</strong>
                </div>
              </div>
              <div className="admin-topbar-actions">
                <Tooltip title={vi ? "Đổi ngôn ngữ" : "Switch language"}>
                  <button
                    className="admin-icon-button admin-language"
                    onClick={() => setLanguage(vi ? "en" : "vi")}
                    aria-label={
                      vi ? "Chuyển sang tiếng Anh" : "Switch to Vietnamese"
                    }
                  >
                    <Globe size={16} />
                    <span>{vi ? "VI" : "EN"}</span>
                  </button>
                </Tooltip>
                <Tooltip
                  title={
                    dark
                      ? vi
                        ? "Giao diện sáng"
                        : "Light theme"
                      : vi
                        ? "Giao diện tối"
                        : "Dark theme"
                  }
                >
                  <button
                    className="admin-icon-button"
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
                  >
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </Tooltip>
                <div className="admin-account-divider" />
                <Dropdown
                  menu={{ items: accountItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button
                    className="admin-account"
                    aria-label={
                      vi ? "Menu tài khoản quản trị" : "Admin account menu"
                    }
                  >
                    <Avatar size={34} src={session?.user?.image}>
                      {session?.user?.name?.charAt(0) || "A"}
                    </Avatar>
                    <span>
                      <strong>
                        {session?.user?.name ||
                          (vi ? "Quản trị viên" : "Administrator")}
                      </strong>
                      <small>{vi ? "Quản trị viên" : "Administrator"}</small>
                    </span>
                    <ChevronDown size={13} />
                  </button>
                </Dropdown>
              </div>
            </header>
            <main className="admin-content">
              <div className="admin-route-breadcrumb">
                <Link href={`/${language}/admin`}>Admin</Link>
                <span>/</span>
                <span>{vi ? current.vi : current.en}</span>
              </div>
              {children}
            </main>
            <footer className="admin-workspace-footer">
              <span>Vietnam ParaSports</span>
              <span>
                {vi
                  ? "Kết nối cộng đồng. Đồng hành phát triển."
                  : "Connecting communities. Growing together."}
              </span>
            </footer>
          </div>
        </div>
        <Drawer
          className="admin-mobile-navigation"
          title={brand()}
          placement="left"
          size={288}
          styles={{
            wrapper: { maxWidth: "calc(100vw - 24px)" },
            body: { padding: "8px 0" },
          }}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        >
          {navigation()}
        </Drawer>
      </AdminUiContext.Provider>
    </ConfigProvider>
  );
}
