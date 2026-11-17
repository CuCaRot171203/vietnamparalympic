"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./sports-showcase.module.css";
import { homeNeusharp, homeBeVietnam } from "@/lib/home-fonts";
import { SPORT_LOGOS as icons } from "@/lib/sport-logos";

interface Sport {
  id?: string;
  slug: string;
  nameVi: string;
  nameEn: string;
}

// Match the repository's photos explicitly: filenames are not always the API slugs.
import {
  SPORT_BACKGROUNDS as backgrounds,
  SPORT_STORIES as stories,
} from "@/lib/sport-assets";

export default function SportsShowcase({
  sports,
  language,
}: {
  sports: Sport[];
  language: string;
}) {
  const indexRef = useRef(0);
  const selectorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState("down");
  useEffect(() => {
    const rail = selectorRef.current;
    const item = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return;
    const left =
      item.offsetLeft -
      rail.offsetLeft -
      (rail.clientWidth - item.offsetWidth) / 2;
    rail.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [active]);

  const vi = language === "vi";

  const select = (index: number) => {
    const next = Math.max(0, Math.min(sports.length - 1, index));
    if (next === indexRef.current) return;
    setPrevious(indexRef.current);
    setDirection(next > indexRef.current ? "down" : "up");
    indexRef.current = next;
    setActive(next);
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= sports.length) return;
    select(index);
  };

  if (!sports.length) return null;
  const visible = new Set([active, previous, active - 1, active + 1]);
  return (
    <div
      id="sports-frames"
      className={`${styles.runway} ${homeNeusharp.variable} ${homeBeVietnam.variable}`}
    >
      <section
        aria-labelledby="sports-heading"
        className={styles.stage}
        role="region"
        aria-roledescription={vi ? "trình chiếu" : "slideshow"}
        aria-label={vi ? "Khám phá các môn thể thao" : "Explore sports"}
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
          )
            return;
          event.preventDefault();
          goTo(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? sports.length - 1
                : active + (event.key === "ArrowRight" ? 1 : -1),
          );
        }}
      >
        <div className={styles.container}>
          <header className={styles.heading}>
            <div className={styles.titlePanel}>
              <span className={styles.badge}>
                <span aria-hidden="true" />
                {vi ? "Bộ môn thể thao" : "Sports"}
              </span>
              <h2 id="sports-heading">
                {vi
                  ? "MÔN THỂ THAO PARALYMPIC TIÊU BIỂU"
                  : "EXPLORE PARALYMPIC SPORTS"}
              </h2>
            </div>
            <div className={styles.intro}>
              <p>
                {vi
                  ? "Các bộ môn luôn được Vietnam ParaSports cập nhật liên tục theo nhịp đập thể thao."
                  : "Stay connected to the pulse of sport with Vietnam ParaSports."}
              </p>
              <button
                type="button"
                className={styles.viewAll}
                onClick={() =>
                  selectorRef.current?.focus({ preventScroll: true })
                }
              >
                {vi ? "Xem tất cả bộ môn" : "View all sports"}
                <span aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </header>
          <div className={styles.frames} data-direction={direction}>
            {sports.map((sport, index) => {
              if (!visible.has(index)) return null;
              const name = (vi ? sport.nameVi : sport.nameEn) || sport.nameVi;
              const story = stories[sport.slug];
              const current = index === active;
              return (
                <article
                  key={sport.slug}
                  className={`${styles.frame} ${current ? styles.current : index === previous ? styles.previous : styles.preload}`}
                  aria-hidden={!current}
                  inert={!current}
                >
                  {backgrounds[sport.slug] && (
                    <Image
                      className={styles.photo}
                      src={`/back_subjects/${backgrounds[sport.slug]}`}
                      alt=""
                      fill
                      sizes="100vw"
                      loading="eager"
                    />
                  )}
                  <div className={styles.shade} />
                  <div className={styles.frameContent}>
                    <div className={styles.story}>
                      {icons[sport.slug] && (
                        <div className={styles.symbol} aria-hidden="true">
                          <Image
                            src={`/subjects/${icons[sport.slug]}`}
                            width={80}
                            height={80}
                            alt=""
                          />
                        </div>
                      )}
                      <h3>{name}</h3>
                      <p>
                        {story?.[vi ? 1 : 3] ||
                          (vi
                            ? "Khám phá tin tức, tập luyện và cộng đồng của bộ môn."
                            : "Explore the sport's stories, training and community.")}
                      </p>
                      <Link
                        href={`/${language}/sports/${sport.slug}`}
                        tabIndex={current ? 0 : -1}
                        className={styles.explore}
                      >
                        {vi ? "Khám phá bộ môn" : "Explore this sport"}
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
            <div className={styles.controls}>
              <span>
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(sports.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label={vi ? "Bộ môn trước" : "Previous sport"}
                disabled={active === 0}
                onClick={() => goTo(active - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label={vi ? "Bộ môn tiếp theo" : "Next sport"}
                disabled={active === sports.length - 1}
                onClick={() => goTo(active + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div
            ref={selectorRef}
            id="sports-selector"
            className={styles.selector}
            role="group"
            tabIndex={-1}
            aria-label={vi ? "Chọn bộ môn thể thao" : "Choose a sport"}
          >
            {sports.map((sport, index) => (
              <button
                type="button"
                key={sport.slug}
                aria-pressed={index === active}
                onClick={() => goTo(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {(vi ? sport.nameVi : sport.nameEn) || sport.nameVi}
              </button>
            ))}
          </div>
        </div>
        <span className={styles.srOnly} role="status" aria-atomic="true">
          {(vi ? sports[active]?.nameVi : sports[active]?.nameEn) ||
            sports[active]?.nameVi}{" "}
          — {active + 1} / {sports.length}
        </span>
      </section>
    </div>
  );
}
