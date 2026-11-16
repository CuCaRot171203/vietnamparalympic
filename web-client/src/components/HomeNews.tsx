"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getApiUrl } from "@/utils/api";
import { safeMediaUrl } from "@/lib/organizations";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import styles from "./home-news.module.css";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt: string;
  category?: { name: string };
};
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
function PostImage({ src, large = false }: { src?: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={(!failed && safeMediaUrl(src)) || "/PAGES/NEWS.jpg"}
      alt=""
      fill
      unoptimized
      sizes={
        large ? "(max-width:767px) 100vw, 50vw" : "(max-width:767px) 50vw, 25vw"
      }
      className={styles.photo}
      onError={() => setFailed(true)}
    />
  );
}
function PostMeta({ post, language }: { post: Post; language: string }) {
  const date = new Date(post.createdAt);
  return (
    <div className={styles.meta}>
      <span>
        {post.category?.name || (language === "vi" ? "Tin tức" : "News")}
      </span>
      {!Number.isNaN(date.getTime()) && (
        <>
          <i aria-hidden="true" />
          <time dateTime={post.createdAt}>
            {date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-GB")}
          </time>
        </>
      )}
    </div>
  );
}

export default function HomeNews({ language }: { language: string }) {
  const vi = language === "vi";
  const [category, setCategory] = useState(0);
  const [active, setActive] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categories = vi
    ? ["Tất cả", "Thể thao", "Sự kiện"]
    : ["All", "Sports", "Events"];
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    const slug = ["", "the-thao", "su-kien"][category];
    setLoading(true);
    setError(false);
    setActive(0);
    fetch(
      getApiUrl(
        `/posts/paginated?limit=5${slug ? `&categorySlug=${slug}` : ""}`,
      ),
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load news");
        const body = await response.json();
        const data = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(data)) throw new Error("Invalid news response");
        if (current)
          setPosts(data.filter((post: Post) => post.slug).slice(0, 5));
      })
      .catch(() => {
        if (current) {
          setError(true);
          setPosts([]);
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [category, language, retry]);
  const slides = posts.slice(0, 3);
  const featured = slides[Math.min(active, Math.max(0, slides.length - 1))];
  const related = posts.filter((post) => post.id !== featured?.id).slice(0, 2);
  return (
    <section
      id="home-news"
      aria-labelledby="news-heading"
      className={`${styles.section} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
    >
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.badge}>
              <span aria-hidden="true" />
              {vi ? "Tin tức & Sự kiện" : "News & Events"}
            </span>
            <h2 id="news-heading">
              {vi ? "NHỊP ĐẬP PARASPORTS" : "THE PARASPORTS PULSE"}
            </h2>
            <p>
              {vi
                ? "Cập nhật tin tức, giải đấu, thành tích và các hoạt động nổi bật của cộng đồng thể thao người khuyết tật Việt Nam."
                : "News, tournaments, achievements and highlights from Vietnam's sports community for people with disabilities."}
            </p>
          </div>
          <Link href={`/${language}/news`} className={styles.viewAll}>
            {vi ? "Xem tất cả tin tức" : "View all news"}
            <span aria-hidden="true">
              <ArrowRight size={17} />
            </span>
          </Link>
        </header>
        <div
          className={styles.filters}
          role="tablist"
          aria-label={vi ? "Chuyên mục tin tức" : "News categories"}
        >
          {categories.map((name, index) => (
            <button
              type="button"
              id={`home-news-tab-${index}`}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              key={index}
              role="tab"
              aria-selected={category === index}
              aria-controls="home-news-panel"
              tabIndex={category === index ? 0 : -1}
              onClick={() => setCategory(index)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 2
                      : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
                setCategory(next);
                tabRefs.current[next]?.focus();
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div
          id="home-news-panel"
          role="tabpanel"
          aria-labelledby={`home-news-tab-${category}`}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.srOnly} role="status">
                {vi ? "Đang tải tin tức…" : "Loading news…"}
              </span>
              <div className={styles.skeleton} aria-hidden="true">
                <div />
                <div />
              </div>
            </>
          ) : error ? (
            <div className={styles.empty} role="status">
              <p>{vi ? "Chưa thể tải tin tức." : "Unable to load news."}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
              >
                {vi ? "Thử lại" : "Try again"}
              </button>
            </div>
          ) : !featured ? (
            <p className={styles.empty} role="status">
              {vi
                ? "Chưa có bài viết trong chuyên mục này."
                : "No articles in this category yet."}
            </p>
          ) : (
            <div className={styles.layout}>
              <div className={styles.spotlight}>
                <Link
                  href={`/${language}/news/${featured.slug}`}
                  className={styles.featuredImage}
                  aria-label={featured.title}
                  key={featured.id}
                >
                  <PostImage src={featured.thumbnail} large />
                </Link>
                {slides.length > 1 && (
                  <div
                    className={styles.dots}
                    role="group"
                    aria-label={
                      vi ? "Chọn tin nổi bật" : "Choose a featured story"
                    }
                  >
                    {slides.map((post, index) => (
                      <button
                        type="button"
                        key={post.id}
                        aria-label={`${vi ? "Xem tin nổi bật" : "Show featured story"} ${index + 1}: ${post.title}`}
                        aria-pressed={index === active}
                        onClick={() => setActive(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <article className={styles.featuredStory}>
                  <PostMeta post={featured} language={language} />
                  <h3>
                    <Link href={`/${language}/news/${featured.slug}`}>
                      {featured.title}
                    </Link>
                  </h3>
                  <p>
                    {plain(featured.excerpt) ||
                      (vi
                        ? "Khám phá câu chuyện và những cập nhật mới nhất từ cộng đồng ParaSports."
                        : "Discover the latest stories from the ParaSports community.")}
                  </p>
                  <Link
                    href={`/${language}/news/${featured.slug}`}
                    className={styles.read}
                  >
                    {vi ? "Đọc tiếp" : "Read more"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
                {!!related.length && (
                  <div className={styles.related}>
                    {related.map((post) => (
                      <article className={styles.smallStory} key={post.id}>
                        <Link
                          href={`/${language}/news/${post.slug}`}
                          className={styles.smallImage}
                          aria-label={post.title}
                        >
                          <PostImage src={post.thumbnail} />
                        </Link>
                        <PostMeta post={post} language={language} />
                        <h4>
                          <Link href={`/${language}/news/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h4>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
