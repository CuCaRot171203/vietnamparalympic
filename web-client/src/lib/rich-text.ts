import DOMPurify from "isomorphic-dompurify";

export function sanitizeRichText(html: string): string {
  const clean = DOMPurify.sanitize(html);
  // HTML `type` selectors are case-insensitive in CSS. A data attribute preserves
  // the distinction between a/A and i/I without replacing native start/value counters.
  return clean.replace(
    /<ol\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi,
    (_tag, attributes: string) => {
      const type = attributes.match(/(?:^|\s)type="([1aAiI])"/)?.[1];
      const attrs = attributes.replace(/\sdata-list-type="[^"]*"/gi, "");
      return `<ol${attrs}${type ? ` data-list-type="${type}"` : ""}>`;
    },
  );
}
