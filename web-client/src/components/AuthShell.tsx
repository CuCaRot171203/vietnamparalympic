"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import styles from "./auth-shell.module.css";

const calvera = localFont({
  src: "../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-auth-calvera",
});
export default function AuthShell({
  children,
  locale,
  mode,
}: {
  children: ReactNode;
  locale: string;
  mode: "login" | "register";
}) {
  const vi = locale === "vi";
  const register = mode === "register";
  const points = vi
    ? [
        "Kết nối vận động viên và câu lạc bộ",
        "Học hỏi, sáng tạo và chia sẻ câu chuyện",
        "Đồng hành cùng cộng đồng ParaSports",
      ]
    : [
        "Connect with athletes and clubs",
        "Learn, create and share your story",
        "Grow with the ParaSports community",
      ];
  return (
    <main
      id="main-content"
      className={[
        styles.page,
        calvera.variable,
        homeBeVietnam.variable,
        homeNeusharp.variable,
        register ? styles.registration : "",
      ].join(" ")}
    >
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.shell}>
        <aside
          className={styles.story}
          aria-label={
            vi
              ? "Cộng đồng Vietnam ParaSports"
              : "The Vietnam ParaSports community"
          }
        >
          <Link
            href={"/" + locale}
            className={styles.brand}
            aria-label={
              vi ? "Trang chủ Vietnam ParaSports" : "Vietnam ParaSports home"
            }
          >
            <Image
              src="/KV/logo_white.png"
              alt="Vietnam ParaSports"
              width={260}
              height={130}
              priority
            />
          </Link>
          <span className={styles.badge}>
            <i aria-hidden="true" />
            Vietnam ParaSports · Community
          </span>
          <h2>
            {vi
              ? register
                ? "KẾT NỐI CỘNG ĐỒNG"
                : "CHÀO MỪNG TRỞ LẠI"
              : register
                ? "JOIN OUR COMMUNITY"
                : "WELCOME BACK"}
          </h2>
          <p className={styles.tagline}>
            {vi
              ? "Cùng kết nối. Cùng tiến xa."
              : "Connect. Support. Grow together."}
          </p>
          <p className={styles.description}>
            {vi
              ? "Một tài khoản để kết nối cùng vận động viên, khám phá câu lạc bộ, học hỏi và chủ động chia sẻ câu chuyện thể thao của bạn."
              : "One account to connect with athletes, discover clubs, learn new skills and share your sporting story."}
          </p>
          <ul>
            {points.map((point, index) => (
              <li key={point}>
                <span>0{index + 1}</span>
                {point}
                <ArrowRight size={14} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </aside>
        <section
          className={styles.card}
          aria-label={
            register
              ? vi
                ? "Đăng ký tài khoản"
                : "Create an account"
              : vi
                ? "Đăng nhập tài khoản"
                : "Sign in"
          }
        >
          <Link className={styles.back} href={"/" + locale}>
            <ArrowLeft size={14} aria-hidden="true" />
            {vi ? "Về trang chủ" : "Back to home"}
          </Link>
          {children}
        </section>
      </div>
    </main>
  );
}
