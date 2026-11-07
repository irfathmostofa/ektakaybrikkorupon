import { cn } from "@/lib/utils";
import { isEmptyHtml, sanitizeHtml } from "@/lib/sanitize-html";

export function RichHtml({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  if (isEmptyHtml(html)) {
    return null;
  }
  const value = html ?? "";
  if (!/<[a-z][\s\S]*>/i.test(value)) {
    return <div className={cn("rich-html whitespace-pre-line", className)}>{value}</div>;
  }
  return (
    <div
      className={cn("rich-html", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  );
}
