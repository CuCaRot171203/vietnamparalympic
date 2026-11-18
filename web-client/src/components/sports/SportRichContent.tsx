import listStyles from "@/components/rich-text-lists.module.css";
import { sanitizeRichText } from "@/lib/rich-text";
import styles from "./sport-rich-content.module.css";

export default function SportRichContent({ html }: { html: string }) {
  const content = sanitizeRichText(html);
  return (
    <div
      className={`${styles.content} ${listStyles.lists}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
