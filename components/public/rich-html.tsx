import { sanitizeHtml } from "@/lib/sanitize-html";

export function RichHtml({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html) {
    return null;
  }
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
