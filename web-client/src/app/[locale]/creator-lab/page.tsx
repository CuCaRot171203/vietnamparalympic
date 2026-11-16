"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";
import { useLanguage } from "@/hooks/useTranslation";
import { useApi } from "@/hooks/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { safeMediaUrl } from "@/lib/organizations";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import styles from "./creator-lab.module.css";

const calvera = localFont({
  src: "../../../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-lab-calvera",
});
const italic = localFont({
  src: "../../../../public/KV/1FTVVIPNeusharp-Italic.ttf",
  weight: "400",
  display: "swap",
  variable: "--font-lab-italic",
});
type Course = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  enrolledCount?: number;
  lessonCount?: number;
  totalDuration?: number;
};
type Attachment = {
  id: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
};
type DocumentItem = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  isPublic?: boolean;
  topic?: { id: string; name: string };
  attachments?: Attachment[];
};
type Template = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  capcutLink?: string;
};
type Tab = "all" | "courses" | "docs" | "templates";
const isTab = (value: string | null): value is Tab =>
  value === "all" ||
  value === "courses" ||
  value === "docs" ||
  value === "templates";
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
function items<T>(data?: T[] | { data: T[] }): T[] {
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
}
function externalLink(value?: string) {
  try {
    const url = new URL(value || "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
function ResourceImage({
  src,
  sizes = "(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw",
}: {
  src?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <Image
      src={
        (!failed && safeMediaUrl(src)) ||
        "/assets/homepage/creator-lab-launch.jpg"
      }
      alt=""
      fill
      sizes={sizes}
      unoptimized
      className={styles.photo}
      onError={() => setFailed(true)}
    />
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.badge}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
function Notice({
  loading,
  error,
  vi,
  onRetry,
}: {
  loading?: boolean;
  error?: boolean;
  vi: boolean;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <div
        className={styles.skeletonGrid}
        aria-label={vi ? "Đang tải nội dung" : "Loading resources"}
        role="status"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  return (
    <div className={styles.empty} role={error ? "alert" : "status"}>
      <BookOpen size={26} aria-hidden="true" />
      <h3>
        {error
          ? vi
            ? "Chưa thể tải nội dung"
            : "Resources unavailable"
          : vi
            ? "Chưa có nội dung phù hợp"
            : "No matching resources"}
      </h3>
      <p>
        {error
          ? vi
            ? "Vui lòng thử lại để tải nội dung mới nhất."
            : "Please retry to load the latest resources."
          : vi
            ? "Thử thay đổi từ khóa hoặc quay lại để xem nội dung mới."
            : "Try another keyword or return for new resources."}
      </p>
      {error && (
        <button type="button" onClick={onRetry}>
          {vi ? "Thử lại" : "Try again"}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
export default function CreatorLabPage() {
  const { language } = useLanguage();
  const vi = language === "vi";
  const { status } = useSession();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(6);
  useEffect(() => {
    const readTab = () => {
      const value = new URLSearchParams(window.location.search).get("tab");
      setTab(isTab(value) ? value : "all");
      setLimit(6);
    };
    readTab();
    window.addEventListener("popstate", readTab);
    return () => window.removeEventListener("popstate", readTab);
  }, []);
  const switchTab = (value: string) => {
    if (!isTab(value)) return;
    setTab(value);
    setLimit(6);
    if (value !== "docs") setTopic("");
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("tab");
    else url.searchParams.set("tab", value);
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash,
    );
  };
  const explore = (value: Tab) => {
    setQuery("");
    setTopic("");
    switchTab(value);
  };
  const coursesApi = useApi<Course[] | { data: Course[] }>("/courses");
  const docsApi = useApi<DocumentItem[] | { data: DocumentItem[] }>(
    "/documents",
  );
  const templatesApi = useApi<Template[] | { data: Template[] }>(
    "/capcut-templates",
  );
  const courses = items(coursesApi.data).filter((item) => item.slug);
  const documents = useMemo(
    () =>
      items(docsApi.data).filter(
        (item) => item.isPublic !== false && item.slug,
      ),
    [docsApi.data],
  );
  const templates = items(templatesApi.data);
  const matches = (title: string, description = "") =>
    normalize(title + " " + plain(description)).includes(
      normalize(query.trim()),
    );
  const filteredCourses = courses.filter((item) =>
    matches(item.title, item.description),
  );
  const filteredDocs = documents.filter(
    (item) =>
      matches(item.title, item.content) && (!topic || topic === item.topic?.id),
  );
  const filteredTemplates = templates.filter((item) =>
    matches(item.title, item.description),
  );
  const topics = [
    ...new Map(
      documents
        .filter((doc) => doc.topic)
        .map((doc) => [doc.topic!.id, doc.topic!]),
    ).values(),
  ];
  const results =
    tab === "all"
      ? filteredCourses.length + filteredDocs.length + filteredTemplates.length
      : tab === "courses"
        ? filteredCourses.length
        : tab === "docs"
          ? filteredDocs.length
          : filteredTemplates.length;
  const courseHref = (slug: string) =>
    "/" + language + "/creator-lab/courses/" + slug;
  const docHref = (slug: string) =>
    "/" + language + "/creator-lab/documents/" + slug;
  const duration = (seconds: number) =>
    seconds >= 3600
      ? Math.floor(seconds / 3600) +
        " " +
        (vi ? "giờ" : "h") +
        (seconds % 3600 >= 60
          ? " " +
            Math.floor((seconds % 3600) / 60) +
            " " +
            (vi ? "phút" : "min")
          : "")
      : Math.max(1, Math.ceil(seconds / 60)) + " " + (vi ? "phút" : "min");
  const more = (total: number) =>
    limit < total && (
      <div className={styles.more}>
        <span>
          {vi ? "Đang hiển thị" : "Showing"} {Math.min(limit, total)} / {total}
        </span>
        <button type="button" onClick={() => setLimit((value) => value + 6)}>
          {vi ? "Xem thêm nội dung" : "Show more resources"}
          <ChevronDown size={17} aria-hidden="true" />
        </button>
      </div>
    );
  const courseCards = (featured = false) => {
    if (coursesApi.error || coursesApi.isLoading || !filteredCourses.length)
      return (
        <Notice
          vi={vi}
          loading={coursesApi.isLoading}
          error={Boolean(coursesApi.error)}
          onRetry={() => {
            coursesApi.mutate();
          }}
        />
      );
    return (
      <>
        <div className={styles.courseGrid}>
          {filteredCourses.slice(0, featured ? 3 : limit).map((course) => (
            <article key={course.id} className={styles.course}>
              <Link
                href={courseHref(course.slug)}
                className={styles.courseImage}
                aria-label={course.title}
              >
                <ResourceImage src={course.thumbnail} />
                <span className={styles.imageBadge}>
                  {vi ? "Khóa học" : "Course"}
                </span>
              </Link>
              <div className={styles.courseBody}>
                <p className={styles.courseMeta}>
                  {typeof course.lessonCount === "number"
                    ? course.lessonCount + " " + (vi ? "bài học" : "lessons")
                    : vi
                      ? "Khóa học trực tuyến"
                      : "Online course"}
                  {Boolean(
                    course.totalDuration && course.totalDuration > 0,
                  ) && <> · {duration(course.totalDuration!)}</>}
                </p>
                <h3>
                  <Link href={courseHref(course.slug)}>{course.title}</Link>
                </h3>
                <p className={styles.excerpt}>{plain(course.description)}</p>
                <div className={styles.cardFoot}>
                  <span>
                    <Users size={14} aria-hidden="true" />
                    {typeof course.enrolledCount === "number"
                      ? course.enrolledCount +
                        " " +
                        (vi ? "học viên" : "learners")
                      : vi
                        ? "Học theo nhịp của bạn"
                        : "Learn at your pace"}
                  </span>
                  <Link href={courseHref(course.slug)}>
                    {vi ? "Học ngay" : "Learn now"}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {featured
          ? filteredCourses.length > 3 && (
              <a
                href="#lab-library"
                className={styles.seeAllCourses}
                onClick={() => switchTab("courses")}
              >
                {vi ? "Xem tất cả khóa học" : "View all courses"}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            )
          : more(filteredCourses.length)}
      </>
    );
  };
  const documentCards = (featured = false) => {
    if (docsApi.error || docsApi.isLoading || !filteredDocs.length)
      return (
        <Notice
          vi={vi}
          loading={docsApi.isLoading}
          error={Boolean(docsApi.error)}
          onRetry={() => {
            docsApi.mutate();
          }}
        />
      );
    return (
      <>
        <div className={featured ? styles.documentList : styles.documentGrid}>
          {filteredDocs.slice(0, featured ? 3 : limit).map((doc) => {
            const file =
              doc.attachments?.length === 1 ? doc.attachments[0] : undefined;
            const fileUrl = safeMediaUrl(file?.fileUrl);
            const extension = (
              file?.fileName || file?.fileUrl?.split(/[?#]/)[0]
            )
              ?.split(".")
              .pop()
              ?.toUpperCase();
            const fileType =
              extension && /^[A-Z0-9]{2,5}$/.test(extension)
                ? extension
                : file?.fileType?.includes("pdf")
                  ? "PDF"
                  : "";
            const href = docHref(doc.slug);
            return (
              <article className={styles.document} key={doc.id}>
                <div>
                  <h3>
                    <Link href={href}>{doc.title}</Link>
                  </h3>
                  <p>{plain(doc.content)}</p>
                  <span>
                    {fileType ||
                      (doc.attachments?.length
                        ? doc.attachments.length +
                          " " +
                          (vi ? "tệp đính kèm" : "attachments")
                        : vi
                          ? "Đọc trực tuyến"
                          : "Read online")}
                  </span>
                </div>
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.download}
                    aria-label={
                      (vi ? "Tải tài liệu: " : "Download: ") + doc.title
                    }
                  >
                    <Download size={16} aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    href={href}
                    className={styles.download}
                    aria-label={
                      (vi ? "Mở tài liệu: " : "Open resource: ") + doc.title
                    }
                  >
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
        {!featured && more(filteredDocs.length)}
      </>
    );
  };
  const templateCards = (featured = false) => {
    if (
      templatesApi.error ||
      templatesApi.isLoading ||
      !filteredTemplates.length
    )
      return (
        <Notice
          vi={vi}
          loading={templatesApi.isLoading}
          error={Boolean(templatesApi.error)}
          onRetry={() => {
            templatesApi.mutate();
          }}
        />
      );
    return (
      <>
        <div className={featured ? styles.featuredTemplate : styles.courseGrid}>
          {filteredTemplates.slice(0, featured ? 1 : limit).map((template) => (
            <article className={styles.template} key={template.id}>
              <div className={styles.templateImage}>
                <ResourceImage
                  src={template.thumbnailUrl}
                  sizes="(max-width:767px) 100vw, 50vw"
                />
              </div>
              <div className={styles.templateBody}>
                <h3>{template.title}</h3>
                <div>
                  <span>{vi ? "Mẫu CapCut" : "CapCut template"}</span>
                  {externalLink(template.capcutLink) ? (
                    <a
                      href={externalLink(template.capcutLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        (vi ? "Dùng mẫu: " : "Use template: ") + template.title
                      }
                    >
                      {vi ? "Dùng mẫu" : "Use template"}
                    </a>
                  ) : (
                    <span>
                      {vi ? "Liên kết đang cập nhật" : "Link coming soon"}
                    </span>
                  )}
                </div>
                {!featured && template.description && (
                  <p>{plain(template.description)}</p>
                )}
              </div>
            </article>
          ))}
        </div>
        {!featured && more(filteredTemplates.length)}
      </>
    );
  };
  const steps = vi
    ? [
        [
          "Học điều mới",
          "Khóa học ngắn về hình ảnh cá nhân, quay dựng và xây kênh.",
        ],
        [
          "Tạo dấu ấn riêng",
          "Thực hành với kịch bản tham khảo và mẫu CapCut có sẵn.",
        ],
        ["Lan tỏa giá trị", "Chia sẻ câu chuyện thể thao tới cộng đồng."],
      ]
    : [
        [
          "Learn something new",
          "Short courses in personal branding, video and channel building.",
        ],
        [
          "Make it your own",
          "Practice with reference scripts and ready-to-use CapCut templates.",
        ],
        ["Share your impact", "Share your sporting story with the community."],
      ];
  return (
    <main
      id="main-content"
      className={[
        styles.page,
        calvera.variable,
        italic.variable,
        homeBeVietnam.variable,
        homeNeusharp.variable,
      ].join(" ")}
    >
      <section className={styles.hero} aria-labelledby="creator-lab-heading">
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <nav
                className={styles.breadcrumb}
                aria-label={vi ? "Đường dẫn" : "Breadcrumb"}
              >
                <Link href={"/" + language}>{vi ? "Trang chủ" : "Home"}</Link>
                <ChevronRight size={12} aria-hidden="true" />
                <span aria-current="page">Creator Lab</span>
              </nav>
              <h1 id="creator-lab-heading">
                <span>VIETNAM</span>
                <span>CREATOR LAB</span>
              </h1>
              <p className={styles.tagline}>
                {vi
                  ? "Câu chuyện của bạn. Dấu ấn của bạn."
                  : "Your story. Your own voice."}
              </p>
              <p className={styles.heroDescription}>
                {vi
                  ? "Không gian học tập và sáng tạo nội dung, đồng hành cùng vận động viên phát triển kỹ năng truyền thông số và chủ động chia sẻ câu chuyện thể thao của mình."
                  : "A space for learning and creating, helping athletes develop digital media skills and share their sporting stories in their own voice."}
              </p>
              <div className={styles.actions}>
                <a
                  className={styles.primary}
                  href="#lab-library"
                  onClick={() => explore("all")}
                >
                  {vi ? "Bắt đầu khám phá" : "Start exploring"}
                  <span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </a>
                <a
                  className={styles.secondary}
                  href="#lab-library"
                  onClick={() => explore("docs")}
                >
                  {vi ? "Tìm tài liệu học tập" : "Explore resources"}
                  <span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </a>
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image
                src="/assets/homepage/creator-lab-summit.jpg"
                alt={
                  vi
                    ? "Hoạt động kết nối tại Vietnam ParaSports Creator Lab Summit"
                    : "Connecting at the Vietnam ParaSports Creator Lab Summit"
                }
                fill
                priority
                sizes="(max-width:767px) 100vw, 50vw"
                className={styles.photo}
              />
            </div>
          </div>
          <div
            className={styles.steps}
            aria-label={vi ? "Hành trình sáng tạo" : "Your creative journey"}
          >
            {steps.map(([title, description], index) => (
              <div key={index}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className={styles.container}>
        <section
          id="lab-library"
          className={styles.library}
          aria-labelledby="library-heading"
        >
          <header className={styles.libraryHeader}>
            <Badge>{vi ? "Thư viện sáng tạo" : "Creative library"}</Badge>
            <h2 id="library-heading">
              {vi
                ? "HỌC - THỰC HÀNH - KỂ CHUYỆN"
                : "LEARN - CREATE - TELL YOUR STORY"}
            </h2>
            <p>
              {vi
                ? "Khóa học, tài liệu và mẫu CapCut dành riêng cho vận động viên."
                : "Courses, resources and CapCut templates for athletes."}
            </p>
          </header>
          <Tabs value={tab} onValueChange={switchTab}>
            <div className={styles.libraryControls}>
              <TabsList
                className={styles.tabs}
                aria-label={vi ? "Loại nội dung" : "Resource type"}
              >
                {(
                  [
                    ["all", vi ? "Tất cả" : "All"],
                    ["courses", vi ? "Khóa học" : "Courses"],
                    ["docs", vi ? "Tài liệu" : "Resources"],
                    ["templates", vi ? "Mẫu CapCut" : "CapCut templates"],
                  ] as const
                ).map(([value, label]) => (
                  <TabsTrigger value={value} key={value} className={styles.tab}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className={styles.search}>
                <Search size={15} aria-hidden="true" />
                <input
                  type="search"
                  aria-label={
                    vi ? "Tìm trong thư viện Creator Lab" : "Search Creator Lab"
                  }
                  placeholder={vi ? "Tìm nội dung..." : "Search resources..."}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setLimit(6);
                  }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setLimit(6);
                    }}
                    aria-label={vi ? "Xóa từ khóa" : "Clear search"}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {tab === "docs" && topics.length > 1 && (
              <div className={styles.topicFilter}>
                <label htmlFor="lab-topic">{vi ? "Chủ đề" : "Topic"}</label>
                <select
                  id="lab-topic"
                  value={topic}
                  onChange={(event) => {
                    setTopic(event.target.value);
                    setLimit(6);
                  }}
                >
                  <option value="">
                    {vi ? "Tất cả chủ đề" : "All topics"}
                  </option>
                  {topics.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {query && (
              <p className={styles.resultCount} role="status">
                {results} {vi ? "kết quả cho" : "results for"} “{query}”
              </p>
            )}
            <TabsContent value="all" className={styles.panel}>
              {courseCards(true)}
              <div className={styles.resourcesSplit}>
                <section aria-labelledby="lab-docs-heading">
                  <div className={styles.resourceHeading}>
                    <h3 id="lab-docs-heading">
                      <FileText size={19} aria-hidden="true" />
                      {vi ? "Tài liệu" : "Resources"}
                    </h3>
                    <span>
                      {docsApi.isLoading ? "—" : documents.length}{" "}
                      {vi ? "tài liệu" : "resources"}
                    </span>
                  </div>
                  {documentCards(true)}
                  <a
                    href="#lab-library"
                    className={styles.viewAll}
                    onClick={() => switchTab("docs")}
                  >
                    {vi ? "Xem tất cả tài liệu" : "View all resources"}
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </section>
                <section aria-labelledby="lab-templates-heading">
                  <div className={styles.resourceHeading}>
                    <h3 id="lab-templates-heading">
                      <Video size={19} aria-hidden="true" />
                      {vi ? "Mẫu CapCut" : "CapCut templates"}
                    </h3>
                    <span>
                      {templatesApi.isLoading ? "—" : templates.length}{" "}
                      {vi ? "mẫu" : "templates"}
                    </span>
                  </div>
                  {templateCards(true)}
                  <a
                    href="#lab-library"
                    className={styles.viewAll}
                    onClick={() => switchTab("templates")}
                  >
                    {vi ? "Xem tất cả mẫu" : "View all templates"}
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </section>
              </div>
            </TabsContent>
            <TabsContent value="courses" className={styles.panel}>
              {courseCards()}
            </TabsContent>
            <TabsContent value="docs" className={styles.panel}>
              {documentCards()}
            </TabsContent>
            <TabsContent value="templates" className={styles.panel}>
              {templateCards()}
            </TabsContent>
          </Tabs>
        </section>
        <section
          className={styles.closing}
          aria-labelledby="lab-closing-heading"
        >
          <Badge>{vi ? "Bắt đầu ngay" : "Start today"}</Badge>
          <h2 id="lab-closing-heading">
            {vi ? "BẮT ĐẦU HÀNH TRÌNH CỦA BẠN" : "START YOUR CREATIVE JOURNEY"}
          </h2>
          <p>
            {status === "authenticated"
              ? vi
                ? "Tiếp tục khám phá khóa học, tài liệu và ý tưởng mới cho hành trình sáng tạo của bạn."
                : "Explore more courses, resources and ideas for your creative journey."
              : vi
                ? "Đăng nhập để lưu tiến độ học và tải tài liệu - dùng chung tài khoản Vietnam ParaSports."
                : "Sign in with your Vietnam ParaSports account to save your learning progress and access resources."}
          </p>
          <div className={styles.actions}>
            <a
              href="#lab-library"
              className={styles.primary}
              onClick={() => explore("all")}
            >
              {vi ? "Bắt đầu khám phá" : "Start exploring"}
              <span>
                <ArrowRight size={17} aria-hidden="true" />
              </span>
            </a>
            {status === "authenticated" ? (
              <a
                href="#lab-library"
                className={styles.secondary}
                onClick={() => explore("docs")}
              >
                {vi ? "Tìm tài liệu" : "Find resources"}
                <span>
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </a>
            ) : (
              <Link
                href={
                  "/" +
                  language +
                  "/login?callbackUrl=" +
                  encodeURIComponent(
                    "/" + language + "/creator-lab#lab-library",
                  )
                }
                className={styles.secondary}
              >
                {vi ? "Đăng nhập" : "Sign in"}
                <span>
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
