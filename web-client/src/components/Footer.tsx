"use client";

import { getApiUrl } from "@/utils/api";

import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import Image from "next/image";
import styles from "./footer.module.css";
import * as Icons from "lucide-react";
import { useLanguage } from "@/hooks/useTranslation";
import { useSettings } from "@/components/SettingsProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
}

const socialAssets: Record<string, string> = {
  facebook: "/social/FACEBOOK.webp",
  tiktok: "/social/TIKTOK.png",
  youtube: "/social/YOUTUBE.webp",
  instagram: "/social/INSTAGRAM.webp",
  zalo: "/social/ZALO.webp",
};
const socialNames: Record<string, string> = {
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  zalo: "Zalo",
};

export default function Footer() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { settings } = useSettings();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const apiUrl = getApiUrl("/");
        const res = await fetch(`${apiUrl}/social-links?activeOnly=true`);
        if (res.ok) {
          const envelope = await res.json();
          setSocialLinks(envelope?.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSocialLinks();
  }, []);

  const isAdminRoute =
    pathname &&
    (pathname.startsWith("/admin") || /^\/[a-z]{2}\/admin/.test(pathname));
  if (isAdminRoute) {
    return null;
  }

  const footerAbout =
    (language === "vi"
      ? settings?.footerContent?.aboutVi
      : settings?.footerContent?.aboutEn
    )?.trim() ||
    (language === "vi"
      ? "Vietnam ParaSports là nền tảng thể thao toàn diện dành cho cộng đồng người khuyết tật Việt Nam. Chúng tôi kết nối vận động viên, huấn luyện viên, câu lạc bộ và nhà tài trợ trên một nền tảng duy nhất."
      : "Vietnam ParaSports is a comprehensive sports platform for the community of people with disabilities in Vietnam. We connect athletes, coaches, clubs and sponsors on a single platform.");
  const footerAddress =
    language === "vi"
      ? settings?.footerContent?.addressVi
      : settings?.footerContent?.addressEn;
  const footerPhone = settings?.footerContent?.phone;
  const footerEmail = settings?.footerContent?.email;

  const footerStyle = {
    backgroundColor: settings?.FOOTER_COLOR || "var(--header-bg, #1e3a8a)",
    "--footer-fg":
      settings?.FOOTER_TEXT_COLOR || "var(--header-fg-default, #ffffff)",
  } as React.CSSProperties;

  return (
    <footer
      className="text-[var(--footer-fg)]/85 pt-16 pb-8 border-t border-[var(--footer-fg)]/10 transition-colors duration-300"
      role="contentinfo"
      aria-label="Chân trang"
      style={footerStyle}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Cột 1: Thông tin */}
          <div>
            <div className="mb-4">
              <Link
                href={`/${language}`}
                className={styles.brandLogo}
                aria-label={
                  language === "vi"
                    ? "Trang chủ Vietnam ParaSports"
                    : "Vietnam ParaSports home"
                }
              >
                <Image
                  src="/assets/brand/vietnam-parasports-2026-full.png"
                  width={168}
                  height={68}
                  alt="Vietnam ParaSports 2026"
                />
              </Link>
              <h3 className="text-xl font-bold text-[var(--footer-fg)]">
                Vietnam ParaSports
              </h3>
            </div>
            <p className="text-[var(--footer-fg)]/70 mb-6 text-sm leading-relaxed whitespace-pre-wrap">
              {footerAbout}
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-bold text-[var(--footer-fg)] mb-4">
              {t("footerQuickLinks")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("footerHome")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("navAbout")}
                </Link>
              </li>
              <li>
                <Link
                  href="/creator-lab"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("navCreatorLab")}
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("navNews")}
                </Link>
              </li>
              <li>
                <Link
                  href="/clubs"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("navClubs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/companion"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("navCompanion")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-lg font-bold text-[var(--footer-fg)] mb-4">
              {t("footerSupport")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("footerFaq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("footerTerms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("footerPrivacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {t("footerAccess")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-lg font-bold text-[var(--footer-fg)] mb-4">
              {t("footerContact")}
            </h3>
            <ul className="space-y-4 text-sm text-[var(--footer-fg)]/70">
              <li className="flex items-start gap-3">
                <Icons.MapPin
                  size={18}
                  className="text-[var(--footer-fg)]/70 shrink-0 mt-0.5"
                />
                <span>{footerAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Phone
                  size={18}
                  className="text-[var(--footer-fg)]/70 shrink-0"
                />
                <span>{footerPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Mail
                  size={18}
                  className="text-[var(--footer-fg)]/70 shrink-0"
                />
                <a
                  href={`mailto:${footerEmail}`}
                  className="hover:text-[var(--footer-fg)] transition-colors"
                >
                  {footerEmail}
                </a>
              </li>
            </ul>
            {socialLinks.length > 0 && (
              <div className={styles.socialLinks}>
                {socialLinks.map((link) => {
                  const identity = `${link.name} ${link.url}`.toLowerCase();
                  const platform = Object.keys(socialAssets).find((name) =>
                    identity.includes(name),
                  );
                  const asset = platform ? socialAssets[platform] : undefined;
                  const platformName = platform
                    ? socialNames[platform]
                    : link.name;
                  const tooltipId = `footer-social-${link.id}`;
                  const iconVal = (link.icon || "").trim();
                  const isSvg = iconVal.startsWith("<svg");

                  return (
                    <div key={link.id} className={styles.socialItem}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          asset
                            ? styles.socialLogo
                            : `flex items-center justify-center bg-[var(--footer-fg)]/10 hover:bg-[var(--footer-fg)]/20 text-[var(--footer-fg)]/70 hover:text-[var(--footer-fg)] transition-colors ${isSvg ? "w-10 h-10 rounded-full" : "px-3 py-1.5 rounded-full text-xs font-semibold uppercase"}`
                        }
                        aria-label={platformName}
                        aria-describedby={tooltipId}
                      >
                        {asset ? (
                          <Image src={asset} width={28} height={28} alt="" />
                        ) : isSvg ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(iconVal, {
                                USE_PROFILES: { svg: true },
                              }),
                            }}
                            className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"
                          />
                        ) : (
                          <span>{iconVal || link.name}</span>
                        )}
                      </a>
                      <span
                        id={tooltipId}
                        role="tooltip"
                        className={styles.tooltip}
                      >
                        {platformName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--footer-fg)]/10 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--footer-fg)]/60">
            &copy; {new Date().getFullYear()} {t("footerCopyright")}
          </p>
          <div className="flex gap-4 text-sm text-[var(--footer-fg)]/60">
            <span className="flex items-center gap-1">
              {t("footerDesignedBy")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
