"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import NewsImage from "./NewsImage";
import { getApiUrl } from "@/utils/api";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import styles from "./news-feed.module.css";

export type FeedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
};
type PageResult = {
  data: FeedPost[];
  meta: { total: number; totalPages?: number };
};
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
async function getPage(
  page: number,
  category: string,
  search: string,
  signal: AbortSignal,
): Promise<PageResult> {
  // Fetch a growing prefix: the API sorts only by createdAt, so offset pages
  // can overlap when articles share a timestamp. Merge by id to keep existing
  // cards in place and reveal six new articles at each step.
  const params = new URLSearchParams({ page: "1", limit: String(page * 6) });
  if (category) params.set("categorySlug", category);
  if (search) params.set("search", search);
  const response = await fetch(getApiUrl(`/posts/paginated?${params}`), {
    signal,
  });
  if (!response.ok) throw new Error("Unable to load news");
  const body = await response.json();
  if (!Array.isArray(body.data) || !body.meta)
    throw new Error("Invalid news response");
  return {
    data: body.data.filter((post: FeedPost) => post.slug),
    meta: body.meta,
  };
}

export default function NewsFeed({
  locale,
  initialPosts,
  initialTotal,
  initialError = false,
  initialSearch = "",
  initialCategory = "",
}: {
  locale: string;
  initialPosts: FeedPost[];
  initialTotal: number;
  initialError?: boolean;
  initialSearch?: string;
  initialCategory?: string;
}) {
  const vi = locale === "vi";
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [input, setInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < initialTotal);
  const [error, setError] = useState(initialError);
  const [moreError, setMoreError] = useState(false);
  const [retry, setRetry] = useState(0);
  const version = useRef(0);
  const moreController = useRef<AbortController | null>(null);
  const tabs = [
    { value: "", name: vi ? "Tất cả" : "All" },
    { value: "the-thao", name: vi ? "Thể thao" : "Sports" },
    { value: "su-kien", name: vi ? "Sự kiện" : "Events" },
  ];
  const format = (value: number) =>
    value.toLocaleString(vi ? "vi-VN" : "en-GB");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 350);
    return () => clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    const controller = new AbortController();
    const current = ++version.current;
    moreController.current?.abort();
    setLoadingMore(false);
    setMoreError(false);
    setPage(1);
    if (
      category === initialCategory &&
      search === initialSearch &&
      retry === 0
    ) {
      setPosts(initialPosts);
      setTotal(initialTotal);
      setError(initialError);
      setHasMore(initialPosts.length < initialTotal);
      setLoading(false);
    } else {
      setLoading(true);
      setError(false);
      getPage(1, category, search, controller.signal)
        .then((result) => {
          if (version.current === current) {
            setPosts(result.data);
            setTotal(result.meta.total);
            setHasMore(
              result.data.length > 0 && result.data.length < result.meta.total,
            );
          }
        })
        .catch(() => {
          if (!controller.signal.aborted && version.current === current) {
            setPosts([]);
            setTotal(0);
            setHasMore(false);
            setError(true);
          }
        })
        .finally(() => {
          if (version.current === current) setLoading(false);
        });
    }
    return () => {
      controller.abort();
      moreController.current?.abort();
      if (version.current === current) version.current++;
    };
  }, [
    category,
    search,
    retry,
    initialCategory,
    initialSearch,
    initialPosts,
    initialTotal,
    initialError,
  ]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("page");
    params.delete("search");
    if (search) params.set("q", search);
    else params.delete("q");
    if (category) params.set("category", category);
    else params.delete("category");
    const url = `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`;
    if (
      url !==
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    )
      window.history.replaceState(null, "", url);
  }, [category, search]);
  const loadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    const current = version.current;
    const controller = new AbortController();
    moreController.current = controller;
    setLoadingMore(true);
    setMoreError(false);
    try {
      const result = await getPage(
        page + 1,
        category,
        search,
        controller.signal,
      );
      if (version.current !== current || controller.signal.aborted) return;
      setPosts((previous) =>
        [
          ...new Map(
            [...previous, ...result.data].map((post) => [post.id, post]),
          ).values(),
        ].slice(0, (page + 1) * 6),
      );
      setTotal(result.meta.total);
      setPage(page + 1);
      setHasMore(result.data.length > 0 && (page + 1) * 6 < result.meta.total);
    } catch {
      if (version.current === current && !controller.signal.aborted)
        setMoreError(true);
    } finally {
      if (version.current === current) setLoadingMore(false);
    }
  };
  const clear = () => {
    setCategory("");
    setInput("");
    setSearch("");
  };
  return (
    <section
      id="news-feed"
      aria-labelledby="news-feed-heading"
      className={`${styles.feed} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
    >
      <div className={styles.container}>
        <header className={styles.heading}>
          <span className={styles.badge}>
            <span aria-hidden="true" />
            Vietnam Creator Lab
          </span>
          <h2 id="news-feed-heading">
            {vi ? (
              <>
                MỚI TRÊN VIETNAM
                <br />
                PARASPORTS
              </>
            ) : (
              <>
                LATEST ON VIETNAM
                <br />
                PARASPORTS
              </>
            )}
          </h2>
        </header>
        <div className={styles.toolbar}>
          <div
            className={styles.categories}
            role="group"
            aria-label={vi ? "Chuyên mục tin tức" : "News categories"}
          >
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.value}
                aria-pressed={category === tab.value}
                onClick={() => setCategory(tab.value)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <form
            className={styles.search}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(input.trim());
            }}
          >
            <button
              type="submit"
              aria-label={vi ? "Tìm kiếm bài viết" : "Search articles"}
            >
              <Search size={18} strokeWidth={1.7} />
            </button>
            <input
              type="search"
              aria-label={vi ? "Tìm kiếm bài viết" : "Search articles"}
              placeholder={vi ? "Tìm kiếm bài viết..." : "Search articles..."}
              value={input}
              maxLength={200}
              onChange={(event) => setInput(event.target.value)}
            />
          </form>
        </div>
        {(category || search) && (
          <div className={styles.activeFilters}>
            <span>
              {search
                ? vi
                  ? `Kết quả cho “${search}”`
                  : `Results for “${search}”`
                : tabs.find((tab) => tab.value === category)?.name || category}
            </span>
            <button type="button" onClick={clear}>
              {vi ? "Xóa bộ lọc" : "Clear filters"}
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        )}
        <div aria-busy={loading}>
          {loading ? (
            <>
              <span className={styles.srOnly} role="status">
                {vi ? "Đang tải bài viết…" : "Loading articles…"}
              </span>
              <div className={styles.grid} aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <div className={styles.skeleton} key={index} />
                ))}
              </div>
            </>
          ) : error ? (
            <div className={styles.empty} role="status">
              <p>
                {vi
                  ? "Chưa thể tải danh sách bài viết."
                  : "Unable to load articles."}
              </p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
              >
                {vi ? "Thử lại" : "Try again"}
              </button>
            </div>
          ) : !posts.length ? (
            <div className={styles.empty} role="status">
              <p>
                {vi
                  ? "Chưa tìm thấy bài viết phù hợp."
                  : "No matching articles found."}
              </p>
              <button type="button" onClick={clear}>
                {vi ? "Xem tất cả bài viết" : "View all articles"}
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {posts.map((post) => {
                const date = new Date(post.publishedAt || post.createdAt);
                const href = `/${locale}/news/${post.slug}`;
                return (
                  <article className={styles.card} key={post.id}>
                    <Link
                      className={styles.image}
                      href={href}
                      aria-label={post.title}
                    >
                      <NewsImage
                        src={post.thumbnail}
                        className={styles.photo}
                        sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 33vw"
                      />
                    </Link>
                    <div className={styles.body}>
                      <div className={styles.meta}>
                        <span>
                          {vi
                            ? post.category?.name || "Tin tức"
                            : {
                                "the-thao": "Sports",
                                "su-kien": "Events",
                                "creator-lab": "Creator Lab",
                              }[post.category?.slug || ""] ||
                              post.category?.name ||
                              "News"}
                        </span>
                        {!Number.isNaN(date.getTime()) && (
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
                      </div>
                      <h3>
                        <Link href={href}>{post.title}</Link>
                      </h3>
                      {post.excerpt && <p>{plain(post.excerpt)}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        {!loading && !error && posts.length > 0 && (
          <>
            <p className={styles.count} role="status" aria-live="polite">
              {vi ? "Đang hiển thị" : "Showing"} {format(posts.length)} /{" "}
              {format(total)} {vi ? "bài viết" : "articles"}
            </p>
            {moreError && (
              <p className={styles.moreError} role="alert">
                {vi
                  ? "Chưa thể tải thêm bài viết. Vui lòng thử lại."
                  : "Unable to load more articles. Please try again."}
              </p>
            )}
            {hasMore && (
              <button
                type="button"
                className={styles.more}
                disabled={loadingMore}
                onClick={() => {
                  void loadMore();
                }}
              >
                {loadingMore
                  ? vi
                    ? "Đang tải…"
                    : "Loading…"
                  : vi
                    ? "Xem thêm bài viết"
                    : "Load more articles"}
                <ChevronDown size={18} aria-hidden="true" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
