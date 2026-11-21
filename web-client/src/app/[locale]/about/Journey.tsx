"use client";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import {
  BookOpen,
  CalendarDays,
  Flag,
  Flame,
  Heart,
  Megaphone,
  Mic,
  Monitor,
  Play,
  Trophy,
  Target,
  Users,
  Video,
} from "lucide-react";
import { generations } from "./generations";
import AnimatedDetails from "./AnimatedDetails";
import styles from "./about.module.css";

const activityIcons = [
  [Trophy, Megaphone, Users],
  [Megaphone, Trophy, Play, Users],
  [Users, Monitor, BookOpen],
  [Trophy, Play, Users, Monitor],
];
const sloganIcons = [Target, Users, Video, Flame];
const highlightIcons = [
  [Trophy, Users],
  [Trophy, Mic],
  [Monitor, Video, BookOpen],
  [Trophy, Video, Users],
];
export default function Journey() {
  const [active, setActive] = useState(3);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const gen = generations[active];
  const groups = [
    { title: "Giới thiệu", paragraphs: [gen.intro] },
    {
      title: "Hoạt động nổi bật",
      paragraphs: gen.activities.map((activity) => activity.text),
    },
    { title: gen.impactTitle, paragraphs: [gen.impact] },
  ];
  return (
    <section
      id="journey"
      className={styles.journeyBand}
      aria-labelledby="journey-heading"
    >
      <div className={styles.container}>
        <header className={styles.journeyHeader}>
          <span className={styles.journeyRule} aria-hidden="true" />
          <span className={styles.journeyEyebrow}>HÀNH TRÌNH PHÁT TRIỂN</span>
          <h2 id="journey-heading" className={styles.sectionTitle}>
            Hành trình Vietnam ParaSports
          </h2>
          <p className={styles.journeyLead}>
            Bốn thế hệ – Một hành trình phát triển
          </p>
          <p className={styles.journeyDescription}>
            Từ năm 2024, Vietnam ParaSports được phát triển qua bốn thế hệ, mỗi
            thế hệ mang một chiến dịch, một cách tiếp cận và những đóng góp
            riêng. Khám phá từng dấu mốc để nhìn lại hành trình của Vietnam
            ParaSports.
          </p>
        </header>
        <div
          role="tablist"
          aria-label="Các thế hệ Vietnam ParaSports"
          className={styles.timeline}
        >
          {generations.map((generation, i) => {
            const SloganIcon = sloganIcons[i];
            const MessageIcon = i === 0 ? Heart : Flag;
            return (
              <button
                key={generation.label}
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
                    <CalendarDays size={13} aria-hidden="true" />
                    GEN {i + 1}{" "}
                    <span>| {generation.time.replace(/\s/g, "")}</span>
                  </span>
                  <strong>{generation.title}</strong>
                  <span className={styles.genMilestones}>
                    {generation.highlights.map(({ text, value }, index) => {
                      const Icon = highlightIcons[i][index];
                      const [before, after] = value
                        ? text.split(value)
                        : [text];
                      return (
                        <span className={styles.genHighlight} key={text}>
                          <Icon
                            size={18}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                          <span>
                            {before}
                            {value && <b>{value}</b>}
                            {after}
                          </span>
                        </span>
                      );
                    })}
                    <span>
                      <SloganIcon
                        size={18}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      <span>{generation.cardSlogan}</span>
                    </span>
                    {generation.cardQuote && (
                      <span>
                        <MessageIcon
                          size={18}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                        <span>{generation.cardQuote}</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
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
              {/* Logo watermark: crop only the symbol; customize placement in .genLogoWatermark. */}
              <svg
                className={styles.genLogoWatermark}
                viewBox="130 190 310 615"
                aria-hidden="true"
                focusable="false"
              >
                <image
                  href="/KV/logo_white.png"
                  width="1774"
                  height="887"
                />
              </svg>
              <span className={styles.spotlightRule} aria-hidden="true" />
              <h3>
                GEN {active + 1} –<br />
                {gen.title}
              </h3>
              <p className={styles.spotlightAccent}>{gen.slogan}</p>
              {gen.quote && <blockquote>{gen.quote}</blockquote>}
              <p className={styles.spotlightIntro}>{gen.intro}</p>
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
          <div
            className={styles.activityGrid}
            style={
              { "--activity-columns": gen.activities.length } as CSSProperties
            }
          >
            {gen.activities.map(({ title, text }, index) => {
              const Icon = activityIcons[active][index];
              return (
                <div className={styles.activityCard} key={title}>
                  <span className={styles.activityIcon}>
                    <Icon size={27} aria-hidden="true" />
                  </span>
                  <div>
                    {title && <h4>{title}</h4>}
                    <p>
                      {text.startsWith(title + ":")
                        ? text.slice(title.length + 1).trim()
                        : text}
                    </p>
                  </div>
                </div>
              );
            })}
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
