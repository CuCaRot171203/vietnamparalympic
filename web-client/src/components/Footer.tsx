"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useTranslation";
import { homeBeVietnam } from "@/lib/home-fonts";
import styles from "./footer.module.css";

const socials = [
  { name: "Facebook", href: "https://www.facebook.com/vietnamparasports.vn" },
  { name: "TikTok", href: "https://www.tiktok.com/@vietnamparasports" },
  { name: "YouTube", href: "https://www.youtube.com/@VietnamParasport" },
];

export default function Footer() {
  const pathname = usePathname();
  const { language } = useLanguage();
  if (
    pathname &&
    (pathname.startsWith("/admin") || /^\/[a-z]{2}\/admin/.test(pathname))
  )
    return null;
  const vi = language === "vi";
  const links = [
    { href: `/${language}`, label: vi ? "Trang chủ" : "Home" },
    { href: `/${language}/about`, label: vi ? "Về chúng tôi" : "About us" },
    { href: `/${language}#sports-frames`, label: vi ? "Bộ môn" : "Sports" },
    { href: `/${language}/creator-lab`, label: "Creator Lab" },
    { href: `/${language}/clubs`, label: vi ? "Câu lạc bộ" : "Clubs" },
    {
      href: `/${language}/companion`,
      label: vi ? "Đồng hành" : "Get involved",
    },
    {
      href: `/${language}/news`,
      label: vi ? "Tin tức & Sự kiện" : "News & Events",
      emphasis: true,
    },
  ];
  const email = "FA26.vietnamparasports@gmail.com";
  return (
    <footer
      id="site-footer"
      className={`${styles.footer} ${homeBeVietnam.variable}`}
      aria-label={vi ? "Chân trang" : "Footer"}
    >
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link
              href={`/${language}`}
              className={styles.brandLogo}
              aria-label={
                vi ? "Trang chủ Vietnam ParaSports" : "Vietnam ParaSports home"
              }
            >
              <Image
                src="/KV/logo_white.png"
                width={250}
                height={125}
                alt="Vietnam ParaSports 2026"
                unoptimized
                loading="eager"
                fetchPriority="low"
              />
            </Link>
            <p>
              {vi
                ? "Di sản Vinh Quang – Khơi lửa đam mê. Tiếp nối giá trị của thể thao người khuyết tật Việt Nam."
                : "A legacy of glory. A passion ignited. Carrying forward the values of sports for people with disabilities in Vietnam."}
            </p>
          </div>
          <nav
            aria-labelledby="footer-explore-heading"
            className={styles.column}
          >
            <h2 id="footer-explore-heading">{vi ? "KHÁM PHÁ" : "EXPLORE"}</h2>
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={link.emphasis ? styles.emphasis : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav
            aria-labelledby="footer-support-heading"
            className={styles.column}
          >
            <h2 id="footer-support-heading">{vi ? "HỖ TRỢ" : "SUPPORT"}</h2>
            <ul>
              <li>
                <Link href={`/${language}/faq`}>
                  {vi ? "Câu hỏi thường gặp" : "Frequently asked questions"}
                </Link>
              </li>
            </ul>
          </nav>
          <div className={`${styles.column} ${styles.contact}`}>
            <h2>
              {vi
                ? "THÔNG TIN LIÊN HỆ CHÍNH THỨC"
                : "OFFICIAL CONTACT INFORMATION"}
            </h2>
            <ul>
              <li>
                <MapPin size={17} strokeWidth={1.7} aria-hidden="true" />
                <span>36 Trần Phú Hà Nội</span>
              </li>
              <li>
                <Mail size={17} strokeWidth={1.7} aria-hidden="true" />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} Vietnam Parasports. All rights
            reserved.
          </p>
          <nav aria-label={vi ? "Mạng xã hội" : "Social media"}>
            <ul className={styles.socialLinks}>
              {socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
