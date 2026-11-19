"use client";

import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowRight, ChevronRight } from "lucide-react";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import styles from "./public-page-hero.module.css";

const calvera = localFont({
  src: "../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-public-calvera",
});
type Action = { label: string; href: string };
export default function PublicPageHero({
  locale,
  title,
  tagline,
  description,
  image,
  imageAlt,
  primary,
  secondary,
  eyebrow,
  breadcrumbTitle,
  className,
}: {
  locale: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  primary?: Action;
  secondary?: Action;
  eyebrow?: string;
  breadcrumbTitle?: string;
  className?: string;
}) {
  return (
    <section
      className={[
        styles.hero,
        calvera.variable,
        homeBeVietnam.variable,
        homeNeusharp.variable,
        className,
      ].join(" ")}
      aria-labelledby="public-page-heading"
    >
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={locale === "vi" ? "Đường dẫn" : "Breadcrumb"}
        >
          <Link href={"/" + locale}>
            {locale === "vi" ? "Trang chủ" : "Home"}
          </Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{breadcrumbTitle ?? title}</span>
        </nav>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <span className={styles.badge}>
              <i aria-hidden="true" />
              {eyebrow ?? "Vietnam ParaSports"}
            </span>
            <h1 id="public-page-heading">{title}</h1>
            <p className={styles.tagline}>{tagline}</p>
            <p className={styles.description}>{description}</p>
            {(primary || secondary) && (
              <div className={styles.actions}>
                {primary && (
                  <Link className={styles.primary} href={primary.href}>
                    {primary.label}
                    <span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </span>
                  </Link>
                )}
                {secondary && (
                  <Link className={styles.secondary} href={secondary.href}>
                    {secondary.label}
                    <span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className={styles.visual}>
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width:767px) 100vw, 45vw"
              className={styles.photo}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
