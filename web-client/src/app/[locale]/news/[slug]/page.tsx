import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import PostInteractions from "@/components/PostInteractions";
import TextToSpeech from "@/components/TextToSpeech";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import NewsImage from "@/components/news/NewsImage";
import DOMPurify from "isomorphic-dompurify";
import styles from "./article.module.css";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: { fullName: string };
  category?: { name: string; slug: string };
  tags?: { id: string; name: string }[];
}
type PageProps = { params: Promise<{ slug: string; locale: string }> };

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await apiClient.request(`/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    return res.ok ? await res.json() : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return {
    title: `${post.title} | Vietnam ParaSports`,
    description: post.excerpt,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const vi = locale === "vi";
  const categoryHref = `/${locale}/news${post.category ? `?category=${encodeURIComponent(post.category.slug)}#news-feed` : ""}`;
  const cleanContent = DOMPurify.sanitize(post.content || "");
  const plainText = DOMPurify.sanitize(post.content || "", {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  const minutes = Math.max(
    1,
    Math.ceil(plainText.trim().split(/\s+/).length / 200),
  );
  const published = post.publishedAt || post.createdAt;
  const date = (value: string) =>
    new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date(value));
  let related: Post[] = [];
  try {
    const query = new URLSearchParams({ limit: "4", page: "1" });
    if (post.category) query.set("categorySlug", post.category.slug);
    const res = await apiClient.request(`/posts/paginated?${query}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      related = (Array.isArray(data.data) ? data.data : [])
        .filter((item: Post) => item.id !== post.id)
        .slice(0, 3);
    }
  } catch (error) {
    console.error(error);
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.thumbnail || undefined,
    datePublished: published,
    dateModified: post.updatedAt || published,
    author: post.author?.fullName
      ? { "@type": "Person", name: post.author.fullName }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Vietnam ParaSports",
      url: "https://vietnamparasports.com",
    },
  };
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
        >
          <Link href={`/${locale}`}>{vi ? "Trang chủ" : "Home"}</Link>
          <span>/</span>
          <Link href={`/${locale}/news`}>{vi ? "Tin tức" : "News"}</Link>
          <span>/</span>
          <span aria-current="page">
            {post.category?.name || (vi ? "Bài viết" : "Article")}
          </span>
        </nav>
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <span />
            Vietnam ParaSports Journal
          </div>
          <Link href={categoryHref} className={styles.category}>
            {post.category?.name || (vi ? "Tin tức" : "News")}
            <ArrowUpRight size={13} />
          </Link>
          <h1>{post.title}</h1>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
          <div className={styles.byline}>
            <div className={styles.author}>
              <span className={styles.avatar} aria-hidden="true">
                {(post.author?.fullName || "Vietnam ParaSports").charAt(0)}
              </span>
              <div>
                <span className={styles.caption}>
                  {vi ? "Bài viết bởi" : "Written by"}
                </span>
                <span>{post.author?.fullName || "Vietnam ParaSports"}</span>
              </div>
            </div>
            <div className={styles.date}>
              <time dateTime={published}>{date(published)}</time>
              <span>
                <Clock3 size={13} />
                {minutes} {vi ? "phút đọc" : "min read"}
              </span>
            </div>
          </div>
        </header>
        {post.thumbnail && (
          <figure className={styles.cover}>
            <NewsImage
              src={post.thumbnail}
              className={styles.photo}
              sizes="(max-width: 767px) 100vw, 1200px"
              priority
            />
          </figure>
        )}
        <div className={styles.layout}>
          <article className={styles.article} aria-label={post.title}>
            <div
              className={styles.tools}
              aria-label={vi ? "Tiện ích bài viết" : "Article tools"}
            >
              <TextToSpeech textToRead={`${post.title}. ${plainText}`} />
              <div className={styles.secondaryTools}>
                <BookmarkButton postId={post.id} />
                <ShareButton
                  url={`${(process.env.NEXTAUTH_URL || "").replace(/\/$/, "")}/${locale}/news/${post.slug}`}
                  title={post.title}
                />
              </div>
            </div>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
            {!!post.tags?.length && (
              <div className={styles.tags}>
                <span>{vi ? "Chủ đề" : "Topics"}</span>
                {post.tags.map((tag) => (
                  <span key={tag.id}>#{tag.name}</span>
                ))}
              </div>
            )}
            <div className={styles.articleEnd}>
              <span>Vietnam ParaSports</span>
              <Link href={`/${locale}/news`}>
                <ArrowLeft size={15} />
                {vi ? "Trở về tin tức" : "Back to news"}
              </Link>
            </div>
            <div className={styles.comments}>
              <PostInteractions postId={post.id} />
            </div>
          </article>
          <aside className={styles.sidebar} aria-labelledby="read-next-heading">
            <div className={styles.sidebarHeading}>
              <span className={styles.eyebrow}>
                {vi ? "Dòng chảy thể thao" : "The sporting world"}
              </span>
              <h2 id="read-next-heading">{vi ? "Đọc tiếp" : "Read next"}</h2>
            </div>
            {related.map((item, index) => (
              <article key={item.id} className={styles.related}>
                <Link
                  href={`/${locale}/news/${item.slug}`}
                  className={styles.relatedImage}
                  aria-label={item.title}
                >
                  <NewsImage
                    src={item.thumbnail}
                    className={styles.photo}
                    sizes="(max-width: 767px) 100vw, 340px"
                  />
                </Link>
                <div className={styles.relatedMeta}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <time dateTime={item.publishedAt || item.createdAt}>
                    {date(item.publishedAt || item.createdAt)}
                  </time>
                </div>
                <h3>
                  <Link href={`/${locale}/news/${item.slug}`}>
                    {item.title}
                  </Link>
                </h3>
              </article>
            ))}
            <Link href={categoryHref} className={styles.explore}>
              {vi ? "Khám phá chuyên mục" : "Explore this category"}
              <ArrowUpRight size={18} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
