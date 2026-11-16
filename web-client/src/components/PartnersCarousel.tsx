"use client";

import { useMemo, useState } from "react";
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
  const [paused, setPaused] = useState(false);
  const vi = language === "vi";
  // Each repeating group fills at least one desktop row, even with a short list.
  const filled = Array.from(
    { length: Math.max(1, Math.ceil(5 / Math.max(1, items.length))) },
    () => items,
  ).flat();
  const rows = [
    filled,
    [
      ...filled.slice(Math.ceil(filled.length / 2)),
      ...filled.slice(0, Math.ceil(filled.length / 2)),
    ],
  ];
  if (!items.length) return null;
  return (
    <div
      className={styles.carousel}
      data-paused={paused}
      role="region"
      aria-label={vi ? "Đối tác đồng hành và tài trợ" : "Partners and sponsors"}
      style={{ "--duration": `${filled.length * 1.5}s` } as CSSProperties}
    >
      <div className={styles.viewport}>
        {rows.map((row, rowIndex) => (
          <div className={styles.row} key={rowIndex}>
            <div
              className={styles.track}
              data-direction={rowIndex === 0 ? "left" : "right"}
            >
              {[0, 1].map((copy) => (
                <div
                  className={styles.group}
                  key={copy}
                  aria-hidden={copy === 1 ? true : undefined}
                  inert={copy === 1}
                >
                  {row.map((partner, index) => (
                    <div
                      className={styles.slide}
                      key={partner.id + "-" + index}
                    >
                      {partner.website ? (
                        <a
                          className={styles.tile}
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={partner.name}
                          tabIndex={copy === 1 ? -1 : 0}
                        >
                          <PartnerLogo partner={partner} />
                        </a>
                      ) : (
                        <div className={styles.tile}>
                          <PartnerLogo partner={partner} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </div>
  );
}
