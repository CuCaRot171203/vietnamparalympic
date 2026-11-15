"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import styles from "./clubs-hero-background.module.css";

const images = ["CLUB_02.jpg", "CLUB_03.jpg", "CLUB_01.jpg"];

export default function ClubsHeroBackground({
  language,
}: {
  language: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const loaded = useRef(new Set<number>());
  const vi = language === "vi";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActive((current) => {
        const next = (current + 1) % images.length;
        return loaded.current.has(next) ? next : current;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  return (
    <>
      <div className={styles.background} aria-hidden="true">
        {images.map((file, index) => (
          <Image
            key={file}
            src={`/CLUB/${file}`}
            alt=""
            fill
            priority={index === 0}
            loading={index === 0 ? undefined : "eager"}
            sizes="100vw"
            className={`${styles.slide} ${active === index ? styles.active : ""}`}
            onLoad={() => loaded.current.add(index)}
          />
        ))}
      </div>
      {!reducedMotion && (
        <div className={styles.controls}>
          <span aria-hidden="true">
            {String(active + 1).padStart(2, "0")}{" "}
            <span>/ {String(images.length).padStart(2, "0")}</span>
          </span>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={
              paused
                ? vi
                  ? "Tiếp tục chuyển ảnh nền"
                  : "Resume background slideshow"
                : vi
                  ? "Tạm dừng chuyển ảnh nền"
                  : "Pause background slideshow"
            }
            aria-pressed={paused}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      )}
    </>
  );
}
