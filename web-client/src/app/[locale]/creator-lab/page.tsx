"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  FileText,
  Play,
  Search,
  Scissors,
  Users,
  Video,
  X,
} from "lucide-react";
import { useLanguage } from "@/hooks/useTranslation";
import { useApi } from "@/hooks/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsImage from "@/components/news/NewsImage";
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./creator-lab.module.css";

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
type DocumentItem = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  isPublic?: boolean;
  topic?: { id: string; name: string };
  attachments?: { id: string }[];
};
type Template = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  capcutLink?: string;
};
type Tab = "courses" | "docs" | "templates";
const plain = (text = "") =>
  text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const normalize = (text: string) =>
  text
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
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export default function CreatorLabPage() {
  const { language } = useLanguage();
  const vi = language === "vi";
  const [tab, setTab] = useState<Tab>("courses");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (
      requested === "docs" ||
      requested === "templates" ||
      requested === "courses"
    )
      setTab(requested);
  }, []);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [templateLimit, setTemplateLimit] = useState(6);
  const coursesApi = useApi<Course[] | { data: Course[] }>("/courses");
  const docsApi = useApi<DocumentItem[] | { data: DocumentItem[] }>(
    "/documents",
  );
  const templatesApi = useApi<Template[] | { data: Template[] }>(
    "/capcut-templates",
  );
  const courses = items(coursesApi.data);
  const documents = useMemo(
    () => items(docsApi.data).filter((doc) => doc.isPublic !== false),
    [docsApi.data],
  );
  const templates = items(templatesApi.data);
  const matches = (title: string, description = "") =>
    normalize(`${title} ${plain(description)}`).includes(
      normalize(query.trim()),
    );
  const filteredCourses = courses.filter((item) =>
    matches(item.title, item.description),
  );
  const filteredDocs = documents.filter(
    (item) =>
      matches(item.title, item.content) && (!topic || item.topic?.id === topic),
  );
  const filteredTemplates = templates.filter((item) =>
    matches(item.title, item.description),
  );
  const docGroups = new Map<string, DocumentItem[]>();
  filteredDocs.forEach((doc) => {
    const key =
      doc.topic?.name || (vi ? "Tài liệu chung" : "General resources");
    docGroups.set(key, [...(docGroups.get(key) || []), doc]);
  });
  const topics = [
    ...new Map(
      documents
        .filter((doc) => doc.topic)
        .map((doc) => [doc.topic!.id, doc.topic!]),
    ).values(),
  ];
  const content = {
    courses: {
      title: vi ? "Học để tự tin kể chuyện." : "Learn to tell your story.",
      description: vi
        ? "Từng bài học nhỏ, thêm một kỹ năng để xây dựng hình ảnh và phát triển kênh của bạn."
        : "Build your skills, shape your personal brand and grow your channel.",
      label: vi ? "Khóa học" : "Courses",
      icon: Video,
      count: courses.length,
      api: coursesApi,
      results: filteredCourses.length,
    },
    docs: {
      title: vi
        ? "Kiến thức luôn trong tầm tay."
        : "Knowledge at your fingertips.",
      description: vi
        ? "Cẩm nang, hướng dẫn và tài liệu thực hành cho hành trình sáng tạo nội dung."
        : "Guides, handbooks and practical resources for your creative journey.",
      label: vi ? "Tài liệu" : "Resources",
      icon: BookOpen,
      count: documents.length,
      api: docsApi,
      results: filteredDocs.length,
    },
    templates: {
      title: vi ? "Bắt đầu từ một ý tưởng hay." : "Start with a great idea.",
      description: vi
        ? "Khám phá mẫu CapCut, thêm dấu ấn cá nhân và kể câu chuyện theo cách của bạn."
        : "Explore CapCut templates and bring your own story to life.",
      label: vi ? "Mẫu CapCut" : "CapCut templates",
      icon: Scissors,
      count: templates.length,
      api: templatesApi,
      results: filteredTemplates.length,
    },
  };
  const current = content[tab];
  const switchTab = (value: string) => {
    setTab(value as Tab);
    setTemplateLimit(6);
  };
  const duration = (seconds: number) =>
    seconds >= 3600
      ? `${Math.floor(seconds / 3600)} ${vi ? "giờ" : "h"} ${Math.floor((seconds % 3600) / 60)} ${vi ? "phút" : "min"}`
      : `${Math.max(1, Math.ceil(seconds / 60))} ${vi ? "phút" : "min"}`;
  const loading = (
    <div className={styles.courseGrid}>
      {[1, 2, 3].map((index) => (
        <div key={index} className={styles.skeleton}>
          <Skeleton className={styles.skeletonImage} />
          <Skeleton className={styles.skeletonTitle} />
          <Skeleton className={styles.skeletonText} />
        </div>
      ))}
    </div>
  );
  const empty = (
    <div className={styles.empty}>
      <Search size={30} strokeWidth={1.3} />
      <h3>
        {query || topic
          ? vi
            ? "Chưa tìm thấy nội dung phù hợp"
            : "No matching resources"
          : vi
            ? "Nội dung đang được cập nhật"
            : "New resources are on the way"}
      </h3>
      <p>
        {query || topic
          ? vi
            ? "Thử một từ khóa khác hoặc xem toàn bộ thư viện."
            : "Try another keyword or explore the full library."
          : vi
            ? "Hãy quay lại để khám phá thêm kiến thức và cảm hứng sáng tạo."
            : "Come back soon for more knowledge and inspiration."}
      </p>
      {(query || topic) && (
        <button
          onClick={() => {
            setQuery("");
            setTopic("");
          }}
        >
          {vi ? "Xem tất cả" : "View all"}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
  const error = (
    <div className={styles.empty} role="alert">
      <BookOpen size={30} />
      <h3>{vi ? "Chưa thể tải thư viện" : "Library unavailable"}</h3>
      <p>
        {vi
          ? "Vui lòng thử lại để tải nội dung mới nhất."
          : "Please try again to load the latest resources."}
      </p>
      <button onClick={() => current.api.mutate()}>
        {vi ? "Thử lại" : "Try again"}
        <ArrowRight size={15} />
      </button>
    </div>
  );

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
        >
          <Link href={`/${language}`}>{vi ? "Trang chủ" : "Home"}</Link>
          <span>/</span>
          <span aria-current="page">Creator Lab</span>
        </nav>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.labBrand}>
              <Image
                src="/KV/logo vncl.png"
                alt="Vietnam Creator Lab"
                width={2071}
                height={555}
                sizes="(max-width: 767px) 200px, 240px"
                priority
              />
            </div>
            <p className={styles.eyebrow}>
              <span />
              Vietnam ParaSports · Creator Lab
            </p>
            <h1>
              {vi ? (
                <>
                  Câu chuyện của bạn.
                  <br />
                  <span>Dấu ấn của bạn.</span>
                </>
              ) : (
                <>
                  Your story.
                  <br />
                  <span>Your own voice.</span>
                </>
              )}
            </h1>
            <p className={styles.heroDescription}>
              {vi
                ? "Học cách xây dựng hình ảnh cá nhân, phát triển kênh truyền thông và tự kể câu chuyện thể thao bằng tiếng nói của chính mình. Tự tin, chân thực và đầy tự hào."
                : "Build your personal brand, grow your media channels and tell your sporting story in your own voice. With confidence, authenticity and pride."}
            </p>
            <div className={styles.heroActions}>
              <a
                className={styles.primary}
                href="#lab-library"
                onClick={() => switchTab("courses")}
              >
                {vi ? "Bắt đầu khám phá" : "Start exploring"}
                <ArrowUpRight size={18} />
              </a>
              <a
                className={styles.textLink}
                href="#lab-library"
                onClick={() => switchTab("docs")}
              >
                {vi ? "Tìm tài liệu học tập" : "Explore resources"}
                <ArrowRight size={15} />
              </a>
            </div>
            <p className={styles.heroNote}>
              <Check size={14} />
              {vi
                ? "Dành cho vận động viên và cộng đồng sáng tạo thể thao."
                : "For athletes and the sporting creative community."}
            </p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImage}>
              <Image
                src="/assets/homepage/creator-lab-summit.jpg"
                alt={
                  vi
                    ? "Hoạt động kết nối và chia sẻ tại Vietnam ParaSports"
                    : "Sharing and connecting at Vietnam ParaSports"
                }
                fill
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
                className={styles.photo}
              />
              <span className={styles.visualLabel}>
                Creator Lab <span>↗</span>
              </span>
            </div>
            <div className={styles.visualCaption}>
              <span className={styles.captionMark}>
                <Play size={18} strokeWidth={1.4} />
              </span>
              <div>
                <strong>
                  {vi
                    ? "Từ trải nghiệm đến cảm hứng."
                    : "Turn experience into inspiration."}
                </strong>
                <p>
                  {vi
                    ? "Học. Thực hành. Chia sẻ câu chuyện của bạn."
                    : "Learn. Create. Share your story."}
                </p>
              </div>
            </div>
          </div>
        </header>
        <section
          className={styles.steps}
          aria-label={vi ? "Hành trình sáng tạo" : "Your creative journey"}
        >
          {[
            {
              icon: BookOpen,
              title: vi ? "Học điều mới" : "Learn something new",
              text: vi
                ? "Trang bị kiến thức để làm chủ nội dung."
                : "Build the skills to own your content.",
            },
            {
              icon: Video,
              title: vi ? "Tạo dấu ấn riêng" : "Make it your own",
              text: vi
                ? "Biến ý tưởng thành những câu chuyện thật."
                : "Turn your ideas into authentic stories.",
            },
            {
              icon: Users,
              title: vi ? "Lan tỏa giá trị" : "Share your impact",
              text: vi
                ? "Kết nối cộng đồng bằng tiếng nói của bạn."
                : "Connect with a community through your voice.",
            },
          ].map((step, index) => (
            <div key={index} className={styles.step}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <step.icon size={20} strokeWidth={1.4} />
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </section>
        <section
          id="lab-library"
          className={styles.library}
          aria-labelledby="library-heading"
        >
          <div className={styles.libraryHeader}>
            <div>
              <p className={styles.eyebrow}>
                {vi
                  ? "Không gian học tập & thực hành"
                  : "A space to learn & create"}
              </p>
              <h2 id="library-heading">
                {vi ? "Thư viện sáng tạo" : "The creative library"}
              </h2>
            </div>
            <p>
              {vi
                ? "Chọn điểm bắt đầu. Học theo nhịp của bạn."
                : "Find your starting point. Learn at your own pace."}
            </p>
          </div>
          <Tabs value={tab} onValueChange={switchTab}>
            <TabsList className={styles.tabs}>
              {(["courses", "docs", "templates"] as const).map((value) => {
                const entry = content[value];
                return (
                  <TabsTrigger value={value} className={styles.tab} key={value}>
                    <entry.icon size={17} />
                    <span>{entry.label}</span>
                    <small>{entry.api.isLoading ? "—" : entry.count}</small>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <div className={styles.libraryToolbar}>
              <div>
                <h3>{current.title}</h3>
                <p>{current.description}</p>
              </div>
              <div className={styles.search}>
                <Search size={17} />
                <input
                  type="search"
                  aria-label={
                    vi
                      ? "Tìm trong thư viện Creator Lab"
                      : "Search the Creator Lab library"
                  }
                  placeholder={
                    vi
                      ? "Tìm nội dung bạn quan tâm…"
                      : "Find something to learn…"
                  }
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setTemplateLimit(6);
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label={vi ? "Xóa từ khóa" : "Clear search"}
                  >
                    <X size={15} />
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
                  onChange={(event) => setTopic(event.target.value)}
                >
                  <option value="">
                    {vi ? "Tất cả chủ đề" : "All topics"}
                  </option>
                  {topics.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!!query && !current.api.isLoading && (
              <p className={styles.searchCount} aria-live="polite">
                {current.results} {vi ? "kết quả cho" : "results for"} “{query}”
              </p>
            )}
            <TabsContent value="courses" className={styles.panel}>
              {coursesApi.error ? (
                error
              ) : coursesApi.isLoading ? (
                loading
              ) : !filteredCourses.length ? (
                empty
              ) : (
                <div className={styles.courseGrid}>
                  {filteredCourses.map((course, index) => (
                    <article className={styles.course} key={course.id}>
                      <Link
                        href={`/${language}/creator-lab/courses/${course.slug}`}
                        className={styles.courseImage}
                        aria-label={course.title}
                      >
                        <NewsImage
                          src={course.thumbnail}
                          className={styles.photo}
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        />
                        <span className={styles.imageLabel}>
                          {vi ? "Khóa học" : "Course"} ·{" "}
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={styles.play}>
                          <Play size={19} />
                        </span>
                      </Link>
                      <div className={styles.courseBody}>
                        <h4>
                          <Link
                            href={`/${language}/creator-lab/courses/${course.slug}`}
                          >
                            {course.title}
                          </Link>
                        </h4>
                        <p>{plain(course.description)}</p>
                        <div className={styles.courseMeta}>
                          <span>
                            <Users size={13} />
                            {course.enrolledCount ?? 0}{" "}
                            {vi ? "học viên" : "learners"}
                          </span>
                          <span>
                            <Video size={13} />
                            {course.lessonCount ?? 0}{" "}
                            {vi ? "bài học" : "lessons"}
                          </span>
                          {!!course.totalDuration && (
                            <span>
                              <Clock3 size={13} />
                              {duration(course.totalDuration)}
                            </span>
                          )}
                        </div>
                        <Link
                          className={styles.cardAction}
                          href={`/${language}/creator-lab/courses/${course.slug}`}
                        >
                          {vi ? "Khám phá khóa học" : "Explore course"}
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="docs" className={styles.panel}>
              {docsApi.error
                ? error
                : docsApi.isLoading
                  ? loading
                  : !filteredDocs.length
                    ? empty
                    : [...docGroups].map(([category, docs]) => (
                        <section className={styles.docGroup} key={category}>
                          <div className={styles.groupHeading}>
                            <h4>{category}</h4>
                            <span>
                              {docs.length} {vi ? "tài liệu" : "resources"}
                            </span>
                          </div>
                          <div className={styles.docGrid}>
                            {docs.map((doc) => (
                              <article key={doc.id}>
                                <Link
                                  className={styles.document}
                                  href={`/${language}/creator-lab/documents/${doc.slug}`}
                                >
                                  <span className={styles.docIcon}>
                                    <FileText size={23} strokeWidth={1.4} />
                                  </span>
                                  <div>
                                    <h5>{doc.title}</h5>
                                    <p>{plain(doc.content).slice(0, 180)}</p>
                                    <span className={styles.docMeta}>
                                      {doc.attachments?.length ? (
                                        <>
                                          <FileText size={12} />
                                          {doc.attachments.length}{" "}
                                          {vi ? "tệp đính kèm" : "attachments"}
                                        </>
                                      ) : (
                                        <>
                                          <BookOpen size={12} />
                                          {vi
                                            ? "Đọc trực tuyến"
                                            : "Read online"}
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <ArrowUpRight
                                    size={17}
                                    className={styles.docArrow}
                                  />
                                </Link>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
            </TabsContent>
            <TabsContent value="templates" className={styles.panel}>
              {templatesApi.error ? (
                error
              ) : templatesApi.isLoading ? (
                loading
              ) : !filteredTemplates.length ? (
                empty
              ) : (
                <>
                  <div className={styles.courseGrid}>
                    {filteredTemplates
                      .slice(0, templateLimit)
                      .map((template) => (
                        <article key={template.id} className={styles.template}>
                          <div className={styles.templateImage}>
                            <NewsImage
                              src={template.thumbnailUrl}
                              className={styles.photo}
                              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                            />
                            <span className={styles.imageLabel}>
                              <Scissors size={12} />
                              CapCut Template
                            </span>
                          </div>
                          <div className={styles.courseBody}>
                            <h4>{template.title}</h4>
                            <p>{plain(template.description)}</p>
                            {externalLink(template.capcutLink) ? (
                              <a
                                className={styles.cardAction}
                                href={externalLink(template.capcutLink)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${vi ? "Sử dụng mẫu" : "Use template"}: ${template.title} (${vi ? "mở tab mới" : "opens a new tab"})`}
                              >
                                {vi ? "Sử dụng mẫu" : "Use template"}
                                <ArrowUpRight size={17} />
                              </a>
                            ) : (
                              <span className={styles.unavailable}>
                                {vi
                                  ? "Liên kết đang cập nhật"
                                  : "Link coming soon"}
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                  </div>
                  {templateLimit < filteredTemplates.length && (
                    <div className={styles.loadMore}>
                      <span>
                        {vi ? "Đang hiển thị" : "Showing"}{" "}
                        {Math.min(templateLimit, filteredTemplates.length)} /{" "}
                        {filteredTemplates.length} {vi ? "mẫu" : "templates"}
                      </span>
                      <button
                        onClick={() => setTemplateLimit((value) => value + 6)}
                      >
                        {vi ? "Khám phá thêm mẫu" : "Explore more templates"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
      <aside className={styles.closing}>
        <Image
          src="/PAGES/LISTEN.webp"
          alt=""
          fill
          sizes="100vw"
          className={styles.closingBackground}
        />
        <div className={styles.closingContent}>
          <span className={styles.eyebrow}>Create with confidence</span>
          <h2>
            {vi
              ? "Bạn có một câu chuyện đáng được lắng nghe."
              : "Your story deserves to be heard."}
          </h2>
          <p>
            {vi
              ? "Bắt đầu từ điều bạn hiểu rõ nhất: chính mình. Creator Lab đồng hành cùng bạn trên từng bước sáng tạo."
              : "Start with what you know best: yourself. Creator Lab is here for every step of your creative journey."}
          </p>
          <a href="#lab-library" onClick={() => switchTab("courses")}>
            {vi ? "Bắt đầu hành trình của bạn" : "Start your journey"}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </aside>
    </main>
  );
}
