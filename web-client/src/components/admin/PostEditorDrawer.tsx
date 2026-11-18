"use client";

import listStyles from "@/components/rich-text-lists.module.css";

import { useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ConfigProvider, Drawer, theme as antTheme } from "antd";
import { useTheme } from "next-themes";
import { Check, Eye, FilePenLine } from "lucide-react";
import { sanitizeRichText } from "@/lib/rich-text";
import localFont from "next/font/local";
import { Button } from "@/components/ui/Button";
import { homeBeVietnam, homeNeusharp } from "@/lib/home-fonts";
import styles from "./post-editor-drawer.module.css";

const calvera = localFont({
  src: "../../../public/KV/DL-Calvera-2.otf",
  weight: "400",
  display: "swap",
  variable: "--font-post-preview-title",
});
type PreviewPost = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  status: string;
  authorName?: string;
  createdAt?: string;
  publishedAt?: string | null;
};
type Props = {
  open: boolean;
  title: string;
  language: string;
  post: PreviewPost;
  category?: string;
  previewIcon?: string | null;
  previewPath?: string;
  contentPreview?: ReactNode;
  footerNote?: string;
  saveLabel?: string;
  saving: boolean;
  uploading: boolean;
  error?: string;
  onClose: () => void;
  onSave: (event: FormEvent) => void;
  children: ReactNode;
};
export default function PostEditorDrawer({
  open,
  title,
  language,
  post,
  category,
  previewIcon,
  previewPath,
  contentPreview,
  footerNote,
  saveLabel,
  saving,
  uploading,
  error,
  onClose,
  onSave,
  children,
}: Props) {
  const vi = language === "vi";
  const { resolvedTheme } = useTheme();
  const [view, setView] = useState<"editor" | "preview">("editor");
  const formRef = useRef<HTMLFormElement>(null);
  const locked = saving || uploading;
  const sanitized = useMemo(
    () => sanitizeRichText(post.content || ""),
    [post.content],
  );
  const hasContent =
    sanitized.replace(/<[^>]*>/g, "").trim().length > 0 ||
    /<(img|video|iframe)\b/i.test(sanitized);
  const save = () => {
    // Reveal the form before native required-field validation tries to focus it.
    setView("editor");
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  };
  return (
    <ConfigProvider
      theme={{
        algorithm:
          resolvedTheme === "dark"
            ? antTheme.darkAlgorithm
            : antTheme.defaultAlgorithm,
        components: {
          Select: { zIndexPopup: 1400 },
          DatePicker: { zIndexPopup: 1400 },
        },
        token: {
          colorPrimary: "#d7141e",
          borderRadius: 14,
          fontFamily: "inherit",
        },
      }}
    >
      <Drawer
        className={[
          styles.surface,
          calvera.variable,
          homeBeVietnam.variable,
          homeNeusharp.variable,
        ].join(" ")}
        title={
          <div className={styles.title}>
            <span>{title}</span>
            <p>
              {vi
                ? "Soạn bài và xem trước nội dung ngay tại đây"
                : "Write and preview your article here"}
            </p>
          </div>
        }
        placement="right"
        zIndex={1300}
        rootClassName={styles.root}
        size="var(--post-editor-width)"
        open={open}
        onClose={() => {
          if (!locked) onClose();
        }}
        afterOpenChange={(visible) => {
          if (!visible) setView("editor");
          else
            formRef.current
              ?.querySelector<HTMLInputElement>("input")
              ?.focus({ preventScroll: true });
        }}
        mask={{ closable: !locked }}
        keyboard={!locked}
        closable={!locked}
        styles={{
          body: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
        footer={
          <div className={styles.footer}>
            <span>
              {footerNote ||
                (post.status === "PUBLISHED"
                  ? vi
                    ? "Trạng thái: Đã xuất bản"
                    : "Status: Published"
                  : post.status === "PENDING"
                    ? vi
                      ? "Trạng thái: Chờ duyệt"
                      : "Status: Pending review"
                    : vi
                      ? "Trạng thái: Bản nháp"
                      : "Status: Draft")}
            </span>
            <div>
              <Button
                type="button"
                variant="outline"
                disabled={locked}
                onClick={onClose}
              >
                {vi ? "Hủy" : "Cancel"}
              </Button>
              <Button
                type="button"
                disabled={locked}
                isLoading={saving}
                onClick={save}
              >
                <Check size={16} />
                {saveLabel || (vi ? "Lưu bài viết" : "Save post")}
              </Button>
            </div>
          </div>
        }
      >
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        <div
          className={styles.viewBar}
          role="tablist"
          aria-label={vi ? "Chế độ biên tập bài viết" : "Article editing view"}
        >
          <button
            id="post-editor-tab"
            type="button"
            role="tab"
            aria-selected={view === "editor"}
            aria-controls="post-editor-panel"
            onClick={() => setView("editor")}
          >
            <FilePenLine size={15} />
            {vi ? "Soạn thảo" : "Editor"}
          </button>
          <button
            id="post-preview-tab"
            type="button"
            role="tab"
            aria-selected={view === "preview"}
            aria-controls="post-preview-panel"
            onClick={() => setView("preview")}
          >
            <Eye size={15} />
            {vi ? "Xem trước" : "Preview"}
          </button>
          <span className={styles.live}>
            <i />
            {vi ? "Cập nhật trực tiếp" : "Live preview"}
          </span>
        </div>
        <div
          className={styles.panel}
          id="post-editor-panel"
          role="tabpanel"
          aria-labelledby="post-editor-tab"
          hidden={view !== "editor"}
        >
          <form
            id="admin-post-editor-form"
            ref={formRef}
            onSubmit={onSave}
            className={styles.form}
          >
            {children}
          </form>
        </div>
        <div
          className={styles.panel}
          id="post-preview-panel"
          role="tabpanel"
          aria-labelledby="post-preview-tab"
          hidden={view !== "preview"}
          tabIndex={0}
        >
          <div className={styles.previewNotice}>
            {vi
              ? "Bản xem trước nội dung đang soạn · Chưa lưu thay đổi"
              : "Preview of your current draft · Changes are not saved"}
          </div>
          <article
            className={styles.preview}
            aria-label={vi ? "Bản xem trước bài viết" : "Article preview"}
          >
            <header className={styles.previewHero}>
              {previewIcon && (
                <span className={styles.previewIcon}>
                  <img src={previewIcon} alt="" />
                </span>
              )}
              <span className={styles.brand}>Vietnam ParaSports</span>
              <span className={styles.category}>
                {category ||
                  (vi ? "Chưa chọn danh mục" : "No category selected")}
              </span>
              <h1>
                {post.title.trim() ||
                  (vi ? "Tiêu đề bài viết của bạn" : "Your article title")}
              </h1>
              {post.excerpt && <p>{post.excerpt}</p>}
              {(post.authorName || post.createdAt || post.publishedAt) && (
                <div className={styles.previewMeta}>
                  {post.authorName && <span>{post.authorName}</span>}
                  {(
                    [
                      [post.createdAt, vi ? "Đăng" : "Created"],
                      [post.publishedAt, vi ? "Xuất bản" : "Published"],
                    ] as const
                  ).map(([date, label]) =>
                    date && !Number.isNaN(Date.parse(date)) ? (
                      <time key={label} dateTime={date}>
                        {label}:{" "}
                        {new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "Asia/Ho_Chi_Minh",
                        }).format(new Date(date))}{" "}
                        (UTC+7)
                      </time>
                    ) : null,
                  )}
                </div>
              )}
            </header>
            {post.thumbnail && (
              <figure className={styles.cover}>
                <img
                  key={post.thumbnail}
                  src={post.thumbnail}
                  alt={vi ? "Ảnh đại diện bài viết" : "Article cover"}
                />
              </figure>
            )}
            <div className={styles.previewBody}>
              {contentPreview ? (
                contentPreview
              ) : hasContent ? (
                <div
                  className={`${styles.content} ${listStyles.lists}`}
                  dangerouslySetInnerHTML={{ __html: sanitized }}
                />
              ) : (
                <p className={styles.placeholder}>
                  {vi
                    ? "Nội dung từ trình soạn thảo sẽ hiển thị tại đây. Bạn có thể quay lại Soạn thảo để thêm tiêu đề, hình ảnh và nội dung bài viết."
                    : "Your editor content will appear here. Return to Editor to add your title, images and article content."}
                </p>
              )}
              <p className={styles.previewUrl}>
                {previewPath || `/${language}/news/${post.slug || "..."}`}
              </p>
            </div>
          </article>
        </div>
      </Drawer>
    </ConfigProvider>
  );
}
