"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Database,
  Flame,
  Megaphone,
  Monitor,
  Play,
  Trophy,
  Users,
} from "lucide-react";
import { generations } from "./generations";
import AnimatedDetails from "./AnimatedDetails";
import styles from "./about.module.css";

const summaries = [
  ["2024", "Đặt nền móng", "70 trẻ tiếp cận Boccia · 43,81 triệu đồng gây quỹ"],
  ["2025–2026", "Lan tỏa kiến thức", "ASEAN Para Games · Kiến thức bộ môn"],
  ["05–08/2026", "Trao quyền sáng tạo", "30 vận động viên · 42 học liệu số"],
  ["2026", "Viết tiếp di sản", "Kết nối cộng đồng thể thao người khuyết tật"],
];
const headings = new Set([
  "Ý nghĩa tổng quan",
  "Hoạt động nổi bật",
  "Hoạt động và định hướng nổi bật",
  "Dấu ấn tiêu biểu",
  "Giá trị để lại",
  "Chúng tôi là ai?",
  "Mục tiêu của chúng tôi",
  "Các hoạt động nổi bật",
  "Những dấu ấn của Gen 4",
  "Giá trị chúng tôi tiếp tục xây dựng",
]);
const milestones = [
  [
    { icon: Users, value: "70", text: "trẻ tiếp cận Boccia" },
    { icon: Database, value: "43,81", text: "triệu đồng gây quỹ" },
  ],
  [
    { icon: Trophy, value: "", text: "Truyền thông ASEAN Para Games" },
    { icon: BookOpen, value: "", text: "Giới thiệu bộ môn, luật thi đấu" },
  ],
  [
    { icon: Users, value: "30", text: "vận động viên" },
    { icon: Play, value: "42", text: "học liệu số" },
  ],
  [
    {
      icon: Flame,
      value: "",
      text: "Phát triển cộng đồng thể thao người khuyết tật",
    },
  ],
];
const activities = [
  [
    {
      icon: Megaphone,
      title: "Kênh truyền thông",
      text: "Đặt nền móng Vietnam ParaSports.",
    },
    {
      icon: Trophy,
      title: "Paris 2024",
      text: "Lan tỏa hành trình vận động viên.",
    },
    {
      icon: Users,
      title: "Trải nghiệm Boccia",
      text: "Đồng hành cùng trẻ tại Thụy An.",
    },
  ],
  [
    {
      icon: Trophy,
      title: "ASEAN Para Games",
      text: "Phát triển truyền thông giải đấu.",
    },
    {
      icon: BookOpen,
      title: "Kiến thức bộ môn",
      text: "Giới thiệu luật và kiến thức nhập môn.",
    },
    {
      icon: Megaphone,
      title: "Chuyện vận động viên",
      text: "Góc nhìn từ thực tế thi đấu.",
    },
  ],
  [
    {
      icon: Monitor,
      title: "4 buổi đào tạo",
      text: "Kỹ năng truyền thông và sáng tạo.",
    },
    { icon: Users, title: "Creator Lab", text: "Đà Nẵng, TP.HCM và Hà Nội." },
    {
      icon: Play,
      title: "30 kênh TikTok",
      text: "Đồng hành cùng vận động viên.",
    },
    {
      icon: BookOpen,
      title: "42 học liệu số",
      text: "Tiếp nối nguồn lực sáng tạo.",
    },
  ],
  [
    {
      icon: Users,
      title: "Tuyến cộng đồng",
      text: "Từ 23/10/2026 · Kết nối bộ môn và CLB.",
    },
    {
      icon: Trophy,
      title: "Asian Para Games 2026",
      text: "Lan tỏa hành trình của đoàn Việt Nam.",
    },
    {
      icon: Play,
      title: "Cuộc thi TikTok",
      text: "Chia sẻ câu chuyện thể thao.",
    },
    {
      icon: Monitor,
      title: "Phát triển website",
      text: "Thông tin bộ môn và câu lạc bộ.",
    },
  ],
];
export default function Journey() {
  const [active, setActive] = useState(3);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const gen = generations[active];
  const groups: { title: string; paragraphs: string[] }[] = [];
  for (const text of gen.blocks) {
    if (headings.has(text)) groups.push({ title: text, paragraphs: [] });
    else {
      if (!groups.length) groups.push({ title: "Thông điệp", paragraphs: [] });
      groups[groups.length - 1].paragraphs.push(text);
    }
  }
  const overview = groups.filter((g) =>
    ["Thông điệp", "Ý nghĩa tổng quan", "Chúng tôi là ai?"].includes(g.title),
  );
  return (
    <section
      id="journey"
      className={styles.journeyBand}
      aria-labelledby="journey-heading"
    >
      <div className={styles.container}>
        <header className={styles.journeyHeader}>
          <span className={styles.journeyRule} aria-hidden="true" />
          <h2 id="journey-heading" className={styles.sectionTitle}>
            Hành trình qua các thế hệ
          </h2>
          <p className={styles.journeyLead}>
            Mỗi thế hệ một dấu ấn, cùng vun đắp cộng đồng thể thao người khuyết
            tật.
          </p>
        </header>
        <div
          role="tablist"
          aria-label="Các thế hệ Vietnam ParaSports"
          className={styles.timeline}
        >
          {summaries.map(([time, title], i) => (
            <button
              key={title}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={"gen-tab-" + i}
              aria-controls={"gen-panel-" + i}
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => {
                const next =
                  event.key === "ArrowRight"
                    ? (i + 1) % 4
                    : event.key === "ArrowLeft"
                      ? (i + 3) % 4
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 3
                          : null;
                if (next !== null) {
                  event.preventDefault();
                  setActive(next);
                  tabs.current[next]?.focus();
                }
              }}
              className={styles.genTab}
            >
              <span className={styles.timelineDot} aria-hidden="true" />
              <span className={styles.genTabMedia}>
                <Image
                  src={"/ABOUT/gen_" + (i + 1) + ".jpg"}
                  alt={"Tập thể Vietnam ParaSports Gen " + (i + 1)}
                  width={640}
                  height={360}
                  sizes="(max-width: 900px) 45vw, 23vw"
                />
              </span>
              <span className={styles.genTabBody}>
                <span className={styles.genMeta}>
                  GEN {i + 1} <span>| {time}</span>
                </span>
                <strong>{title}</strong>
                <span className={styles.genMilestones}>
                  {milestones[i].map(({ icon: Icon, value, text }) => (
                    <span key={text}>
                      <Icon size={23} aria-hidden="true" />
                      <span>
                        {value && <b>{value} </b>}
                        {text}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <article
        key={active}
        role="tabpanel"
        tabIndex={0}
        id={"gen-panel-" + active}
        aria-labelledby={"gen-tab-" + active}
        className={styles.genSpotlight}
      >
        <div className={styles.container}>
          <div className={styles.genOverview}>
            <div className={styles.genCopy}>
              <span className={styles.spotlightRule} aria-hidden="true" />
              <h3>
                GEN {active + 1} –<br />
                {active === 3 ? "DI SẢN VINH QUANG" : gen.title.split(" – ")[0]}
              </h3>
              <p className={styles.spotlightAccent}>
                {active === 3 ? "Khơi lửa đam mê" : gen.title.split(" – ")[1]}
              </p>
              <blockquote>
                {active === 3
                  ? "Mỗi khởi đầu mới là một di sản được viết."
                  : gen.blocks[0]
                      .replace("Thông điệp chính: ", "")
                      .replace(/[“”]/g, "")}
              </blockquote>
              <p className={styles.spotlightIntro}>
                {active === 3
                  ? "Kết nối người khuyết tật với bộ môn phù hợp, câu lạc bộ và cơ hội tập luyện."
                  : overview.find((g) => g.title !== "Thông điệp")
                      ?.paragraphs[0]}
              </p>
            </div>
            <figure
              className={[
                styles.genPhoto,
                styles.spotlightPhoto,
                active === 1 ? styles.genPhotoDiagonal : "",
              ].join(" ")}
            >
              <Image
                src={"/ABOUT/gen_" + (active + 1) + ".jpg"}
                alt={
                  "Tập thể và hoạt động Vietnam ParaSports Gen " + (active + 1)
                }
                width={1600}
                height={900}
                sizes="(max-width: 1000px) 100vw, 44vw"
              />
              {active === 1 && (
                <Image
                  src="/ABOUT/gen_2_asian.jpg"
                  alt="Hoạt động thể thao Vietnam ParaSports Gen 2"
                  width={900}
                  height={600}
                  sizes="(max-width: 1000px) 100vw, 44vw"
                />
              )}
              <figcaption>{gen.label}</figcaption>
            </figure>
          </div>
          <div className={styles.activityGrid}>
            {activities[active].map(({ icon: Icon, title, text }) => (
              <div className={styles.activityCard} key={title}>
                <span className={styles.activityIcon}>
                  <Icon size={27} aria-hidden="true" />
                </span>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.genDetails}>
            {groups.map((group) => (
              <AnimatedDetails key={group.title} title={group.title}>
                {group.paragraphs.map((text) =>
                  /^0\d\./.test(text) ? (
                    <h4 key={text}>{text}</h4>
                  ) : (
                    <p key={text}>{text}</p>
                  ),
                )}
              </AnimatedDetails>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
