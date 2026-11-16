"use client";

import { useState } from "react";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowRight, ChevronRight } from "lucide-react";
import NewsImage from "./NewsImage";
import { homeBeVietnam } from "@/lib/home-fonts";
import styles from "./news-hero.module.css";

const calvera = localFont({
  src: "../../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-news-calvera",
});
export type HeroPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
  readingMinutes?: number;
};
const categoryNames: Record<string, string> = {
  "the-thao": "Sports",
  "su-kien": "Events",
  "creator-lab": "Creator Lab",
};
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export default function NewsHero({
  posts,
  locale,
}: {
  posts: HeroPost[];
  locale: string;
}) {
  const vi = locale === "vi";
  const [selected, setSelected] = useState(0);
  const active = Math.min(selected, Math.max(0, posts.length - 1));
  const post = posts[active];
  const date = post ? new Date(post.publishedAt || post.createdAt) : null;
  const href = post ? `/${locale}/news/${post.slug}` : `/${locale}/news`;
  return (
    <section
      className={`${styles.hero} ${calvera.variable} ${homeBeVietnam.variable}`}
      aria-labelledby="news-page-heading"
    >
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={vi ? "Đường dẫn" : "Breadcrumb"}
        >
          <Link href={`/${locale}`}>{vi ? "Trang chủ" : "Home"}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">
            {vi ? "Tin tức & Sự kiện" : "News & Events"}
          </span>
        </nav>
        <div className={styles.heading}>
          <h1 id="news-page-heading">
            {vi ? "TIN TỨC & SỰ KIỆN" : "NEWS & EVENTS"}
          </h1>
          <p>
            {vi
              ? "Cập nhật tin tức, giải đấu, thành tích và các hoạt động nổi bật của cộng đồng thể thao người khuyết tật Việt Nam."
              : "News, tournaments, achievements and highlights from Vietnam's sports community for people with disabilities."}
          </p>
        </div>
        {post && (
          <div
            className={styles.carousel}
            role="region"
            aria-roledescription={vi ? "trình chiếu" : "carousel"}
            aria-label={vi ? "Tin tức nổi bật" : "Featured news"}
          >
            <article className={styles.card} key={post.id}>
              <Link
                href={href}
                className={styles.image}
                aria-label={post.title}
              >
                <NewsImage
                  src={post.thumbnail}
                  className={styles.photo}
                  sizes="(max-width:767px) 100vw, (max-width:1440px) 60vw, 800px"
                  priority
                />
              </Link>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.category}>
                    {vi
                      ? post.category?.name || "Tin tức"
                      : categoryNames[post.category?.slug || ""] ||
                        post.category?.name ||
                        "News"}
                  </span>
                  {date && !Number.isNaN(date.getTime()) && (
                    <>
                      <i aria-hidden="true" />
                      <time dateTime={post.publishedAt || post.createdAt}>
                        {date.toLocaleDateString(vi ? "vi-VN" : "en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "Asia/Ho_Chi_Minh",
                        })}
                      </time>
                    </>
                  )}
                  {!!post.readingMinutes && (
                    <>
                      <i aria-hidden="true" />
                      <span>
                        {post.readingMinutes} {vi ? "phút đọc" : "min read"}
                      </span>
                    </>
                  )}
                </div>
                <h2>
                  <Link href={href}>{post.title}</Link>
                </h2>
                {post.excerpt && <p>{plain(post.excerpt)}</p>}
                <Link href={href} className={styles.read}>
                  {vi ? "Đọc bài viết" : "Read article"}
                  <span aria-hidden="true">
                    <ArrowRight size={17} />
                  </span>
                </Link>
              </div>
            </article>
            {posts.length > 1 && (
              <div
                className={styles.dots}
                role="group"
                aria-label={vi ? "Chọn tin nổi bật" : "Choose featured news"}
              >
                {posts.map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-label={`${vi ? "Xem tin" : "Show story"} ${index + 1}: ${item.title}`}
                    aria-pressed={active === index}
                    onClick={() => setSelected(index)}
                  />
                ))}
              </div>
            )}
            <span className={styles.srOnly} role="status" aria-live="polite">
              {active + 1} / {posts.length}: {post.title}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
