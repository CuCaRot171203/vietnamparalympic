import Link from "next/link";
import Image from "next/image";
import Form from "next/form";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Newspaper,
  X,
} from "lucide-react";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import NewsSportsRail from "@/components/news/NewsSportsRail";
import type { NewsSport } from "@/components/news/NewsSportsRail";
import NewsImage from "@/components/news/NewsImage";
import styles from "./news.module.css";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
  author?: { fullName: string } | null;
}
interface Category {
  id: string;
  name: string;
  slug: string;
}
const categoryTitles: Record<string, string> = {
  "the-thao": "Sports",
  "su-kien": "Events",
  "creator-lab": "Creator Lab",
};
interface PostsPage {
  data: Post[];
  meta: { total: number; totalPages: number; page: number; limit: number };
}
interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function readPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await apiClient.request(path, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Could not load news resource ${path}`, error);
    return null;
  }
}

export async function generateMetadata({ params }: Pick<PageProps, "params">) {
  const { locale } = await params;
  return {
    title:
      locale === "en"
        ? "News & stories | Vietnam ParaSports"
        : "Tin tức & câu chuyện | Vietnam ParaSports",
    description:
      locale === "en"
        ? "News, competitions and stories from Vietnam's disability sports community."
        : "Cập nhật tin tức, giải đấu và những câu chuyện từ cộng đồng thể thao người khuyết tật Việt Nam.",
  };
}

function articleDate(post: Post, locale: string) {
  const value = post.publishedAt || post.createdAt;
  const date = new Date(value);
  return {
    value,
    label: Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        }),
  };
}
function pagination(page: number, last: number) {
  const pages = [...new Set([1, page - 1, page, page + 1, last])]
    .filter((value) => value >= 1 && value <= last)
    .sort((a, b) => a - b);
  return pages.flatMap((value, index): (number | string)[] =>
    index > 0 && value - pages[index - 1] > 1
      ? [`gap-${value}`, value]
      : [value],
  );
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const vi = locale === "vi";
  const scalar = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : "";
  const parsedPage = Number(scalar(query.page));
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = scalar(query.q || query.search)
    .trim()
    .slice(0, 200);
  const category = scalar(query.category).trim();
  const requestParams = new URLSearchParams({
    page: String(page),
    limit: "12",
  });
  if (search) requestParams.set("search", search);
  if (category) requestParams.set("categorySlug", category);
  const [result, sportsData, categoriesData] = await Promise.all([
    readPublic<PostsPage>(`/posts/paginated?${requestParams}`),
    readPublic<NewsSport[]>("/sports"),
    readPublic<Category[]>("/categories"),
  ]);
  const posts = Array.isArray(result?.data) ? result.data : [];
  const total = Math.max(0, Number(result?.meta?.total) || 0);
  const lastPage = Math.max(1, Number(result?.meta?.totalPages) || 1);
  const sports = Array.isArray(sportsData)
    ? sportsData.filter((sport) => sport.slug !== "rowing")
    : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const base = `/${locale}/news`;
  const href = (
    targetPage = 1,
    targetCategory = category,
    targetSearch = search,
  ) => {
    const values = new URLSearchParams();
    if (targetSearch) values.set("q", targetSearch);
    if (targetCategory) values.set("category", targetCategory);
    if (targetPage > 1) values.set("page", String(targetPage));
    return `${base}${values.size ? `?${values}` : ""}`;
  };
  if (result && page > lastPage) redirect(`${href(lastPage)}#news-feed`);
  const featured =
    page === 1 && !search && !category && posts.length >= 4 ? posts[0] : null;
  const spotlights = featured ? posts.slice(1, 3) : [];
  const stories = featured ? posts.slice(3) : posts;
  const format = (value: number) =>
    value.toLocaleString(vi ? "vi-VN" : "en-GB");
  const categoryName = (post: Post) =>
    vi
      ? post.category?.name || "Tin tức"
      : categoryTitles[post.category?.slug || ""] ||
        post.category?.name ||
        "News";
  const categoryLabel = (item: Category) =>
    vi ? item.name : categoryTitles[item.slug] || item.name;
  const postLink = (post: Post) => `/${locale}/news/${post.slug}`;
  const date = (post: Post) => {
    const info = articleDate(post, locale);
    return <time dateTime={info.value}>{info.label}</time>;
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={vi ? "Đường dẫn" : "Breadcrumb"}
        >
          <Link href={`/${locale}`}>{vi ? "Trang chủ" : "Home"}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{vi ? "Tin tức" : "News"}</span>
        </nav>
        <header className={styles.masthead}>
          <Image
            src="/PAGES/NEWS.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1300px"
            className={styles.heroBackground}
          />
          <div>
            <span className={styles.eyebrow}>
              <span />
              Vietnam ParaSports Journal
            </span>
            <h1>
              {vi ? (
                <>
                  Tin tức &<br />
                  những câu chuyện.
                </>
              ) : (
                <>
                  News &<br />
                  the stories behind it.
                </>
              )}
            </h1>
          </div>
          <div className={styles.mastheadAside}>
            <p>
              {vi
                ? "Theo nhịp thể thao, gặp những con người và hành trình truyền cảm hứng. Nơi mỗi câu chuyện đều xứng đáng được lắng nghe."
                : "Follow the sporting world and meet the people and journeys that inspire it. Every story deserves to be heard."}
            </p>
          </div>
        </header>
        <NewsSportsRail sports={sports} locale={locale} />

        {featured && (
          <section
            className={styles.leadGrid}
            aria-label={vi ? "Tin nổi bật" : "Featured stories"}
          >
            <article className={styles.featured}>
              <Link
                href={postLink(featured)}
                className={styles.featureImage}
                aria-label={featured.title}
              >
                <NewsImage
                  src={featured.thumbnail}
                  className={styles.photo}
                  sizes="(max-width: 767px) 100vw, 65vw"
                  priority
                />
                <span className={styles.featureBadge}>
                  {vi ? "Tiêu điểm" : "In focus"}
                </span>
                <span className={styles.featureArrow}>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </span>
              </Link>
              <div className={styles.featureBody}>
                <div className={styles.articleMeta}>
                  <span className={styles.category}>
                    {categoryName(featured)}
                  </span>
                  <span aria-hidden="true">/</span>
                  {date(featured)}
                </div>
                <h2>
                  <Link href={postLink(featured)}>{featured.title}</Link>
                </h2>
                {featured.excerpt && <p>{featured.excerpt}</p>}
                <div className={styles.byline}>
                  <span>
                    {featured.author?.fullName || "Vietnam ParaSports"}
                  </span>
                  <Link href={postLink(featured)}>
                    {vi ? "Đọc câu chuyện" : "Read the story"}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
            <aside
              className={styles.spotlights}
              aria-labelledby="news-spotlight-heading"
            >
              <div className={styles.sideHeading}>
                <h2 id="news-spotlight-heading">
                  {vi ? "Đáng chú ý" : "Worth a read"}
                </h2>
                <span aria-hidden="true">02</span>
              </div>
              {spotlights.map((post) => (
                <article className={styles.sideStory} key={post.id}>
                  <Link
                    className={styles.sideImage}
                    href={postLink(post)}
                    aria-label={post.title}
                  >
                    <NewsImage
                      src={post.thumbnail}
                      className={styles.photo}
                      sizes="(max-width: 767px) 50vw, 30vw"
                    />
                  </Link>
                  <div className={styles.sideBody}>
                    <div className={styles.articleMeta}>
                      <span className={styles.category}>
                        {categoryName(post)}
                      </span>
                      {date(post)}
                    </div>
                    <h3>
                      <Link href={postLink(post)}>{post.title}</Link>
                    </h3>
                  </div>
                </article>
              ))}
            </aside>
          </section>
        )}

        <section
          id="news-feed"
          className={styles.feed}
          aria-labelledby="news-feed-heading"
        >
          <div className={styles.feedHeading}>
            <div>
              <span className={styles.eyebrow}>
                {vi ? "Dòng chảy thể thao" : "The latest from our world"}
              </span>
              <h2 id="news-feed-heading">
                {search || category
                  ? vi
                    ? "Bài viết dành cho bạn"
                    : "Your reading list"
                  : vi
                    ? "Mới trên Vietnam ParaSports"
                    : "Latest on Vietnam ParaSports"}
              </h2>
            </div>
            <span className={styles.resultCount}>
              {format(total)} {vi ? "bài viết" : "articles"}
            </span>
          </div>
          <div className={styles.toolbar}>
            <nav
              className={styles.categories}
              aria-label={vi ? "Chuyên mục tin tức" : "News categories"}
            >
              <Link
                href={`${href(1, "")}#news-feed`}
                data-active={!category}
                aria-current={!category ? "page" : undefined}
              >
                {vi ? "Tất cả" : "All"}
              </Link>
              {categories.map((item) => (
                <Link
                  key={item.id}
                  href={`${href(1, item.slug)}#news-feed`}
                  data-active={category === item.slug}
                  aria-current={category === item.slug ? "page" : undefined}
                >
                  {categoryLabel(item)}
                </Link>
              ))}
            </nav>
            <Form
              action={base}
              className={styles.search}
              key={`${search}-${category}`}
            >
              <input
                type="search"
                name="q"
                defaultValue={search}
                maxLength={200}
                placeholder={
                  vi ? "Tìm câu chuyện bạn quan tâm…" : "Find a story…"
                }
                aria-label={vi ? "Tìm kiếm bài viết" : "Search articles"}
              />
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              <button type="submit" aria-label={vi ? "Tìm kiếm" : "Search"}>
                <Search size={18} />
              </button>
            </Form>
          </div>
          {(search || category) && (
            <div className={styles.activeFilters}>
              <span>
                {search
                  ? vi
                    ? `Kết quả cho “${search}”`
                    : `Results for “${search}”`
                  : categories.find((item) => item.slug === category)?.name ||
                    category}
              </span>
              <Link href={`${base}#news-feed`}>
                {vi ? "Xóa bộ lọc" : "Clear filters"}
                <X size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
          {!result ? (
            <div className={styles.empty}>
              <Newspaper size={28} aria-hidden="true" />
              <h3>
                {vi
                  ? "Chưa thể tải tin tức"
                  : "News is temporarily unavailable"}
              </h3>
              <p>
                {vi
                  ? "Vui lòng thử tải lại trang sau ít phút."
                  : "Please try again in a moment."}
              </p>
              <a href={href()}>
                {vi ? "Thử lại" : "Try again"}
                <ArrowRight size={16} />
              </a>
            </div>
          ) : !posts.length ? (
            <div className={styles.empty}>
              <Search size={28} aria-hidden="true" />
              <h3>
                {vi
                  ? "Chưa tìm thấy bài viết phù hợp"
                  : "No matching stories yet"}
              </h3>
              <p>
                {vi
                  ? "Thử từ khóa khác hoặc khám phá tất cả câu chuyện từ cộng đồng."
                  : "Try another keyword or explore all stories from our community."}
              </p>
              <Link href={`${base}#news-feed`}>
                {vi ? "Xem tất cả bài viết" : "Explore all articles"}
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className={styles.stories}>
              {stories.map((post) => (
                <article key={post.id} className={styles.story}>
                  <Link
                    href={postLink(post)}
                    className={styles.storyImage}
                    aria-label={post.title}
                  >
                    <NewsImage
                      src={post.thumbnail}
                      className={styles.photo}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    />
                  </Link>
                  <div className={styles.articleMeta}>
                    <span className={styles.category}>
                      {categoryName(post)}
                    </span>
                    {date(post)}
                  </div>
                  <h3>
                    <Link href={postLink(post)}>{post.title}</Link>
                  </h3>
                  {post.excerpt && <p>{post.excerpt}</p>}
                  <div className={styles.storyFooter}>
                    <span>{post.author?.fullName || "Vietnam ParaSports"}</span>
                    <Link
                      href={postLink(post)}
                      aria-label={`${vi ? "Đọc" : "Read"}: ${post.title}`}
                    >
                      <ArrowUpRight size={19} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          {total > 0 && (
            <div className={styles.paginationRow}>
              <span>
                {vi ? "Hiển thị" : "Showing"} {format((page - 1) * 12 + 1)}–
                {format(Math.min(page * 12, total))} / {format(total)}{" "}
                {vi ? "bài viết" : "articles"}
              </span>
              <nav
                className={styles.pagination}
                aria-label={vi ? "Phân trang tin tức" : "News pagination"}
              >
                {page > 1 ? (
                  <Link
                    href={`${href(page - 1)}#news-feed`}
                    aria-label={vi ? "Trang trước" : "Previous page"}
                  >
                    <ChevronLeft size={17} />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    aria-label={vi ? "Trang trước" : "Previous page"}
                  >
                    <ChevronLeft size={17} />
                  </span>
                )}
                {pagination(page, lastPage).map((item) =>
                  typeof item === "number" ? (
                    <Link
                      key={item}
                      href={`${href(item)}#news-feed`}
                      aria-current={item === page ? "page" : undefined}
                    >
                      {item}
                    </Link>
                  ) : (
                    <span key={item} className={styles.gap} aria-hidden="true">
                      …
                    </span>
                  ),
                )}
                {page < lastPage ? (
                  <Link
                    href={`${href(page + 1)}#news-feed`}
                    aria-label={vi ? "Trang sau" : "Next page"}
                  >
                    <ChevronRight size={17} />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    aria-label={vi ? "Trang sau" : "Next page"}
                  >
                    <ChevronRight size={17} />
                  </span>
                )}
              </nav>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
