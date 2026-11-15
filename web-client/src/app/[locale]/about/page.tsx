"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Handshake,
  Heart,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/useTranslation";
import styles from "./about.module.css";

interface AboutCopy {
  eyebrow: string;
  heading: string;
  subheading: string;
  heroLead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroCardTitle: string;
  heroCardText: string;
  pills: string[];
  whatIsTitle: string;
  whatIsDesc1: string;
  whatIsDesc2: string;
  missionTitle: string;
  missionDesc: string;
  missionPoints: string[];
  coreValuesTitle: string;
  coreDesc: string;
  core1Title: string;
  core1Desc: string;
  core2Title: string;
  core2Desc: string;
  core3Title: string;
  core3Desc: string;
  core4Title: string;
  core4Desc: string;
  spiritTitle: string;
  spiritDesc: string;
  closingTitle: string;
  closingText: string;
  closingCta: string;
}

const translations: Record<string, AboutCopy> = {
  vi: {
    eyebrow: "Giới thiệu",
    heading: "Về Chúng Tôi",
    subheading: "Thể thao không rào cản",
    heroLead:
      "Vietnam ParaSports là nền tảng truyền thông và kết nối cộng đồng thể thao người khuyết tật tại Việt Nam — nơi năng lực được tôn vinh, câu chuyện được kể đúng cách, và mọi người tìm thấy nhau trong cùng một sân chơi.",
    ctaPrimary: "Khám phá thể thao",
    ctaSecondary: "Gặp gỡ cộng đồng",
    heroCardTitle: "Một nơi để bắt đầu",
    heroCardText:
      "Đọc tin tức, tìm câu lạc bộ, theo dõi giải đấu và kết nối với những người đồng hành — tất cả trong một hệ sinh thái dễ tiếp cận.",
    pills: [
      "Tin tức",
      "Câu lạc bộ",
      "Giải đấu",
      "Bảng xếp hạng",
      "Khóa học",
      "Đối tác",
    ],
    whatIsTitle: "Vietnam ParaSports là gì?",
    whatIsDesc1:
      "Vietnam ParaSports là nền tảng truyền thông và kết nối cộng đồng thể thao người khuyết tật tại Việt Nam. Website được xây dựng nhằm lan tỏa tinh thần “Thể thao không rào cản”, giúp ParaSports đến gần hơn với công chúng, đồng thời tạo thêm không gian để người khuyết tật, vận động viên, huấn luyện viên, câu lạc bộ và cộng đồng có thể kết nối với nhau.",
    whatIsDesc2:
      "Vietnam ParaSports không chỉ đưa tin về thể thao người khuyết tật, mà còn hướng tới việc xây dựng một hệ sinh thái thông tin dễ tiếp cận: nơi mọi người có thể đọc tin tức, tìm hiểu các CLB, tham gia hoạt động cộng đồng, học cách xây kênh cá nhân và kết nối với các nguồn lực đồng hành.",
    missionTitle: "Sứ mệnh của chúng tôi",
    missionDesc:
      "Vietnam ParaSports hướng tới việc lan tỏa hình ảnh ParaSports theo hướng tôn trọng, chân thật và không thương hại hóa. Dự án mong muốn người khuyết tật được nhìn nhận như những cá nhân có năng lực, có câu chuyện, có quyền tham gia thể thao và có thể hiện diện chủ động trong cộng đồng.",
    missionPoints: [
      "Tôn trọng người khuyết tật như chủ thể có năng lực và có tiếng nói riêng.",
      "Kết nối vận động viên với câu lạc bộ, huấn luyện viên và nhà tài trợ.",
      "Truyền thông chân thật, dễ tiếp cận, tránh giật gân và thương hại hóa.",
      "Hỗ trợ vận động viên làm chủ kỹ năng số và kể câu chuyện của riêng mình.",
    ],
    coreValuesTitle: "Giá trị cốt lõi",
    coreDesc:
      "Bốn nguyên tắc định hướng mọi bài viết, sự kiện và cách chúng tôi đồng hành cùng cộng đồng.",
    core1Title: "Tôn trọng & Chủ thể",
    core1Desc:
      "Tôn trọng người khuyết tật như những chủ thể có năng lực, có tiếng nói và câu chuyện riêng biệt thay vì nhìn nhận họ như những đối tượng đáng thương hại.",
    core2Title: "Kết nối hệ sinh thái",
    core2Desc:
      "Tạo nhịp cầu kết nối người khuyết tật với thể thao, câu lạc bộ, huấn luyện viên, nhà tài trợ và toàn thể cộng đồng xã hội.",
    core3Title: "Truyền thông tích cực",
    core3Desc:
      "Lan tỏa tinh thần ParaSports qua các thông tin chân thật, đầy đủ, dễ tiếp cận và tránh lối truyền thông giật gân, thương hại hay phi thường hóa.",
    core4Title: "Hỗ trợ VĐV Số hóa",
    core4Desc:
      "Hỗ trợ đắc lực cho các vận động viên người khuyết tật trong việc học tập kỹ năng, xây dựng hình ảnh cá nhân và làm chủ nội dung số.",
    spiritTitle: "Tinh thần chung",
    spiritDesc:
      "Vietnam ParaSports tin rằng thể thao không chỉ là thi đấu giành thành tích, mà còn là cơ hội tuyệt vời để mọi người rèn luyện sức khỏe, kết nối cộng đồng, nâng cao sự tự tin và kể câu chuyện của cuộc đời mình theo một cách chủ động nhất.",
    closingTitle: "Cùng viết nên câu chuyện ParaSports",
    closingText:
      "Bất kỳ ai cũng có thể là một phần của hành trình này — với vai trò vận động viên, huấn luyện viên, nhà tài trợ, người đồng hành hay khán giả.",
    closingCta: "Kết nối với chúng tôi",
  },
  en: {
    eyebrow: "About",
    heading: "About Us",
    subheading: "Sports Without Barriers",
    heroLead:
      "Vietnam ParaSports is a media and community platform for disabled sports in Vietnam — where capability is celebrated, stories are told with care, and everyone finds each other on the same field.",
    ctaPrimary: "Explore the sports",
    ctaSecondary: "Meet the community",
    heroCardTitle: "A place to begin",
    heroCardText:
      "Read the news, find a club, follow the tournaments and connect with people who walk alongside you — all inside one accessible ecosystem.",
    pills: [
      "News",
      "Clubs",
      "Tournaments",
      "Rankings",
      "Courses",
      "Partners",
    ],
    whatIsTitle: "What is Vietnam ParaSports?",
    whatIsDesc1:
      "Vietnam ParaSports is a communication and community connection platform for disabled sports in Vietnam. The website was built to spread the spirit of \"Sports Without Barriers\", bringing ParaSports closer to the public, while creating a space where disabled people, athletes, coaches, clubs, and the community can connect with each other.",
    whatIsDesc2:
      "Vietnam ParaSports not only covers disabled sports news, but also aims to build an accessible information ecosystem: a place where everyone can read news, learn about clubs, participate in community activities, learn to build personal channels, and connect with accompanying partners.",
    missionTitle: "Our Mission",
    missionDesc:
      "Vietnam ParaSports aims to spread the image of ParaSports in a respectful, authentic, and non-pitying way. The project wishes disabled people to be recognized as capable individuals with stories, rights to participate in sports, and active presence in the community.",
    missionPoints: [
      "Respect disabled people as subjects with real capability and a voice of their own.",
      "Connect athletes with clubs, coaches and sponsors.",
      "Communicate authentically and accessibly, without sensationalism or pity.",
      "Help athletes own digital skills and tell their own stories.",
    ],
    coreValuesTitle: "Core Values",
    coreDesc:
      "Four principles behind every story, event and the way we stand alongside the community.",
    core1Title: "Respect & Autonomy",
    core1Desc:
      "Respecting disabled people as capable subjects with their own voices and stories instead of viewing them as objects of pity.",
    core2Title: "Connecting the Ecosystem",
    core2Desc:
      "Creating a bridge connecting disabled people with sports, clubs, coaches, sponsors, and the entire society.",
    core3Title: "Positive Media",
    core3Desc:
      "Spreading the ParaSports spirit through authentic, complete, accessible information and avoiding sensationalist, pity-driven, or over-glorified media.",
    core4Title: "Digital Athlete Support",
    core4Desc:
      "Supporting disabled athletes in learning digital skills, building personal branding, and mastering digital content.",
    spiritTitle: "Shared Spirit",
    spiritDesc:
      "Vietnam ParaSports believes that sports is not only about competing for achievements, but also a great opportunity for everyone to exercise, connect with the community, build confidence, and tell their own stories in the most proactive way.",
    closingTitle: "Write the ParaSports story with us",
    closingText:
      "Anyone can be part of this journey — as an athlete, a coach, a sponsor, a companion or a fan.",
    closingCta: "Connect with us",
  },
};

export default function AboutPage() {
  const { language } = useLanguage();
  const tStr = translations[language] || translations.vi;
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Chỉ ẩn nội dung sau khi JS đã sẵn sàng, để nội dung vẫn hiện nếu JS lỗi/tắt.
  const [ready, setReady] = useState(false);

  // Hiệu ứng hiện dần khi cuộn — tôn trọng prefers-reduced-motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal-id]"),
    );
    if (!nodes.length) return;

    const show = (id: string) =>
      setRevealed((prev) =>
        prev[id] ? prev : { ...prev, [id]: true },
      );

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      nodes.forEach((node) => show(node.dataset.revealId!));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show((entry.target as HTMLElement).dataset.revealId!);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    nodes.forEach((node) => observer.observe(node));

    // Nội dung đã nằm trong khung nhìn ngay khi tải trang cần hiện luôn.
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        show(node.dataset.revealId!);
      }
    });

    setReady(true);

    return () => observer.disconnect();
  }, []);

  const revealClass = useCallback(
    (id: string) =>
      [
        ready ? styles.reveal : "",
        revealed[id] ? styles.revealIn : "",
      ]
        .filter(Boolean)
        .join(" "),
    [revealed, ready],
  );

  const revealStyle = (delayMs = 0) =>
    ({ "--reveal-delay": `${delayMs}ms` }) as CSSProperties;

  const coreValues = [
    { icon: ShieldCheck, title: tStr.core1Title, text: tStr.core1Desc },
    { icon: Handshake, title: tStr.core2Title, text: tStr.core2Desc },
    { icon: Megaphone, title: tStr.core3Title, text: tStr.core3Desc },
    { icon: Video, title: tStr.core4Title, text: tStr.core4Desc },
  ];

  return (
    <div ref={rootRef} className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.blob} ${styles.blobOne}`} />
        <span className={`${styles.blob} ${styles.blobTwo}`} />
        <span className={`${styles.blob} ${styles.blobThree}`} />
      </div>

      {/* ---------- HERO (nền tràn ngang) ---------- */}
      <section className={styles.hero}>
        <div
          className={styles.heroMedia}
          style={{ backgroundImage: "url(/assets/aboutus/AU_01.jpg)" }}
          aria-hidden="true"
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div
              data-reveal-id="hero-text"
              className={revealClass("hero-text")}
            >
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                {tStr.eyebrow}
              </span>
              <h1 className={styles.heroTitle}>{tStr.heading}</h1>
              <p className={styles.heroSubtitle}>{tStr.subheading}</p>
              <p className={styles.heroLead}>{tStr.heroLead}</p>
              <div className={styles.heroActions}>
                <Link href="/sports" className={styles.primaryCta}>
                  {tStr.ctaPrimary}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/clubs" className={styles.ghostCta}>
                  {tStr.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- THẺ "MỘT NƠI ĐỂ BẮT ĐẦU" (tràn ngang, 2 bên) ---------- */}
      <section className={styles.startBand}>
        <div className={styles.startInner}>
          <div
            className={`${styles.glass} ${styles.startCard} ${revealClass("hero-card")}`}
            data-reveal-id="hero-card"
            style={revealStyle(90)}
          >
            <div className={styles.startSide}>
              <span className={styles.heroCardIcon}>
                <Trophy size={24} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h2 className={styles.heroCardTitle}>{tStr.heroCardTitle}</h2>
              <p className={styles.heroCardText}>{tStr.heroCardText}</p>
            </div>
            <div className={styles.startDivider} aria-hidden="true" />
            <div className={styles.startSide}>
              <div className={styles.pillList}>
                {tStr.pills.map((pill) => (
                  <span key={pill} className={styles.pill}>
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- DIVIDER ---------- */}
      <div className={styles.divider} aria-hidden="true" />

      {/* ---------- GIỚI THIỆU CHUNG: 2 nửa tràn màn hình 50/50 ---------- */}
      <section className={styles.storyBand}>
        <div className={styles.storyInner}>
          <figure
            className={`${styles.storyMedia} ${revealClass("story-media")}`}
            data-reveal-id="story-media"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/aboutus/AU_02.jpg"
              alt="Vietnam ParaSports cộng đồng thể thao người khuyết tật"
              loading="lazy"
            />
            <figcaption className={styles.storyCaption}>
              {tStr.subheading}
            </figcaption>
          </figure>

          <div
            className={`${styles.glass} ${styles.glassSoft} ${styles.storyBody} ${revealClass("story")}`}
            data-reveal-id="story"
          >
            <h2 className={styles.storyTitle}>{tStr.whatIsTitle}</h2>
            <p className={styles.storyLead}>{tStr.whatIsDesc1}</p>
            <p className={styles.storyText}>{tStr.whatIsDesc2}</p>
          </div>
        </div>
      </section>

      {/* ---------- DIVIDER ---------- */}
      <div className={styles.divider} aria-hidden="true" />

      {/* ---------- SỨ MỆNH (thẻ tràn ngang, 2 bên) ---------- */}
      <section className={styles.missionBand}>
        <div className={styles.missionInner}>
          <div
            className={`${styles.glass} ${styles.mission} ${revealClass("mission")}`}
            data-reveal-id="mission"
          >
            <div className={styles.missionSide}>
              <div className={styles.missionHead}>
                <span className={styles.missionIcon}>
                  <Sparkles size={26} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h2 className={styles.missionTitle}>{tStr.missionTitle}</h2>
              </div>
              <p className={styles.missionText}>{tStr.missionDesc}</p>
            </div>
            <div className={styles.missionDivider} aria-hidden="true" />
            <ul className={styles.missionAside}>
              {tStr.missionPoints.map((point, index) => (
                <li key={point} className={styles.missionItem}>
                  <span className={styles.missionItemIndex}>
                    0{index + 1}
                  </span>
                  <Users
                    size={18}
                    strokeWidth={1.8}
                    className={styles.missionItemIcon}
                    aria-hidden="true"
                  />
                  <span className={styles.missionItemText}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- DIVIDER ---------- */}
      <div className={styles.divider} aria-hidden="true" />

      {/* ---------- GIÁ TRỊ CỐT LÕI (nền tràn ngang) ---------- */}
      <section className={styles.coreBand}>
        <div
          className={styles.coreMedia}
          style={{ backgroundImage: "url(/assets/aboutus/AU_03.jpg)" }}
          aria-hidden="true"
        />
        <div className={styles.coreScrim} aria-hidden="true" />
        <div className={styles.container}>
          <div
            className={`${styles.sectionHead} ${styles.sectionHeadLight} ${revealClass("core-head")}`}
            data-reveal-id="core-head"
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {tStr.eyebrow}
            </span>
            <h2 className={styles.sectionTitle}>{tStr.coreValuesTitle}</h2>
            <p className={styles.sectionDesc}>{tStr.coreDesc}</p>
          </div>

          <div className={styles.valueGrid}>
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              const id = `core-${index}`;
              return (
                <article
                  key={value.title}
                  className={`${styles.glass} ${styles.glassCard} ${styles.valueCard} ${revealClass(id)}`}
                  data-reveal-id={id}
                  style={revealStyle(index * 70)}
                >
                  <div className={styles.valueTop}>
                    <span className={styles.valueIcon}>
                      <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span className={styles.valueIndex}>0{index + 1}</span>
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueText}>{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- DIVIDER ---------- */}
      <div className={styles.divider} aria-hidden="true" />

      {/* ---------- TINH THẦN CHUNG + CTA: 2 thẻ, chia đôi 50/50 ---------- */}
      <section className={styles.spiritBand}>
        <div className={styles.spiritInner}>
          <div className={styles.duo}>
            <div
              className={`${styles.glass} ${styles.duoCard} ${revealClass("spirit")}`}
              data-reveal-id="spirit"
            >
              <span className={styles.spiritIcon}>
                <Heart size={26} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h2 className={styles.spiritTitle}>{tStr.spiritTitle}</h2>
              <p className={styles.spiritText}>{tStr.spiritDesc}</p>
            </div>

            <div className={styles.duoDivider} aria-hidden="true" />

            <div
              className={`${styles.glass} ${styles.duoCard} ${revealClass("closing")}`}
              data-reveal-id="closing"
              style={revealStyle(90)}
            >
              <h2 className={styles.closingTitle}>{tStr.closingTitle}</h2>
              <p className={styles.closingText}>{tStr.closingText}</p>
              <Link href="/companion" className={styles.primaryCta}>
                {tStr.closingCta}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
