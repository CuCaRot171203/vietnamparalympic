"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bell, CalendarDays, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import styles from "./community-highlights.module.css";

interface CommunityPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
  category?: { name: string; slug?: string };
  tags?: { slug: string }[];
}
interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  startDate: string;
  isPublished: boolean;
  status: string;
}
interface Entry {
  title: string;
  description?: string;
  href?: string;
  meta?: string;
}

export default function CommunityHighlights({
  posts,
  language,
}: {
  posts: CommunityPost[];
  language: string;
}) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const vi = language === "vi";
  useEffect(() => {
    let cancelled = false;
    apiClient
      .request("/events")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data)) {
          setEvents(
            data
              .filter(
                (event: UpcomingEvent) =>
                  event.isPublished &&
                  event.status === "UPCOMING" &&
                  new Date(event.startDate).getTime() >= Date.now(),
              )
              .sort(
                (a: UpcomingEvent, b: UpcomingEvent) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime(),
              )
              .slice(0, 2),
          );
        }
      })
      .catch(() => {
        /* The editorial links remain useful when the event feed is unavailable. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const postEntries = (items: CommunityPost[]): Entry[] =>
    items.slice(0, 2).map((post) => ({
      title: post.title,
      description: post.excerpt,
      href: `/${language}/news/${post.slug}`,
    }));
  const clubPosts = posts.filter(
    (post) =>
      post.category?.slug === "hoat-dong-clb" ||
      post.tags?.some((tag) => tag.slug === "hoat-dong-clb"),
  );
  const labPosts = posts.filter(
    (post) =>
      post.category?.slug === "creator-lab" ||
      post.tags?.some(
        (tag) => tag.slug === "creator-lab-tag" || tag.slug === "creator-lab",
      ),
  );
  const sections = [
    {
      key: "events",
      icon: CalendarDays,
      eyebrow: vi ? "Cùng nhịp thể thao" : "The sporting calendar",
      title: vi ? "Sự kiện sắp diễn ra" : "Upcoming events",
      description: vi
        ? "Đón những cuộc hẹn mới của thể thao người khuyết tật. Theo dõi lịch thi đấu và các hoạt động kết nối cộng đồng."
        : "Discover what is next in disability sport, from competitions to activities that bring our community together.",
      image: "/uploads/1781644852147-pcy2n1.jpg",
      alt: vi
        ? "Khoảnh khắc trao giải tại một giải cờ vua quốc tế cho người khuyết tật"
        : "An awards moment at an international chess competition for athletes with disabilities",
      entries: events.length
        ? events.map(
            (event): Entry => ({
              title: event.title,
              description: event.description,
              meta: [
                new Date(event.startDate).toLocaleDateString(
                  vi ? "vi-VN" : "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    timeZone: "Asia/Ho_Chi_Minh",
                  },
                ),
                event.location,
              ]
                .filter(Boolean)
                .join(" · "),
            }),
          )
        : [
            {
              title: vi ? "Lịch thi đấu & giải đấu" : "Matches & tournaments",
              description: vi
                ? "Tra cứu bộ môn, thời gian và địa điểm thi đấu trên lịch của hệ thống."
                : "Find sports, dates and venues in the competition calendar.",
            },
            {
              title: vi
                ? "Hẹn gặp ở sự kiện tiếp theo"
                : "See you at the next event",
              description: vi
                ? "Lịch sự kiện mới sẽ xuất hiện tại đây khi được công bố."
                : "New events will appear here once their schedules are published.",
            },
          ],
      cta: vi ? "Xem lịch thi đấu" : "View the calendar",
      href: `/${language}/matches`,
      listLabel: events.length
        ? vi
          ? "Lịch sắp tới"
          : "Coming up"
        : vi
          ? "Theo dõi & khám phá"
          : "Follow & explore",
    },
    {
      key: "clubs",
      icon: Users,
      eyebrow: vi ? "Kết nối từ đam mê" : "Connected by sport",
      title: vi ? "Hoạt động câu lạc bộ" : "Club activities",
      description: vi
        ? "Tìm một nơi để tập luyện, gặp gỡ và tiến bộ mỗi ngày. Mỗi câu lạc bộ là một điểm hẹn của những người cùng đam mê."
        : "Find a place to train, meet people and grow. Every club is a meeting point for people who share a passion for sport.",
      image: "/back_subjects/bong_ro.webp",
      alt: vi
        ? "Vận động viên bóng rổ xe lăn tranh tài trên sân"
        : "Wheelchair basketball athletes competing on court",
      entries: clubPosts.length
        ? postEntries(clubPosts)
        : [
            {
              title: vi ? "Chọn câu lạc bộ phù hợp" : "Find your club",
              description: vi
                ? "Khám phá các câu lạc bộ theo khu vực và bộ môn bạn yêu thích."
                : "Explore clubs by location and the sport you love.",
            },
            {
              title: vi
                ? "Bắt đầu hành trình cùng nhau"
                : "Start your journey together",
              description: vi
                ? "Tìm hiểu lịch tập, điều kiện tham gia và thông tin liên hệ của từng câu lạc bộ."
                : "Check training schedules, joining information and club contacts.",
            },
          ],
      cta: vi ? "Khám phá câu lạc bộ" : "Explore clubs",
      href: `/${language}/clubs`,
      listLabel: clubPosts.length
        ? vi
          ? "Chuyện từ câu lạc bộ"
          : "Club stories"
        : vi
          ? "Tìm nơi bạn thuộc về"
          : "Find your community",
    },
    {
      key: "creator-lab",
      icon: Bell,
      eyebrow: vi ? "Để câu chuyện lan xa" : "Let your story travel",
      title: vi ? "Thông báo Creator Lab" : "Creator Lab updates",
      description: vi
        ? "Học cách kể câu chuyện của chính mình. Từ ý tưởng đầu tiên đến video hoàn chỉnh, Creator Lab đồng hành cùng bạn sáng tạo."
        : "Learn to tell your own story. From the first idea to the finished video, Creator Lab supports your creative journey.",
      image: "/assets/homepage/creator-lab-summit.jpg",
      alt: vi
        ? "Hoạt động kết nối và sáng tạo tại Vietnam ParaSports Creator Lab Summit"
        : "Community and creative activities at Vietnam ParaSports Creator Lab Summit",
      entries: labPosts.length
        ? postEntries(labPosts)
        : [
            {
              title: vi ? "Học theo nhịp của bạn" : "Learn at your own pace",
              description: vi
                ? "Khám phá tài liệu và khóa học về xây dựng hình ảnh, phát triển nội dung cá nhân."
                : "Discover resources and courses on personal storytelling and content creation.",
            },
            {
              title: vi ? "Từ ý tưởng đến video" : "From idea to video",
              description: vi
                ? "Thử mẫu CapCut, tham khảo kịch bản và tìm cảm hứng cùng trợ lý AI."
                : "Try CapCut templates, explore scripts and find inspiration with the AI assistant.",
            },
          ],
      cta: vi ? "Vào Creator Lab" : "Open Creator Lab",
      href: `/${language}/creator-lab`,
      listLabel: labPosts.length
        ? vi
          ? "Cập nhật mới"
          : "Latest updates"
        : vi
          ? "Học hỏi & sáng tạo"
          : "Learn & create",
    },
  ];

  return (
    <section
      id="community-highlights"
      className={styles.section}
      aria-label={
        vi
          ? "Sự kiện, câu lạc bộ và Creator Lab"
          : "Events, clubs and Creator Lab"
      }
    >
      <div className={styles.ambient} aria-hidden="true">
        <Image
          src="/assets/homepage/creator-lab-summit.jpg"
          alt=""
          fill
          sizes="100vw"
        />
      </div>
      <div className={styles.grid}>
        {sections.map((item, index) => (
          <article
            key={item.key}
            className={styles.panel}
            aria-labelledby={`community-${item.key}-title`}
          >
            <div className={styles.topline}>
              <span className={styles.eyebrow}>
                <item.icon size={15} aria-hidden="true" />
                {item.eyebrow}
              </span>
              <span className={styles.number} aria-hidden="true">
                0{index + 1}
              </span>
            </div>
            <div className={styles.cover}>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
              />
              <span className={styles.imageShade} />
            </div>
            <div className={styles.intro}>
              <h3 id={`community-${item.key}-title`}>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div className={styles.list}>
              <span className={styles.listLabel}>{item.listLabel}</span>
              {item.entries.map((entry: Entry) => (
                <div className={styles.entry} key={entry.href || entry.title}>
                  {entry.meta && (
                    <span className={styles.meta}>{entry.meta}</span>
                  )}
                  <h4>
                    {entry.href ? (
                      <Link href={entry.href}>
                        {entry.title}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ) : (
                      entry.title
                    )}
                  </h4>
                  {entry.description && <p>{entry.description}</p>}
                </div>
              ))}
            </div>
            <Link href={item.href} className={styles.cta}>
              {item.cta}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
