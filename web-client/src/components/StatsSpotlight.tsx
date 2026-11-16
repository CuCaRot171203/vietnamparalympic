"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import styles from "./stats-spotlight.module.css";

export interface Statistic {
  id?: string;
  value: string | number;
  labelVi: string;
  labelEn: string;
}

const labels = [
  ["Môn thể thao", "Sports"],
  ["Câu lạc bộ trên toàn quốc", "Clubs nationwide"],
  ["Thành viên tích cực", "Active members"],
  ["Học viên Creator Lab", "Creator Lab learners"],
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
              <span className={styles.digitMeasure}>{character}</span>
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
}: {
  statistics: Statistic[];
  language: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const vi = language === "vi";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    reveal.observe(section);
    return () => reveal.disconnect();
  }, []);

  return (
    <section
      id="community-statistics"
      ref={sectionRef}
      className={`${styles.section} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
      aria-labelledby="stats-heading"
      aria-busy={!statistics.length}
    >
      <h2 id="stats-heading" className={styles.srOnly}>
        {vi
          ? "Vietnam ParaSports qua những con số"
          : "Vietnam ParaSports in numbers"}
      </h2>
      <dl className={styles.grid}>
        {labels.map(([labelVi, labelEn], index) => (
          <div key={labelVi} className={styles.stat}>
            <dt>{vi ? labelVi : labelEn}</dt>
            <dd>
              <RollingValue
                value={statistics[index]?.value ?? "—"}
                started={started}
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
