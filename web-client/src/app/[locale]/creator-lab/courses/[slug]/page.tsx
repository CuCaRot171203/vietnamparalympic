import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Play,
  Users,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import CourseEnrollmentSection from "@/components/CourseEnrollmentSection";
import NewsImage from "@/components/news/NewsImage";
import styles from "../../detail.module.css";

type Lesson = { id: string; slug?: string; title: string; duration?: number };
type Chapter = { id: string; title: string; lessons?: Lesson[] };
type Course = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  learningObjectives?: string;
  requirements?: string;
  chapters?: Chapter[];
  lessonCount?: number;
  totalDuration?: number;
  enrolledCount?: number;
};
type Props = { params: Promise<{ locale: string; slug: string }> };
const getCourse = cache(async (slug: string) => {
  try {
    const res = await apiClient.request(
      `/courses/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    return {
      course: res.ok ? ((await res.json()) as Course) : null,
      status: res.status,
    };
  } catch {
    return { course: null, status: 0 };
  }
});
const plain = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const lines = (value?: string) =>
  value?.split("\n").map(plain).filter(Boolean) || [];
function duration(seconds: number) {
  if (seconds <= 0) return "";
  if (seconds < 60) return `${seconds} giây`;
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60);
  return [h ? `${h} giờ` : "", m ? `${m} phút` : ""].filter(Boolean).join(" ");
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { course } = await getCourse(slug);
  return {
    title: `${course?.title || "Khóa học"} | Vietnam Creator Lab`,
    description: plain(course?.description),
  };
}
export default async function CourseDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const { course, status } = await getCourse(slug);
  if (status === 404) notFound();
  if (!course)
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <h1>Chưa thể tải khóa học</h1>
            <p>Vui lòng thử lại sau ít phút.</p>
            <a href={`/${locale}/creator-lab/courses/${slug}`}>Tải lại trang</a>
          </div>
        </div>
      </main>
    );
  const chapters = course.chapters || [],
    lessons = chapters.flatMap((c) => c.lessons || []),
    firstLesson = lessons[0],
    objectives = lines(course.learningObjectives),
    requirements = lines(course.requirements),
    count = course.lessonCount ?? lessons.length,
    total =
      course.totalDuration ??
      lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Điều hướng trang">
          <Link href={`/${locale}/creator-lab?tab=courses`}>
            <ArrowLeft size={14} /> Creator Lab
          </Link>
          <span>/</span>
          <span>Khóa học</span>
        </nav>
        <header className={styles.hero}>
          <div>
            <Link className={styles.brand} href={`/${locale}/creator-lab`}>
              <Image
                src="/KV/logo vncl.png"
                alt="Vietnam Creator Lab"
                width={2071}
                height={555}
                sizes="200px"
                priority
              />
            </Link>
            <p className={styles.eyebrow}>
              Học hỏi hôm nay. Vững bước ngày mai.
            </p>
            <h1>{course.title}</h1>
            <p className={styles.description}>{plain(course.description)}</p>
            <div className={styles.facts}>
              <span>
                <BookOpen size={15} />
                {chapters.length} chương · {count} bài học
              </span>
              {total > 0 && (
                <span>
                  <Clock3 size={15} />
                  {duration(total)}
                </span>
              )}
              <span>
                <Users size={15} />
                {course.enrolledCount ?? 0} học viên
              </span>
            </div>
            <a className={styles.textLink} href="#curriculum">
              Khám phá nội dung khóa học <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={styles.heroMedia}>
            <NewsImage
              src={course.thumbnail}
              className={styles.cover}
              sizes="(max-width:767px) 100vw, 45vw"
              priority
            />
            <span className={styles.mediaLabel}>
              <BookOpen size={16} /> Không ngừng học hỏi, không ngừng tiến xa.
            </span>
          </div>
        </header>
        <div className={styles.layout}>
          <div>
            {objectives.length > 0 && (
              <section className={styles.section}>
                <p className={styles.eyebrow}>Kiến thức thành hành động</p>
                <h2>Bạn sẽ học được gì?</h2>
                <ul className={styles.objectives}>
                  {objectives.map((text, i) => (
                    <li key={i}>
                      <Check size={17} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className={styles.section} id="curriculum">
              <p className={styles.eyebrow}>Từng bước xây nền tảng</p>
              <h2>Nội dung khóa học</h2>
              <p className={styles.muted}>
                {chapters.length} chương · {count} bài học
                {total > 0 ? ` · ${duration(total)}` : ""}
              </p>
              <div className={styles.chapters}>
                {!chapters.length ? (
                  <p className={styles.empty}>
                    Khóa học đang được cập nhật nội dung.
                  </p>
                ) : (
                  chapters.map((chapter, i) => (
                    <details key={chapter.id} open={i === 0}>
                      <summary>
                        <span className={styles.chapterNumber}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>
                          {chapter.title}
                          <small>{chapter.lessons?.length || 0} bài học</small>
                        </span>
                        <ChevronDown size={18} />
                      </summary>
                      <ul>
                        {chapter.lessons?.length ? (
                          chapter.lessons.map((lesson, index) => (
                            <li key={lesson.id}>
                              <Link
                                href={`/${locale}/creator-lab/courses/${course.slug}/learn/${lesson.slug || lesson.id}`}
                              >
                                <Play size={14} />
                                <span>
                                  <small>Bài {index + 1}</small>
                                  {lesson.title}
                                </span>
                                {!!lesson.duration && (
                                  <time>
                                    {Math.floor(lesson.duration / 60)}:
                                    {String(lesson.duration % 60).padStart(
                                      2,
                                      "0",
                                    )}
                                  </time>
                                )}
                                <ArrowUpRight size={14} />
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li className={styles.empty}>
                            Đang cập nhật bài giảng.
                          </li>
                        )}
                      </ul>
                    </details>
                  ))
                )}
              </div>
            </section>
            {requirements.length > 0 && (
              <section className={styles.section}>
                <p className={styles.eyebrow}>Sẵn sàng trước khi bắt đầu</p>
                <h2>Bạn cần chuẩn bị</h2>
                <ol className={styles.requirements}>
                  {requirements.map((text, i) => (
                    <li key={i}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {text}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
          <aside>
            <div className={styles.sideCard}>
              <span className={styles.roundIcon}>
                <BookOpen size={24} strokeWidth={1.5} />
              </span>
              <p className={styles.eyebrow}>Vietnam Creator Lab</p>
              <h2>Bắt đầu hành trình học tập của bạn.</h2>
              <p>
                Khám phá kiến thức, rèn luyện kỹ năng và chủ động tiến xa hơn
                trong thể thao.
              </p>
              <CourseEnrollmentSection
                locale={locale}
                courseId={course.id}
                courseSlug={course.slug}
                firstLessonId={firstLesson?.id}
                firstLessonSlug={firstLesson?.slug}
              />
              <dl>
                <div>
                  <dt>Nội dung</dt>
                  <dd>{chapters.length} chương</dd>
                </div>
                <div>
                  <dt>Bài giảng</dt>
                  <dd>{count} bài học</dd>
                </div>
                {total > 0 && (
                  <div>
                    <dt>Thời lượng</dt>
                    <dd>{duration(total)}</dd>
                  </div>
                )}
              </dl>
              <Link
                className={styles.textLink}
                href={`/${locale}/creator-lab?tab=courses`}
              >
                Khám phá thêm khóa học <ArrowUpRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
