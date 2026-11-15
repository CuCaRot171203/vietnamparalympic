"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import styles from "./sports-showcase.module.css";
import { scrollToPosition } from "@/components/SmoothScrollProvider";
import { SPORT_LOGOS as icons } from "@/lib/sport-logos";

interface Sport {
  id?: string;
  slug: string;
  nameVi: string;
  nameEn: string;
}

// Match the repository's photos explicitly: filenames are not always the API slugs.
import { SPORT_BACKGROUNDS as backgrounds, SPORT_STORIES as stories } from "@/lib/sport-assets";

export default function SportsShowcase({
  sports,
  language,
}: {
  sports: Sport[];
  language: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState("down");
  const [stageHeight, setStageHeight] = useState(0);
  const [stickyTop, setStickyTop] = useState(0);
  const vi = language === "vi";
  const step = 100;

  const select = (index: number) => {
    const next = Math.max(0, Math.min(sports.length - 1, index));
    if (next === indexRef.current) return;
    setPrevious(indexRef.current);
    setDirection(next > indexRef.current ? "down" : "up");
    indexRef.current = next;
    setActive(next);
  };

  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!section || index < 0 || index >= sports.length) return;
    select(index);
    scrollToPosition(
      window.scrollY +
        section.getBoundingClientRect().top -
        stickyTop +
        index * step,
      true,
    );
  };

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || !sports.length) return;
    let frame = 0;
    let lastTurn = -Infinity;
    let touchY = 0;
    let touchHandled = false;
    const header = document.querySelector("header");
    let topInset = 0;
    const measure = () => {
      const height = stage.getBoundingClientRect().height;
      topInset = Math.min(
        header?.getBoundingClientRect().height || 0,
        window.innerHeight - height,
      );
      setStickyTop(topInset);
      setStageHeight(height);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    if (header) observer.observe(header);
    measure();
    const update = () => {
      frame = 0;
      const progress = topInset - section.getBoundingClientRect().top;
      select(Math.round(progress / step));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const pinned = () => {
      const rect = section.getBoundingClientRect();
      return (
        rect.top <= topInset + 2 &&
        rect.bottom >= topInset + stage.getBoundingClientRect().height - 2
      );
    };
    const turn = (delta: number) => {
      const next = indexRef.current + Math.sign(delta);
      if (next < 0 || next >= sports.length) return false;
      select(next);
      scrollToPosition(
        window.scrollY +
          section.getBoundingClientRect().top -
          topInset +
          next * step,
        true,
      );
      return true;
    };
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        !event.deltaY ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !pinned()
      )
        return;
      // No distance threshold: even a light wheel tick turns a frame.
      // Briefly absorb momentum so one gesture does not skip several sports.
      if (performance.now() - lastTurn < 480) {
        event.preventDefault();
        return;
      }
      if (turn(event.deltaY)) {
        event.preventDefault();
        lastTurn = performance.now();
      }
    };
    const touchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
      touchHandled = false;
    };
    const touchMove = (event: TouchEvent) => {
      if (!pinned() || event.touches.length !== 1) return;
      if (touchHandled) {
        event.preventDefault();
        return;
      }
      const delta = touchY - event.touches[0].clientY;
      if (Math.abs(delta) >= 8 && turn(delta)) {
        event.preventDefault();
        touchHandled = true;
      }
    };
    window.addEventListener("scroll", scroll, { passive: true });
    stage.addEventListener("wheel", wheel, { passive: false });
    stage.addEventListener("touchstart", touchStart, { passive: true });
    stage.addEventListener("touchmove", touchMove, { passive: false });
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      stage.removeEventListener("wheel", wheel);
      stage.removeEventListener("touchstart", touchStart);
      stage.removeEventListener("touchmove", touchMove);
    };
    // The observer and scroll handlers use refs so a frame change never rebinds input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sports.length]);

  if (!sports.length) return null;
  const visible = new Set([active, previous, active - 1, active + 1]);
  return (
    <div
      ref={sectionRef}
      id="sports-frames"
      className={styles.runway}
      style={
        {
          height: stageHeight
            ? stageHeight + (sports.length - 1) * step
            : undefined,
          "--header-height": `${stickyTop}px`,
        } as CSSProperties
      }
    >
      <div
        ref={stageRef}
        className={styles.stage}
        role="region"
        aria-roledescription={vi ? "trình chiếu" : "slideshow"}
        aria-label={vi ? "Khám phá các môn thể thao" : "Explore sports"}
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            ![
              "ArrowDown",
              "ArrowUp",
              "PageDown",
              "PageUp",
              "Home",
              "End",
            ].includes(event.key)
          )
            return;
          event.preventDefault();
          goTo(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? sports.length - 1
                : active +
                  (["ArrowDown", "PageDown"].includes(event.key) ? 1 : -1),
          );
        }}
      >
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
                  <div className={styles.topline}>
                    <span>Vietnam ParaSports</span>
                    <span>
                      {String(index + 1).padStart(2, "0")} —{" "}
                      {String(sports.length).padStart(2, "0")}
                    </span>
                  </div>
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
                    <span className={styles.kicker}>
                      {story?.[vi ? 0 : 2] ||
                        (vi ? "Khám phá tiềm năng" : "Discover your potential")}
                    </span>
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
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div
          className={styles.scrollCue}
          role="img"
          aria-label={vi ? "Cuộn xuống để khám phá" : "Scroll down to explore"}
        >
          <ChevronDown size={24} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <span className={styles.srOnly} role="status" aria-atomic="true">
          {(vi ? sports[active]?.nameVi : sports[active]?.nameEn) ||
            sports[active]?.nameVi}{" "}
          — {active + 1} / {sports.length}
        </span>
      </div>
    </div>
  );
}

