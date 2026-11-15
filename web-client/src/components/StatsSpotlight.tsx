"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import styles from "./stats-spotlight.module.css";

interface Statistic {
  id?: string;
  value: string | number;
  labelVi: string;
  labelEn: string;
  descVi?: string;
  descEn?: string;
}

const wallpapers = [
  "/wp169/wp1.jpg",
  "/wp169/wp2.jpg",
  "/wp169/w3.jpg",
  "/wp169/wp4.jpeg",
  "/wp169/wp5.webp",
];
const reel = Array.from({ length: 30 }, (_, index) => index % 10);

function RollingValue({
  value,
  started,
}: {
  value: string | number;
  started: boolean;
}) {
  const text = String(value);
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    if (!started) return;
    // Paint zero first even when API data arrives after the section is in view.
    setRolling(false);
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setRolling(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [started, text]);
  return (
    <span className={styles.value} aria-label={text} data-started={rolling}>
      <span className={styles.digits} aria-hidden="true">
        {Array.from(text).map((character, index) =>
          /\d/.test(character) ? (
            <span className={styles.digitWindow} key={index}>
              <span
                className={styles.reel}
                style={
                  {
                    "--stop": 20 + Number(character),
                    "--delay": `${index * 85}ms`,
                  } as CSSProperties
                }
              >
                {reel.map((digit, position) => (
                  <span key={position}>{digit}</span>
                ))}
              </span>
            </span>
          ) : (
            <span
              key={index}
              className={character === "+" ? styles.suffix : undefined}
            >
              {character}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

export default function StatsSpotlight({
  statistics,
  language,
  heading,
  eyebrow,
}: {
  statistics: Statistic[];
  language: string;
  heading: string;
  eyebrow: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const vi = language === "vi";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const visibility = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    visibility.observe(section);
    reveal.observe(section);
    return () => {
      visibility.disconnect();
      reveal.disconnect();
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (!inView || paused || reducedMotion) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const syncTimer = () => {
      clearInterval(timer);
      if (!document.hidden)
        timer = setInterval(
          () => setCurrent((index) => (index + 1) % wallpapers.length),
          4000,
        );
    };
    syncTimer();
    document.addEventListener("visibilitychange", syncTimer);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", syncTimer);
    };
  }, [inView, paused, reducedMotion]);

  return (
    <section
      id="community-statistics"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="stats-heading"
    >
      <div className={styles.backgrounds} aria-hidden="true">
        {wallpapers.map((src, index) => (
          <div
            key={src}
            className={styles.background}
            data-active={index === current}
          >
            {(inView || index === 0) && (
              <Image
                src={src}
                fill
                alt=""
                sizes="100vw"
                loading={inView ? "eager" : "lazy"}
                className={styles.photo}
              />
            )}
          </div>
        ))}
      </div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.eyebrow}>
              <span />
              {eyebrow}
            </span>
            <h2 id="stats-heading">{heading}</h2>
          </div>
          <p className={styles.intro}>
            {vi
              ? "Mỗi con số là một hành trình. Cùng kết nối, cùng vượt qua giới hạn, cùng tạo nên một cộng đồng thể thao rộng mở."
              : "Every number tells a story. Connecting people, moving beyond limits and building a sports community open to everyone."}
          </p>
        </div>
        <div className={styles.grid}>
          {statistics.length ? (
            statistics.map((stat, index) => (
              <div
                className={styles.stat}
                key={stat.id || stat.labelVi || index}
              >
                <span className={styles.ordinal} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <RollingValue value={stat.value} started={started} />
                <h3>{(vi ? stat.labelVi : stat.labelEn) || stat.labelVi}</h3>
                <p>{(vi ? stat.descVi : stat.descEn) || stat.descVi}</p>
              </div>
            ))
          ) : (
            <p className={styles.loading} role="status">
              {vi ? "Đang tải thống kê…" : "Loading statistics…"}
            </p>
          )}
        </div>
        <div className={styles.footer}>
          <span className={styles.note}>
            Vietnam ParaSports <span aria-hidden="true">/</span>{" "}
            {vi ? "Sức mạnh từ cộng đồng" : "Powered by community"}
          </span>
          <div
            className={styles.slideshow}
            role="group"
            aria-label={vi ? "Hình nền thống kê" : "Statistics backgrounds"}
          >
            <div className={styles.dots}>
              {wallpapers.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  aria-label={
                    vi
                      ? `Xem ảnh nền ${index + 1}`
                      : `Show background ${index + 1}`
                  }
                  aria-pressed={index === current}
                  onClick={() => setCurrent(index)}
                >
                  <span />
                </button>
              ))}
            </div>
            {!reducedMotion && (
              <button
                className={styles.pause}
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={
                  paused
                    ? vi
                      ? "Tiếp tục chuyển ảnh nền"
                      : "Resume backgrounds"
                    : vi
                      ? "Tạm dừng chuyển ảnh nền"
                      : "Pause backgrounds"
                }
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
