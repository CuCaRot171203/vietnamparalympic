"use client";

import { apiClient } from "@/lib/api-client";

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, Calendar, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useTranslation';
import { useSettings } from '@/components/SettingsProvider';
import PartnersCarousel from '@/components/PartnersCarousel';
import SportsShowcase from '@/components/SportsShowcase';
import StatsSpotlight from '@/components/StatsSpotlight';
import CommunityHighlights from '@/components/CommunityHighlights';
import HomeOpening from '@/components/HomeOpening';
import styles from './home.module.css';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  createdAt: string;
  category?: { name: string };
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

const translations: Record<string, Record<string, string>> = {
  vi: {
    heroTag: "Vietnam ParaSports",
    heroTitle: "Thể thao không rào cản",
    heroDesc: "Cổng thông tin báo chí và kết nối cộng đồng thể thao người khuyết tật Việt Nam. Tôn vinh năng lực, kết nối tài trợ, đồng hành cùng VĐV.",
    heroCreatorLabBtn: "Creator Lab Xây Kênh",
    heroClubsBtn: "Tìm Kiếm CLB NKT",
    newsHeading: "Bản Tin ParaSports",
    newsEyebrow: "Phòng tin",
    newsDesc: "Cập nhật tin tức, sự kiện và câu chuyện từ cộng đồng thể thao người khuyết tật Việt Nam.",
    noPosts: "Chưa có bài viết nào thuộc chuyên mục này.",
    readPost: "Đọc bài viết",
    featured: "Tiêu điểm",
    sideHeading: "Tin bài liên quan",
    noSidePosts: "Không có tin bài liên quan khác.",
    companionBoxTag: "Đồng hành lan tỏa",
    companionBoxTitle: "Hỗ trợ vận động viên khuyết tật tự kể câu chuyện của mình",
    companionBoxBtn: "Đăng ký CTV/Đối tác",
    eventsHeading: "Sự kiện sắp diễn ra",
    clubsHeading: "Hoạt động câu lạc bộ",
    clubsLink: "Xem danh mục các câu lạc bộ",
    creatorLabHeading: "Thông báo Creator Lab",
    creatorLabLink: "Vào Creator Lab học ngay",
    sportsHeading: "Môn thể thao Paralympic tiêu biểu",
    sportsEyebrow: "Bộ môn",
    sportsDesc: "Các bộ môn luôn được Vietnam Paralympic cập nhật liên tục theo nhịp đập thể thao",
    sportsExplore: "Khám phá",
    gratitude: "trân trọng cảm ơn quý đối tác, nhà tài trợ và cộng đồng đã luôn tin tưởng, đồng hành và góp phần tạo nên những thành tựu trên hành trình phát triển.",
    partnersHeading: "Đối tác đồng hành & tài trợ",
    partnersEyebrow: "Đồng hành",
    statsHeading: "Vietnam ParaSports qua những con số",
    statsEyebrow: "Con số",
    partnersLoading: "Đang tải đối tác...",
    noPartners: "Chưa có đối tác đồng hành nào được cập nhật.",
    noImage: "Ảnh",
    noImageBig: "Không có ảnh"
  },
  en: {
    heroTag: "Vietnam ParaSports",
    heroTitle: "Sports Without Barriers",
    heroDesc: "Portal connecting the Vietnam Paralympic sports community. Celebrating capabilities, connecting sponsorships, accompanying athletes.",
    heroCreatorLabBtn: "Creator Lab Channel Builder",
    heroClubsBtn: "Find Disabled Sports Clubs",
    newsHeading: "ParaSports News",
    newsEyebrow: "Newsroom",
    newsDesc: "Updates, events and stories from the Vietnamese disabled sports community.",
    noPosts: "No articles found in this category.",
    readPost: "Read Article",
    featured: "Featured",
    sideHeading: "Related Articles",
    noSidePosts: "No other related articles.",
    companionBoxTag: "Accompany & Spread",
    companionBoxTitle: "Support disabled athletes to tell their own stories",
    companionBoxBtn: "Register as Collaborator/Partner",
    eventsHeading: "Upcoming Events",
    clubsHeading: "Club Activities",
    clubsLink: "View all clubs directory",
    creatorLabHeading: "Creator Lab Announcements",
    creatorLabLink: "Go to Creator Lab now",
    sportsHeading: "Featured Paralympic Sports",
    sportsEyebrow: "Sports",
    sportsDesc: "Select a sport to view related news, training courses, and clubs.",
    sportsExplore: "Explore",
    gratitude: "extends our sincere thanks to our partners, sponsors and community for your continued trust, support and contributions to every milestone along our journey.",
    partnersHeading: "Accompanying Partners & Sponsors",
    partnersEyebrow: "Partners",
    statsHeading: "Vietnam ParaSports in Numbers",
    statsEyebrow: "Numbers",
    partnersLoading: "Loading partners...",
    noPartners: "No accompanying partners updated yet.",
    noImage: "Image",
    noImageBig: "No image"
  }
};

export default function HomeClient({ initialData }: { initialData?: {
  posts: Post[];
  partners: Partner[];
  statistics: any[];
  sportsShowcase: any[];
} }) {
  const { language } = useLanguage();
  const { settings, loading: settingsLoading } = useSettings();
  const tStr = translations[language] || translations.vi;

  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = currentSlide % (settings.heroCarousel?.length || 1);

  const [posts, setPosts] = useState<Post[]>(initialData?.posts || []);
  const [mainPosts, setMainPosts] = useState<Post[]>([]);
  const [loadingMainPosts, setLoadingMainPosts] = useState(true);

  const [partners, setPartners] = useState<Partner[]>(initialData?.partners || []);
  const [loadingPartners, setLoadingPartners] = useState(!initialData);

  const [statistics, setStatistics] = useState<any[]>(initialData?.statistics || []);
  const [sportsShowcase, setSportsShowcase] = useState<any[]>(initialData?.sportsShowcase || []);

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [visiblePostsCount, setVisiblePostsCount] = useState(8);
  const [totalMainPosts, setTotalMainPosts] = useState(0);

  const categorySlugs = [null, "the-thao", "su-kien"];
  const newsCategories = language === "vi" 
    ? ['Tất cả', 'Thể Thao', 'Sự Kiện'] 
    : ['All', 'Sports', 'Events'];

  // Fetch for secondary widgets (one time)
  useEffect(() => {
    apiClient.request("/posts?take=30")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const mappedDbPosts = (data || []).map((post: any) => ({
          ...post,
          category: post.category || { name: 'Tin tức chung' }
        }));
        setPosts(mappedDbPosts);
      })
      .catch(err => {
        console.error(err);
      });

    apiClient.request("/partners")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setPartners(data);
        setLoadingPartners(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPartners(false);
      });

    apiClient.request("/statistics/summary")
      .then(res => res.ok ? res.json() : [])
      .then(data => setStatistics(data))
      .catch(console.error);

    apiClient.request("/sports")
      .then(res => res.ok ? res.json() : [])
      .then(data => setSportsShowcase(data))
      .catch(console.error);
  }, [language]);

  // Fetch for Main Posts Tab
  useEffect(() => {
    const slug = categorySlugs[selectedCategoryIndex];
    setLoadingMainPosts(true);
    apiClient.request(`/posts/paginated?limit=${visiblePostsCount}${slug ? `&categorySlug=${slug}` : ''}`)
      .then(res => {
        if (!res.ok) {
          setMainPosts([]);
          setTotalMainPosts(0);
          setLoadingMainPosts(false);
          return;
        }
        // res.data is the raw parsed response: { success, data, meta }
        // Use .data directly instead of .json() to avoid losing the meta sibling
        const raw = res.data as any;
        const posts = raw.data || [];
        const mapped = posts.map((post: any) => ({
          ...post,
          category: post.category || { name: 'Tin tức chung' }
        }));
        setMainPosts(mapped);
        setTotalMainPosts(raw.meta?.total || 0);
        setLoadingMainPosts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingMainPosts(false);
      });
  }, [selectedCategoryIndex, visiblePostsCount]);

  // Carousel logic
  useEffect(() => {
    if (settings.heroCarousel && settings.heroCarousel.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % settings.heroCarousel.length);
      }, 5000); // 5 seconds per slide
      return () => clearInterval(timer);
    }
  }, [settings.heroCarousel]);

  // Filter posts based on selected category index (DEPRECATED - Now fetched from API directly)
  // Divide fetched mainPosts into featured and standard
  const featuredPost = mainPosts[0];
  const sidePosts = mainPosts.slice(1, 4);
  const bottomPosts = mainPosts.slice(4);

  return (
    <main className={styles.page}>
      <HomeOpening language={language} />
      
      {/* 1. HERO SLIDER BANNER */}
      <section 
        id="sports-without-barriers"
        className="relative overflow-hidden bg-slate-900 flex items-center min-h-(--hero-min-h) lg:aspect-video lg:min-h-0" 
        style={{ 
          "--hero-min-h": `${settings.HERO_BANNER_SIZE === 'large' ? '80' : settings.HERO_BANNER_SIZE === 'small' ? '50' : Number(settings.HERO_BANNER_SIZE) || 60}vh`
        } as CSSProperties}
        aria-labelledby="banner-heading"
      >
        {/* Slides */}
        {settings.heroCarousel && settings.heroCarousel.length > 0 ? (
          settings.heroCarousel.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <Image
                src={slide.url}
                alt={slide.title || "Hero slide"}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`w-full h-full ${settings.HERO_IMAGE_FIT === 'contain' ? 'object-contain' : 'object-cover'}`}
              />
              {settings.HERO_SHOW_CONTENT !== false && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/40 to-slate-950/20"></div>
              )}
            </div>
          ))
        ) : (
          <div className="absolute inset-0 z-10">
            <Image src="/assets/homepage/creator-lab-launch.jpg" alt="Vietnam ParaSports Creator Lab" fill priority sizes="100vw" className="object-cover" />
            {settings.HERO_SHOW_CONTENT !== false && <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/40 to-slate-950/20" />}
          </div>
        )}

        {/* Content Overlay */}
        {settings.HERO_SHOW_CONTENT !== false && (
          <div className="relative z-20 w-full py-10 sm:py-16 px-4 text-white text-center">
            <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#dc2626] px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_0_4px_rgba(220,38,38,0.25),0_4px_16px_rgba(0,0,0,0.35)]">
                {tStr.heroTag}
              </span>
              <h2 id="banner-heading" className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                {(language === "vi" ? settings?.heroContent?.titleVi : settings?.heroContent?.titleEn)?.trim() || tStr.heroTitle}
              </h2>
              <p className="text-base md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">
                {(language === "vi" ? settings?.heroContent?.descVi : settings?.heroContent?.descEn)?.trim() || tStr.heroDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-3 sm:pt-6">
                <Link href={`/${language}/creator-lab`} className={styles.heroCreatorButton}>
                  {tStr.heroCreatorLabBtn}
                </Link>
                <Link href="/clubs" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition backdrop-blur-sm">
                  {tStr.heroClubsBtn}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Indicators */}
        {!settingsLoading && settings.heroCarousel && settings.heroCarousel.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
            {settings.heroCarousel.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${activeSlide === idx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        )}
      </section>

      {/* 2. BẢN TIN PARASPORTS (NEWS PORTAL) */}
      <section className={styles.section} aria-labelledby="news-heading">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.eyebrow}>{tStr.newsEyebrow}</span>
              <h2 id="news-heading" className={styles.sectionTitle}>{tStr.newsHeading}</h2>
              <p className={styles.sectionDesc}>{tStr.newsDesc}</p>
            </div>
            <div className={styles.filters} role="tablist" aria-label={tStr.newsHeading}>
              {newsCategories.map((cat, idx) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategoryIndex === idx}
                  onClick={() => {
                    setSelectedCategoryIndex(idx);
                    setVisiblePostsCount(8); // Reset số lượng hiển thị khi đổi tab
                  }}
                  className={`${styles.filter} ${selectedCategoryIndex === idx ? styles.filterActive : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingMainPosts && mainPosts.length === 0 ? (
            <div className={styles.newsGrid}>
              <div className={styles.skeleton} style={{ height: 420 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.skeleton} style={{ height: 110 }} />
                ))}
              </div>
            </div>
          ) : !featuredPost ? (
            <div className={styles.empty}>{tStr.noPosts}</div>
          ) : (
            <div className={styles.newsGrid}>
              {/* Tin tiêu điểm */}
              <article className={`${styles.card} ${styles.featured}`}>
                <div className={styles.featuredMedia}>
                  <span className={styles.badge}>{featuredPost.category?.name || tStr.featured}</span>
                  {featuredPost.thumbnail ? (
                    <img src={featuredPost.thumbnail} alt={featuredPost.title} className={styles.mediaImg} />
                  ) : (
                    <div className={styles.mediaEmpty}>{tStr.noImageBig}</div>
                  )}
                </div>
                <div className={styles.featuredBody}>
                  <div className={styles.meta}>
                    <Calendar size={13} aria-hidden="true" />
                    <span>{new Date(featuredPost.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <h3 className={styles.postTitle}>
                    <Link href={`/news/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h3>
                  <p className={styles.postExcerpt}>{featuredPost.excerpt}</p>
                  <Link href={`/news/${featuredPost.slug}`} className={styles.readMore}>
                    {tStr.readPost} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>

              {/* Tin bài liên quan */}
              <div>
                <h3 className={styles.sideHead}>{tStr.sideHeading}</h3>
                {sidePosts.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--muted)', paddingTop: 16 }}>{tStr.noSidePosts}</p>
                ) : (
                  <div>
                    {sidePosts.map((post) => (
                      <article key={post.id} className={styles.sideItem}>
                        <div className={styles.sideThumb}>
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt={post.title} className={styles.mediaImg} />
                          ) : (
                            <div className={styles.mediaEmpty} style={{ fontSize: 11 }}>{tStr.noImage}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, minWidth: 0 }}>
                          <h4 className={styles.sideTitle}>
                            <Link href={`/news/${post.slug}`}>{post.title}</Link>
                          </h4>
                          <div className={styles.meta} style={{ fontSize: 12 }}>
                            <span>{post.category?.name}</span>
                            <span className={styles.metaDivider} aria-hidden="true" />
                            <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* Lối tắt tuyển CTV/Đồng hành */}
                <div className={styles.companion}>
                  <span className={styles.companionTag}>{tStr.companionBoxTag}</span>
                  <h4 className={styles.companionTitle}>{tStr.companionBoxTitle}</h4>
                  <Link href="/companion" className={styles.readMore}>
                    {tStr.companionBoxBtn} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Lưới tin tức bên dưới */}
          {mainPosts.length > 4 && (
            <div className={styles.grid4}>
              {bottomPosts.map((post) => (
                <article key={post.id} className={styles.gridCard}>
                  <div className={styles.featuredMedia} style={{ aspectRatio: '16 / 10' }}>
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className={styles.mediaImg} />
                    ) : (
                      <div className={styles.mediaEmpty} style={{ fontSize: 11 }}>{tStr.noImage}</div>
                    )}
                  </div>
                  <div className={styles.gridBody}>
                    <h4 className={styles.gridTitle}>
                      <Link href={`/news/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <div className={styles.meta} style={{ fontSize: 12, marginTop: 'auto' }}>
                      <span>{post.category?.name}</span>
                      <span className={styles.metaDivider} aria-hidden="true" />
                      <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Nút Xem thêm */}
          {totalMainPosts > visiblePostsCount && (
            <div className={styles.loadMoreWrap}>
              <button onClick={() => setVisiblePostsCount(prev => prev + 4)} disabled={loadingMainPosts} className={styles.loadMore}>
                {loadingMainPosts ? 'Đang tải...' : 'Xem thêm bài viết'} <ChevronDown size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <CommunityHighlights posts={posts} language={language} />

      {/* 4. MÔN THỂ THAO PARALYMPIC (SPORTS SHOWCASE) */}
      <section className={`${styles.section} ${styles.sportsSection}`} aria-labelledby="sports-heading">
        <div className={styles.container}>
          <div className={styles.sectionHead} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <span className={styles.eyebrow}>{tStr.sportsEyebrow}</span>
              <h2 id="sports-heading" className={styles.sectionTitle}>{tStr.sportsHeading}</h2>
              <p className={styles.sectionDesc} style={{ marginInline: 'auto' }}>{tStr.sportsDesc}</p>
            </div>
          </div>

        </div>
        {sportsShowcase.length > 0 ? (
          <SportsShowcase sports={sportsShowcase.filter((sport) => sport.slug !== 'rowing')} language={language} />
        ) : (
          <div className={styles.empty}>Đang cập nhật danh sách môn thể thao...</div>
        )}
      </section>

      <div id="community-gratitude" className={styles.gratitude}>
        <p><strong>Vietnam ParaSports</strong> {tStr.gratitude}</p>
      </div>

      {/* 5. VIETNAM PARASPORTS BẰNG NHỮNG CON SỐ (STATS) */}
      <StatsSpotlight
        statistics={statistics}
        language={language}
        heading={tStr.statsHeading}
        eyebrow={tStr.statsEyebrow}
      />
      {/* 6. ĐƠN VỊ ĐỒNG HÀNH (Partner carousel) */}
      {settings?.SHOW_PARTNERS !== false && (
        <section className={styles.section} aria-labelledby="partners-heading" style={{ overflow: 'hidden' }}>
          <div className={styles.container}>
            <div className={styles.sectionHead} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div>
                <span className={styles.eyebrow}>{tStr.partnersEyebrow}</span>
                <h2 id="partners-heading" className={styles.sectionTitle}>{tStr.partnersHeading}</h2>
              </div>
            </div>
          </div>

          {loadingPartners ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className={styles.skeleton} style={{ width: 220, height: 56 }} />
            </div>
          ) : partners.length === 0 ? (
            <p className={styles.empty} style={{ maxWidth: 1200, marginInline: 'auto' }}>{tStr.noPartners}</p>
          ) : (
            <div className={styles.container}><PartnersCarousel partners={partners} language={language} /></div>
          )}
        </section>
      )}

    </main>
  );
}
