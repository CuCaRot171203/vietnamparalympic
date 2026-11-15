"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Alert, Empty, Result, Skeleton } from "antd";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  FileText,
  Heart,
  MessageSquare,
  Scissors,
  Users,
  Video,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLanguage } from "@/hooks/useTranslation";

const AdminCharts = dynamic(() => import("@/components/admin/AdminCharts"), {
  ssr: false,
  loading: () => (
    <>
      <Skeleton active />
      <Skeleton active />
    </>
  ),
});
type Stats = {
  users: number;
  posts: number;
  courses: number;
  comments: number;
  documents: number;
  capcutTemplates: number;
};
type ChartPoint = {
  name: string;
  users?: number;
  posts?: number;
  likes?: number;
  comments?: number;
};
type Audit = {
  id: string;
  action: string;
  createdAt: string;
  user?: { fullName?: string };
};
export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { language } = useLanguage();
  const vi = language === "vi";
  const role = (session?.user as { role?: string } | undefined)?.role;
  const authorized = role === "ADMIN" || role === "SUPER_ADMIN";
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const loginPath = `/${locale}/login?callbackUrl=${encodeURIComponent(`/${locale}/admin`)}`;
  const [stats, setStats] = useState<Stats | null>(null);
  const [growth, setGrowth] = useState<ChartPoint[]>([]);
  const [interactions, setInteractions] = useState<ChartPoint[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditsLoading, setAuditsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [auditsError, setAuditsError] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (status !== "loading") {
      setSessionTimeout(false);
      return;
    }
    const timer = setTimeout(() => setSessionTimeout(true), 8000);
    return () => clearTimeout(timer);
  }, [status]);
  useEffect(() => {
    if (status === "unauthenticated") router.replace(loginPath);
    else if (status === "authenticated" && !authorized)
      router.replace(`/${locale}`);
  }, [status, authorized, router, loginPath, locale]);
  useEffect(() => {
    if (status !== "authenticated" || !authorized) return;
    let current = true;
    const headers = { Authorization: `Bearer ${accessToken}` };
    setLoading(true);
    setAuditsLoading(true);
    setStatsError(false);
    setAuditsError(false);
    apiClient
      .request("/statistics/dashboard-charts", { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data) => {
        if (!data?.stats) throw new Error("Invalid statistics");
        if (current) {
          setStats(data.stats);
          setGrowth(data.growthData || []);
          setInteractions(data.interactionData || []);
        }
      })
      .catch(() => {
        if (current) setStatsError(true);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    apiClient
      .request("/users/admin/audits", { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data) => {
        if (current)
          setAudits(
            (Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
                ? data.data
                : []
            ).slice(0, 10),
          );
      })
      .catch(() => {
        if (current) setAuditsError(true);
      })
      .finally(() => {
        if (current) setAuditsLoading(false);
      });
    return () => {
      current = false;
    };
  }, [status, authorized, accessToken, retry]);
  if (status === "loading" || !session)
    return sessionTimeout ? (
      <Result
        status="warning"
        title={
          vi
            ? "Chưa thể xác minh phiên đăng nhập"
            : "Unable to verify your session"
        }
        extra={
          <Link className="admin-dashboard-primary" href={loginPath}>
            {vi ? "Đăng nhập lại" : "Sign in again"}
          </Link>
        }
      />
    ) : (
      <div className="admin-dashboard-section">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  if (!authorized)
    return (
      <Result
        status="403"
        title={vi ? "Bạn không có quyền truy cập" : "Access denied"}
      />
    );
  const cards = [
    {
      key: "users",
      label: vi ? "Người dùng" : "Users",
      icon: Users,
      path: "users",
    },
    {
      key: "posts",
      label: vi ? "Bài viết" : "Posts",
      icon: FileText,
      path: "posts",
    },
    {
      key: "courses",
      label: vi ? "Khóa học" : "Courses",
      icon: BookOpen,
      path: "creator-lab/courses",
    },
    {
      key: "comments",
      label: vi ? "Bình luận" : "Comments",
      icon: MessageSquare,
      path: "posts",
    },
    {
      key: "documents",
      label: vi ? "Tài liệu học tập" : "Learning resources",
      icon: FileText,
      path: "creator-lab/documents",
    },
    {
      key: "capcutTemplates",
      label: vi ? "Mẫu CapCut" : "CapCut templates",
      icon: Scissors,
      path: "creator-lab/capcut-templates",
    },
  ] as const;
  const shortcuts = [
    {
      path: "users",
      title: vi ? "Người dùng & phân quyền" : "Users & permissions",
      desc: vi
        ? "Quản lý tài khoản và hồ sơ thành viên."
        : "Manage accounts and member profiles.",
      icon: Users,
    },
    {
      path: "posts",
      title: vi ? "Biên tập tin tức" : "Newsroom",
      desc: vi
        ? "Viết bài, duyệt và quản lý nội dung."
        : "Write, review and manage articles.",
      icon: FileText,
    },
    {
      path: "organizations",
      title: vi ? "Câu lạc bộ" : "Clubs",
      desc: vi
        ? "Kết nối và quản lý các đơn vị thể thao."
        : "Connect and manage sports organizations.",
      icon: Building2,
    },
    {
      path: "teams",
      title: vi ? "Đội tuyển" : "Teams",
      desc: vi
        ? "Theo dõi đội tuyển và thành viên thi đấu."
        : "Manage teams and competing members.",
      icon: Users,
    },
    {
      path: "companion",
      title: vi ? "Yêu cầu đồng hành" : "Companion requests",
      desc: vi
        ? "Tiếp nhận thông tin tài trợ và hỗ trợ."
        : "Review sponsorship and support requests.",
      icon: Heart,
    },
    {
      path: "creator-lab/courses",
      title: vi ? "Khóa học" : "Courses",
      desc: vi
        ? "Biên tập chương học và bài giảng."
        : "Edit chapters and learning materials.",
      icon: Video,
    },
    {
      path: "creator-lab/documents",
      title: vi ? "Thư viện tài liệu" : "Resource library",
      desc: vi
        ? "Tổ chức kiến thức và tài nguyên học tập."
        : "Organize knowledge and learning resources.",
      icon: BookOpen,
    },
    {
      path: "creator-lab/capcut-templates",
      title: vi ? "Mẫu CapCut" : "CapCut templates",
      desc: vi
        ? "Cập nhật tài nguyên sáng tạo video."
        : "Curate video creation resources.",
      icon: Scissors,
    },
  ];
  const auditLabels: Record<string, string> = {
    UPDATE_PROFILE: vi
      ? "đã cập nhật thông tin cá nhân."
      : "updated their profile.",
    CHANGE_PASSWORD: vi ? "đã thay đổi mật khẩu." : "changed their password.",
    ENABLE_2FA: vi
      ? "đã bật xác thực hai lớp."
      : "enabled two-factor authentication.",
    DISABLE_2FA: vi
      ? "đã tắt xác thực hai lớp."
      : "disabled two-factor authentication.",
    CHANGE_ROLE: vi ? "đã được cập nhật quyền hạn." : "had their role updated.",
  };
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-heading">
        <div>
          <p className="admin-dashboard-eyebrow">
            Vietnam ParaSports · Workspace
          </p>
          <h1>{vi ? "Tổng quan nền tảng" : "Platform overview"}</h1>
          <p>
            {vi
              ? "Theo dõi hoạt động, quản lý nội dung và kết nối cộng đồng từ một không gian làm việc."
              : "Track activity, manage content and connect the community in one workspace."}
          </p>
        </div>
        <Link
          className="admin-dashboard-primary"
          href={`/${locale}/admin/posts`}
        >
          {vi ? "Quản lý nội dung" : "Manage content"}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      {statsError && (
        <Alert
          showIcon
          type="warning"
          title={
            vi
              ? "Chưa tải được số liệu tổng quan"
              : "Statistics are unavailable"
          }
          action={
            <button onClick={() => setRetry((value) => value + 1)}>
              {vi ? "Thử lại" : "Retry"}
            </button>
          }
          style={{ marginBottom: 20 }}
        />
      )}
      <section
        className="admin-stat-grid"
        aria-label={vi ? "Số liệu nền tảng" : "Platform statistics"}
      >
        {cards.map((card) => (
          <div className="admin-stat-card" key={card.key}>
            <div className="admin-stat-top">
              <span>{card.label}</span>
              <card.icon size={18} strokeWidth={1.5} />
            </div>
            <div className="admin-stat-value">
              {loading ? (
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 70, minWidth: 70 }}
                />
              ) : statsError || !stats ? (
                "—"
              ) : (
                new Intl.NumberFormat(vi ? "vi-VN" : "en-GB").format(
                  stats[card.key] ?? 0,
                )
              )}
            </div>
            <Link href={`/${locale}/admin/${card.path}`}>
              {vi ? "Xem quản lý" : "View records"}
              <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </section>
      <div className="admin-chart-grid">
        <AdminCharts
          growthData={growth}
          interactionData={interactions}
          userLabel={vi ? "Người dùng" : "Users"}
          postLabel={vi ? "Bài viết" : "Posts"}
          likeLabel={vi ? "Lượt thích" : "Likes"}
          commentLabel={vi ? "Bình luận" : "Comments"}
          loading={loading}
        />
      </div>
      <div className="admin-dashboard-bottom">
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <h2>{vi ? "Không gian quản lý" : "Management workspace"}</h2>
          </div>
          <div className="admin-shortcuts">
            {shortcuts.map((item) => (
              <Link
                href={`/${locale}/admin/${item.path}`}
                className="admin-shortcut"
                key={item.path}
              >
                <item.icon size={19} strokeWidth={1.5} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
        </section>
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <h2>{vi ? "Hoạt động gần đây" : "Recent activity"}</h2>
            <Link href={`/${locale}/admin/audit-logs`}>
              {vi ? "Xem tất cả" : "View all"}
            </Link>
          </div>
          <div className="admin-audits">
            {auditsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : auditsError ? (
              <div className="admin-empty">
                {vi
                  ? "Chưa tải được nhật ký."
                  : "Activity could not be loaded."}
                <button
                  onClick={() => setRetry((value) => value + 1)}
                  style={{
                    display: "block",
                    margin: "12px auto",
                    color: "var(--admin-accent)",
                  }}
                >
                  {vi ? "Thử lại" : "Retry"}
                </button>
              </div>
            ) : audits.length ? (
              audits.map((audit) => (
                <div className="admin-audit" key={audit.id}>
                  <span className="admin-audit-dot" />
                  <div>
                    <p>
                      <strong>
                        {audit.user?.fullName || (vi ? "Hệ thống" : "System")}
                      </strong>{" "}
                      {auditLabels[audit.action] ||
                        `${vi ? "đã thực hiện" : "performed"} ${audit.action}.`}
                    </p>
                    <time dateTime={audit.createdAt}>
                      {new Date(audit.createdAt).toLocaleString(
                        vi ? "vi-VN" : "en-GB",
                        {
                          timeZone: "Asia/Ho_Chi_Minh",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  vi ? "Chưa có hoạt động gần đây" : "No recent activity"
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
