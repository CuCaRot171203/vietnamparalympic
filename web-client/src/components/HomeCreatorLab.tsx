"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, FileText } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { safeMediaUrl } from "@/lib/organizations";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import styles from "./home-creator-lab.module.css";

type Course = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  lessonCount?: number;
  totalDuration?: number;
  enrolledCount?: number;
};
type Document = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
  attachments?: { id: string }[];
};
type Resource = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  kind: "courses" | "documents";
  lessonCount?: number;
  totalDuration?: number;
  enrolledCount?: number;
  attachmentCount?: number;
};
function unwrap<T>(data?: T[] | { data: T[] }): T[] {
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
}
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
function ResourceImage({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={
        (!failed && safeMediaUrl(src)) ||
        "/assets/homepage/creator-lab-launch.jpg"
      }
      alt=""
      fill
      sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw"
      unoptimized
      className={styles.cardPhoto}
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeCreatorLab({ language }: { language: string }) {
  const vi = language === "vi";
  const coursesApi = useApi<Course[] | { data: Course[] }>("/courses");
  const docsApi = useApi<Document[] | { data: Document[] }>("/documents");
  const courses: Resource[] = unwrap(coursesApi.data)
    .filter((item) => item.slug)
    .map((item) => ({ ...item, kind: "courses" }));
  const docs: Resource[] = unwrap(docsApi.data)
    .filter((item) => item.isPublic !== false && item.slug)
    .map((item) => ({
      ...item,
      kind: "documents",
      description: item.content,
      thumbnail: item.thumbnailUrl,
      attachmentCount: item.attachments?.length,
    }));
  const featured = [
    ...courses.slice(0, 2),
    ...docs.slice(0, 1),
    ...courses.slice(2),
    ...docs.slice(1),
  ].slice(0, 3);
  const loading = coursesApi.isLoading || docsApi.isLoading;
  const error = coursesApi.error || docsApi.error;
  const steps = vi
    ? [
        [
          "Học điều mới",
          "Khóa học ngắn về hình ảnh cá nhân và kỹ năng xây kênh.",
        ],
        [
          "Tạo dấu ấn riêng",
          "Thực hành với tài liệu, kịch bản và mẫu CapCut có sẵn.",
        ],
        ["Lan tỏa giá trị", "Kể câu chuyện thể thao của bạn tới cộng đồng."],
      ]
    : [
        [
          "Learn something new",
          "Short courses on personal branding and building your channel.",
        ],
        [
          "Make your mark",
          "Practise with ready-to-use resources, scripts and CapCut templates.",
        ],
        ["Share your impact", "Bring your sports story to the community."],
      ];
  return (
    <section
      id="home-creator-lab"
      aria-labelledby="home-creator-heading"
      className={`${styles.section} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
    >
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.intro}>
            <span className={styles.badge}>
              <span aria-hidden="true" />
              Vietnam Creator Lab
            </span>
            <h2 id="home-creator-heading">VIETNAM CREATOR LAB</h2>
            <p className={styles.subtitle}>
              {vi
                ? "Không gian học tập và sáng tạo nội dung, đồng hành cùng vận động viên phát triển kỹ năng truyền thông số và chủ động chia sẻ câu chuyện thể thao của mình."
                : "A space to learn and create, helping athletes build digital communication skills and share their own sports stories."}
            </p>
            <ol className={styles.steps}>
              {steps.map(([title, detail], index) => (
                <li key={title}>
                  <span className={styles.number} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={`/${language}/creator-lab`} className={styles.explore}>
              {vi ? "Khám phá Creator Lab" : "Explore Creator Lab"}
              <span aria-hidden="true">
                <ArrowRight size={17} />
              </span>
            </Link>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="/assets/homepage/creator-lab-summit.jpg"
              alt={
                vi
                  ? "Các đại biểu và vận động viên tại Vietnam ParaSports Creator Lab Summit"
                  : "Athletes and guests at Vietnam ParaSports Creator Lab Summit"
              }
              fill
              sizes="(max-width:767px) 100vw, 50vw"
              className={styles.photo}
            />
          </div>
        </div>
        <div className={styles.featuredHeading}>
          <h3 id="home-learning-heading">
            {vi ? "Nội dung học tập nổi bật" : "Featured learning resources"}
          </h3>
          <Link href={`/${language}/creator-lab`}>
            {vi ? "Xem thư viện sáng tạo" : "Explore the library"}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div aria-labelledby="home-learning-heading" aria-busy={loading}>
          {loading ? (
            <>
              <span className={styles.srOnly} role="status">
                {vi ? "Đang tải nội dung học tập…" : "Loading resources…"}
              </span>
              <div className={styles.grid} aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <div className={styles.skeleton} key={index} />
                ))}
              </div>
            </>
          ) : !featured.length ? (
            <div className={styles.empty} role="status">
              <p>
                {error
                  ? vi
                    ? "Chưa thể tải nội dung học tập."
                    : "Unable to load resources."
                  : vi
                    ? "Nội dung học tập đang được cập nhật."
                    : "New learning resources are on the way."}
              </p>
              {error && (
                <button
                  type="button"
                  onClick={() => {
                    void coursesApi.mutate();
                    void docsApi.mutate();
                  }}
                >
                  {vi ? "Thử lại" : "Try again"}
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {featured.map((item) => {
                const course = item.kind === "courses";
                const href = `/${language}/creator-lab/${item.kind}/${item.slug}`;
                return (
                  <article
                    className={styles.card}
                    key={`${item.kind}-${item.id}`}
                  >
                    <Link
                      href={href}
                      className={styles.cardImage}
                      aria-label={item.title}
                    >
                      <ResourceImage src={item.thumbnail} />
                      <span className={styles.kind}>
                        {course
                          ? vi
                            ? "Khóa học"
                            : "Course"
                          : vi
                            ? "Tài liệu"
                            : "Resource"}
                      </span>
                    </Link>
                    <div className={styles.cardBody}>
                      <p className={styles.meta}>
                        {course
                          ? `${item.lessonCount ?? 0} ${vi ? "bài học" : "lessons"}${item.totalDuration && item.totalDuration > 0 ? ` · ${Math.ceil(item.totalDuration / 60)} ${vi ? "phút" : "min"}` : ""}`
                          : vi
                            ? "Tài liệu thực hành"
                            : "Practical resources"}
                      </p>
                      <h4>
                        <Link href={href}>{item.title}</Link>
                      </h4>
                      <p className={styles.description}>
                        {plain(item.description) ||
                          (vi
                            ? "Khám phá kiến thức và cảm hứng sáng tạo cùng Creator Lab."
                            : "Find knowledge and inspiration with Creator Lab.")}
                      </p>
                      <div className={styles.cardFooter}>
                        <span>
                          {course ? (
                            <Users size={14} aria-hidden="true" />
                          ) : (
                            <FileText size={14} aria-hidden="true" />
                          )}
                          {course
                            ? `${item.enrolledCount ?? 0} ${vi ? "học viên" : "learners"}`
                            : `${item.attachmentCount ?? 0} ${vi ? "tệp đính kèm" : "attachments"}`}
                        </span>
                        <Link href={href}>
                          {course
                            ? vi
                              ? "Học ngay"
                              : "Start learning"
                            : vi
                              ? "Xem tài liệu"
                              : "Read more"}
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
