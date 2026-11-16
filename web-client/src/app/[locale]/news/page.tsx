import { apiClient } from "@/lib/api-client";
import NewsHero from "@/components/news/NewsHero";
import NewsFeed from "@/components/news/NewsFeed";
import type { FeedPost } from "@/components/news/NewsFeed";
import styles from "./news.module.css";

type Post = FeedPost & { content?: string | null };
type PostsPage = { data: Post[]; meta: { total: number } };
interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
async function readPublic(path: string): Promise<PostsPage | null> {
  try {
    const response = await apiClient.request(path, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as PostsPage;
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
        ? "News & Events | Vietnam ParaSports"
        : "Tin tức & Sự kiện | Vietnam ParaSports",
    description:
      locale === "en"
        ? "News, tournaments and achievements from Vietnam's disability sports community."
        : "Cập nhật tin tức, giải đấu, thành tích và các hoạt động nổi bật của cộng đồng thể thao người khuyết tật Việt Nam.",
  };
}
export default async function NewsPage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const scalar = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : "";
  const search = scalar(query.q || query.search)
    .trim()
    .slice(0, 200);
  const category = scalar(query.category).trim();
  const requestParams = new URLSearchParams({ page: "1", limit: "6" });
  if (search) requestParams.set("search", search);
  if (category) requestParams.set("categorySlug", category);
  const [result, heroResult] = await Promise.all([
    readPublic(`/posts/paginated?${requestParams}`),
    search || category
      ? readPublic("/posts/paginated?limit=3")
      : Promise.resolve(null),
  ]);
  const posts = Array.isArray(result?.data) ? result.data : [];
  const heroPosts = (search || category ? heroResult?.data || [] : posts).slice(
    0,
    3,
  );
  // Send only the fields used by the client components, keeping article bodies on the server.
  const cardPost = ({ content: _content, ...post }: Post): FeedPost => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    category: post.category,
  });
  return (
    <main className={styles.page}>
      <NewsHero
        locale={locale}
        posts={heroPosts.map((post) => ({
          ...cardPost(post),
          readingMinutes: post.content
            ? Math.max(
                1,
                Math.ceil(
                  post.content
                    .replace(/<[^>]*>/g, " ")
                    .trim()
                    .split(/\s+/).length / 200,
                ),
              )
            : undefined,
        }))}
      />
      <NewsFeed
        key={`${locale}:${search}:${category}`}
        locale={locale}
        initialPosts={posts.map(cardPost)}
        initialTotal={Math.max(0, Number(result?.meta?.total) || 0)}
        initialError={!result}
        initialSearch={search}
        initialCategory={category}
      />
    </main>
  );
}
