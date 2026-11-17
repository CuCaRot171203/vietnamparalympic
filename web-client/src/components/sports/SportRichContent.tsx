import DOMPurify from "isomorphic-dompurify";
import styles from "./sport-rich-content.module.css";

export default function SportRichContent({ html }: { html: string }) {
  const content = DOMPurify.sanitize(html);
  return (
    <div
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
