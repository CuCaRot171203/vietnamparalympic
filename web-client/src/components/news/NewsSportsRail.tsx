"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SPORT_LOGOS } from "@/lib/sport-logos";
import styles from "./news-sports-rail.module.css";

export interface NewsSport {
  id: string;
  slug: string;
  nameVi: string;
  nameEn?: string;
}

export default function NewsSportsRail({
  sports,
  locale,
  activeSlug,
}: {
  sports: NewsSport[];
  locale: string;
  activeSlug?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const vi = locale === "vi";
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft <= 1,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
      });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      resize.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [sports.length]);
  const scroll = (direction: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  if (!sports.length) return null;
  return (
    <section className={styles.rail} aria-labelledby="news-sports-heading">
      <div className={styles.heading}>
        <h2 id="news-sports-heading">
          {vi ? "Theo nhịp từng bộ môn" : "Follow your sport"}
        </h2>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label={vi ? "Bộ môn phía trước" : "Previous sports"}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label={vi ? "Bộ môn tiếp theo" : "Next sports"}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className={styles.track} ref={track} role="list">
        {sports.map((sport) => (
          <div
            key={sport.id || sport.slug}
            role="listitem"
            className={styles.item}
          >
            <Link
              href={`/${locale}/sports/${sport.slug}`}
              className={styles.sport}
              aria-current={sport.slug === activeSlug ? "page" : undefined}
            >
              <span className={styles.logo}>
                {SPORT_LOGOS[sport.slug] && (
                  <Image
                    src={`/subjects/${SPORT_LOGOS[sport.slug]}`}
                    alt=""
                    width={42}
                    height={42}
                  />
                )}
              </span>
              <span>{(vi ? sport.nameVi : sport.nameEn) || sport.nameVi}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
