"use client";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  Download,
  FileText,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import NewsImage from "@/components/news/NewsImage";
import styles from "../../detail.module.css";
interface Attachment {
  id: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
}
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  createdAt: string;
  topic?: { id: string; name: string };
  attachments?: Attachment[];
}
const fileKind = (file: Attachment) => {
  const ext = file.fileName?.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 5) return ext;
  if (file.fileType?.includes("pdf") || /\.pdf(?:[?#]|$)/i.test(file.fileUrl))
    return "PDF";
  return "Tài liệu";
};
export default function DocumentDetailPage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params?.locale || "vi";
  const slug = params?.slug || "";
  const [doc, setDoc] = useState<Article | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [selected, setSelected] = useState<Attachment | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setDoc(null);
    setSelected(null);
    apiClient
      .request(`/documents/slug/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok)
          throw Error(
            res.status === 404
              ? "Không tìm thấy tài liệu này."
              : "Chưa thể tải tài liệu. Vui lòng thử lại.",
          );
        return res.json();
      })
      .then((data) => {
        if (active) setDoc(data);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Chưa thể tải tài liệu.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, retry]);
  const back = `/${locale}/creator-lab?tab=docs`;
  if (loading)
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty} role="status">
            <Loader2 className="animate-spin" size={24} />
            <p>Đang tải tài liệu...</p>
          </div>
        </div>
      </main>
    );
  if (error || !doc)
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <h1>{error || "Không tìm thấy tài liệu"}</h1>
            <button onClick={() => setRetry((n) => n + 1)}>Thử lại</button>
            <br />
            <Link href={back}>Quay lại thư viện</Link>
          </div>
        </div>
      </main>
    );
  const attachments = doc.attachments || [];
  const updated = Number.isNaN(Date.parse(doc.createdAt))
    ? "Đang cập nhật"
    : new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(doc.createdAt));
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Điều hướng trang">
          <Link href={back}>
            <ArrowLeft size={14} /> Creator Lab
          </Link>
          <span>/</span>
          <span>Thư viện tài liệu</span>
        </nav>
        <header className={styles.hero}>
          <div>
            <Link className={styles.brand} href={`/${locale}/creator-lab`}>
              <Image
                src="/KV/logo vncl.png"
                alt="Vietnam Creator Lab"
                width={2071}
                height={555}
                sizes="200px"
                priority
              />
            </Link>
            <p className={styles.eyebrow}>
              {doc.topic?.name || "Tri thức cùng chia sẻ"}
            </p>
            <h1>{doc.title}</h1>
            <div className={styles.facts}>
              <span>
                <FileText size={15} />
                {attachments.length} tệp đính kèm
              </span>
              <span>Cập nhật {updated}</span>
            </div>
            <a className={styles.textLink} href="#document-content">
              Đọc nội dung <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={styles.heroMedia}>
            <NewsImage
              src={doc.thumbnailUrl}
              className={styles.cover}
              sizes="(max-width:767px) 100vw, 45vw"
              priority
            />
            <span className={styles.mediaLabel}>
              <BookOpen size={16} /> Chia sẻ tri thức. Lan tỏa giá trị.
            </span>
          </div>
        </header>
        <div className={styles.layout}>
          <article
            id="document-content"
            className={`${styles.article} ${styles.section}`}
          >
            <p className={styles.eyebrow}>Thư viện Vietnam Creator Lab</p>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  doc.content || "<p>Nội dung tài liệu đang được cập nhật.</p>",
                ),
              }}
            />
          </article>
          <aside>
            <div className={styles.sideCard}>
              <span className={styles.roundIcon}>
                <FileText size={24} strokeWidth={1.5} />
              </span>
              <p className={styles.eyebrow}>Mang kiến thức theo bạn</p>
              <h2>Tài liệu đính kèm</h2>
              <p>Đọc trực tiếp hoặc tải về để tham khảo khi cần.</p>
              {attachments.length ? (
                attachments.map((file) => (
                  <div className={styles.file} key={file.id}>
                    <h3>{file.fileName || "Tài liệu tham khảo"}</h3>
                    <span className={styles.fileType}>{fileKind(file)}</span>
                    <div className={styles.fileActions}>
                      <button
                        onClick={() => setSelected(file)}
                        aria-label={`Đọc ${file.fileName || "tài liệu"}`}
                      >
                        <BookOpen size={15} /> Đọc ngay
                      </button>
                      <a
                        href={file.fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Tải ${file.fileName || "tài liệu"}`}
                      >
                        <Download size={15} /> Tải về
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.empty}>Chưa có tệp đính kèm.</p>
              )}
              <Link className={styles.textLink} href={back}>
                Khám phá thêm tài liệu <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className={styles.viewer} aria-describedby={undefined}>
          <DialogTitle className={styles.viewerTitle}>
            {selected?.fileName || "Đọc tài liệu"}
          </DialogTitle>
          <div className={styles.viewerBody}>
            {selected && (
              <iframe
                title={selected.fileName || "Tài liệu tham khảo"}
                src={selected.fileUrl}
                allowFullScreen
              />
            )}
          </div>
          {selected && (
            <a
              className={styles.textLink}
              href={selected.fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Không xem được? Mở tài liệu trong tab mới{" "}
              <ArrowUpRight size={14} />
            </a>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
