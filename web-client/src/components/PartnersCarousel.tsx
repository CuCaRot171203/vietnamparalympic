"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./partners-carousel.module.css";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

// Keep exact filename casing: production runs on a case-sensitive filesystem.
const localLogos: Record<string, string> = {
  vingroup: "VINGROUP.webp",
  viettel: "VIETTEL.webp",
  vinamilk: "VINAMILK.webp",
  vietcombank: "VIETCOMBANK.webp",
  decathlon: "DECATHLON.png",
  herbalife: "HERBALIFE.jpg",
  unilever: "UNILEVER.svg",
  honda: "HONDA.png",
  masan: "MASAN.png",
  fpt: "FPT.webp",
};

function resolveLogo(partner: Partner) {
  const identity = `${partner.name} ${partner.logoUrl}`.toLowerCase();
  const brand = Object.keys(localLogos).find((name) => identity.includes(name));
  return brand ? `/logos/${localLogos[brand]}` : partner.logoUrl;
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={styles.fallback}>{partner.name}</span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={partner.logoUrl}
      alt={partner.name}
      width={240}
      height={112}
      className={styles.logo}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

export default function PartnersCarousel({
  partners,
  language,
}: {
  partners: Partner[];
  language: string;
}) {
  const items = useMemo(
    () =>
      partners.map((partner) => ({
        ...partner,
        logoUrl: resolveLogo(partner),
      })),
    [partners],
  );
  const [position, setPosition] = useState(0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const vi = language === "vi";
  const loops = items.length > 4;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(motion.matches);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setPosition(0);
  }, [items.length]);

  useEffect(() => {
    if (!loops || paused || hovered || focused || reducedMotion) return;
    const timer = setInterval(() => {
      if (!document.hidden)
        setPosition((index) => (index < items.length ? index + 1 : index));
    }, 1500);
    return () => clearInterval(timer);
  }, [loops, paused, hovered, focused, reducedMotion, items.length]);

  // The four trailing copies make the last-to-first step look identical to every other step.
  const resetLoop = () => {
    setAnimated(false);
    setPosition(0);
  };
  useEffect(() => {
    if (position !== items.length || !loops) return;
    // Also reset when reduced-motion or a background tab suppresses transitionend.
    const fallback = setTimeout(resetLoop, 700);
    return () => clearTimeout(fallback);
  }, [position, items.length, loops]);
  useEffect(() => {
    if (animated) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  const slides = loops ? [...items, ...items.slice(0, 4)] : items;
  if (!items.length) return null;
  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription={vi ? "băng chuyền" : "carousel"}
      aria-label={vi ? "Đối tác đồng hành và tài trợ" : "Partners and sponsors"}
    >
      <div
        className={styles.viewport}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <div
          className={styles.track}
          data-animated={animated}
          style={{ "--position": position } as CSSProperties}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "transform" &&
              position === items.length
            )
              resetLoop();
          }}
        >
          {slides.map((partner, index) => {
            const visible = index >= position && index < position + 4;
            return (
              <div
                className={styles.slide}
                key={`${partner.id}-${index}`}
                aria-hidden={!visible}
              >
                {partner.website ? (
                  <a
                    className={styles.tile}
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partner.name}
                    tabIndex={visible ? 0 : -1}
                  >
                    <PartnerLogo partner={partner} />
                  </a>
                ) : (
                  <div className={styles.tile}>
                    <PartnerLogo partner={partner} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {loops && !reducedMotion && (
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.pause}
            aria-label={
              paused
                ? vi
                  ? "Tiếp tục chuyển logo đối tác"
                  : "Resume partner logos"
                : vi
                  ? "Tạm dừng chuyển logo đối tác"
                  : "Pause partner logos"
            }
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
