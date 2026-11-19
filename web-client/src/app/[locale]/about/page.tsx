"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowRight, Heart, Sparkles, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/useTranslation";
import PublicPageHero from "@/components/PublicPageHero";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import Journey from "./Journey";
import styles from "./about.module.css";

interface AboutCopy {
  eyebrow: string;
  heading: string;
  subheading: string;
  heroLead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  whatIsTitle: string;
  whatIsDesc1: string;
  whatIsDesc2: string;
  missionTitle: string;
  missionDesc: string;
  missionPoints: string[];
  spiritTitle: string;
  spiritDesc: string;
  closingTitle: string;
  closingText: string;
  closingCta: string;
}

const translations: Record<string, AboutCopy> = {
  vi: {
    eyebrow: "VỀ CHÚNG TÔI",
    heading: "Vietnam ParaSports",
    subheading: "Trang thông tin về thể thao người khuyết tật Việt Nam",
    heroLead:
      "Vietnam ParaSports là trang thông tin chính thức của Ủy ban Paralympic Việt Nam về thể thao người khuyết tật tại Việt Nam.\n\nĐược phát triển và tiếp nối qua nhiều thế hệ từ năm 2024, Vietnam ParaSports cập nhật tin tức, sự kiện, thành tích thể thao; lan tỏa câu chuyện vận động viên và cung cấp kiến thức về các môn ParaSport.\n\nBên cạnh hoạt động truyền thông, dự án còn phát triển tài nguyên học tập, giới thiệu câu lạc bộ và kết nối các hoạt động cộng đồng, góp phần mở rộng cơ hội tìm hiểu, trải nghiệm và tham gia thể thao cho người khuyết tật.",
    ctaPrimary: "Khám phá hành trình",
    ctaSecondary: "Tìm câu lạc bộ",
    whatIsTitle: "Vietnam ParaSports là gì?",
    whatIsDesc1:
      "Nơi những câu chuyện thể thao được lan tỏa và những cơ hội tập luyện được kết nối.\n\nVietnam ParaSports đưa thể thao người khuyết tật Việt Nam đến gần hơn với cộng đồng thông qua tin tức, kiến thức, câu chuyện vận động viên và các hoạt động thể thao thực tế.",
    whatIsDesc2:
      "Không chỉ ghi nhận những thành tích trên đấu trường quốc tế, Vietnam ParaSports còn hướng sự quan tâm đến đời sống tập luyện thường ngày, các câu lạc bộ và những người đang bắt đầu hành trình thể thao của riêng mình.\n\nThông qua việc phát triển nội dung, chia sẻ học liệu và kết nối cộng đồng, Vietnam ParaSports mong muốn giúp nhiều người hơn hiểu về ParaSport, tìm thấy thông tin hữu ích và tiếp cận những cơ hội tham gia thể thao phù hợp.",
    missionTitle: "Tầm nhìn & Sứ mệnh",
    missionDesc:
      "Hướng tới một cộng đồng nơi người khuyết tật có nhiều cơ hội hơn để tiếp cận thông tin thể thao, lựa chọn hình thức tập luyện phù hợp và duy trì việc tham gia thể thao như một phần trong cuộc sống.",
    missionPoints: [
      "Lan tỏa: Đưa tin tức, kiến thức, thành tích và những câu chuyện chân thực của ParaSport Việt Nam đến với công chúng.",
      "Trao quyền: Tạo điều kiện để vận động viên và người khuyết tật chủ động chia sẻ trải nghiệm, thể hiện năng lực, cá tính và tiếng nói của chính mình.",
      "Kết nối: Giúp người quan tâm tìm hiểu môn thể thao, tiếp cận thông tin câu lạc bộ và liên hệ với cộng đồng tập luyện.",
      "Tiếp nối: Kế thừa nguồn lực và những giá trị được xây dựng qua từng thế hệ dự án.",
    ],
    spiritTitle: "Mỗi khởi đầu mới là một di sản được viết",
    spiritDesc:
      "Từ những bước đầu lan tỏa nhận thức đến hành trình kết nối và phát triển cộng đồng, Vietnam ParaSports được tạo nên bởi sự tiếp nối của nhiều thế hệ, những con người và những giá trị chung.\n\nVới Gen 4, di sản không chỉ là những gì được kế thừa, mà còn là những cơ hội mới được mở ra: một người bắt đầu tập luyện, một kết nối được hình thành, một niềm đam mê được nuôi dưỡng.",
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
    whatIsTitle: "What is Vietnam ParaSports?",
    whatIsDesc1:
      'Vietnam ParaSports is a communication and community connection platform for disabled sports in Vietnam. The website was built to spread the spirit of "Sports Without Barriers", bringing ParaSports closer to the public, while creating a space where disabled people, athletes, coaches, clubs, and the community can connect with each other.',
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
      setRevealed((prev) => (prev[id] ? prev : { ...prev, [id]: true }));

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
      [ready ? styles.reveal : "", revealed[id] ? styles.revealIn : ""]
        .filter(Boolean)
        .join(" "),
    [revealed, ready],
  );

  const revealStyle = (delayMs = 0) =>
    ({ "--reveal-delay": `${delayMs}ms` }) as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={[
        styles.page,
        homeBeVietnam.variable,
        homeNeusharp.variable,
      ].join(" ")}
    >
      <PublicPageHero
        locale={language}
        className={styles.aboutHero}
        eyebrow={tStr.eyebrow}
        breadcrumbTitle={language === "vi" ? "Về chúng tôi" : "About us"}
        title={tStr.heading}
        tagline={tStr.subheading}
        description={tStr.heroLead}
        image="/assets/aboutus/AU_01.jpg"
        imageAlt={
          language === "vi"
            ? "Cộng đồng vận động viên thể thao người khuyết tật Việt Nam"
            : "Vietnam’s para sports community"
        }
        primary={{
          label: tStr.ctaPrimary,
          href: "/" + language + "/about#journey",
        }}
        secondary={{
          label: tStr.ctaSecondary,
          href: "/" + language + "/clubs",
        }}
      />

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
            <p className={styles.storyLead}>
              <strong className={styles.storyEmphasis}>
                {tStr.whatIsDesc1.split("\n\n")[0]}
              </strong>
              {tStr.whatIsDesc1.includes("\n\n") &&
                "\n\n" + tStr.whatIsDesc1.split("\n\n").slice(1).join("\n\n")}
            </p>
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
            className={`${styles.mission} ${revealClass("mission")}`}
            data-reveal-id="mission"
          >
            <div className={styles.missionSide}>
              <div className={styles.missionHead}>
                <span className={styles.missionIcon}>
                  <Sparkles size={26} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h2 className={styles.missionTitle}>{tStr.missionTitle}</h2>
              </div>
              <h3 className={styles.visionTitle}>
                {language === "vi" ? "Tầm nhìn" : "Vision"}
              </h3>
              <p className={styles.missionText}>{tStr.missionDesc}</p>
            </div>
            <div className={styles.missionDivider} aria-hidden="true" />
            <div>
              <h3 className={styles.visionTitle}>
                {language === "vi" ? "Sứ mệnh" : "Mission"}
              </h3>
              <p className={styles.missionMotto}>
                {language === "vi"
                  ? "Lan tỏa – Trao quyền – Kết nối – Tiếp nối."
                  : "Share – Empower – Connect – Carry forward."}
              </p>
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
        </div>
      </section>

      {/* ---------- DIVIDER ---------- */}
      <div className={styles.divider} aria-hidden="true" />

      <Journey />

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
              <p className={styles.signature}>
                <strong>Vietnam ParaSports 2026</strong>
                <br />
                {language === "vi"
                  ? "Di sản vinh quang – Khơi lửa đam mê"
                  : "A glorious legacy – Igniting passion"}
              </p>
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
