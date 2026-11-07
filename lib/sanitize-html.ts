const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "span",
  "div",
  "img",
  "figure",
]);

const ALIGN_CLASS = new Set([
  "align-left",
  "align-center",
  "align-right",
  "align-full",
]);

function safeUrl(value: string) {
  const href = value.trim();
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("/") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }
  return "";
}

const EMPTY_HTML = /^<p>(<br\s*\/?>|&nbsp;|\s)*<\/p>$/i;

export function isEmptyHtml(value?: string | null) {
  const html = (value ?? "").trim();
  return !html || EMPTY_HTML.test(html);
}

export function stripHtml(value?: string | null) {
  const html = (value ?? "").trim();
  if (!html) {
    return "";
  }
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/h[2-3]>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag: string, attrs: string) => {
      const name = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) {
        return "";
      }
      if (name === "br") {
        return "<br />";
      }
      if (match.startsWith("</")) {
        return `</${name}>`;
      }
      if (name === "a") {
        const href = safeUrl(attrs.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? "");
        const target = /target\s*=\s*["']_blank["']/i.test(attrs) ? ' target="_blank"' : "";
        const rel = target ? ' rel="noopener noreferrer"' : "";
        return `<a href="${href || "#"}"${target}${rel}>`;
      }
      if (name === "img") {
        const src = safeUrl(attrs.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? "");
        if (!src) {
          return "";
        }
        const alt = (attrs.match(/alt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "").replace(/"/g, "");
        const className = (attrs.match(/class\s*=\s*["']([^"']+)["']/i)?.[1] ?? "")
          .split(/\s+/)
          .filter((item) => ALIGN_CLASS.has(item))
          .join(" ");
        return `<img src="${src}" alt="${alt}"${className ? ` class="${className}"` : ""} />`;
      }
      if (name === "div" || name === "figure" || name === "p") {
        const className = (attrs.match(/class\s*=\s*["']([^"']+)["']/i)?.[1] ?? "")
          .split(/\s+/)
          .filter((item) => ALIGN_CLASS.has(item))
          .join(" ");
        return className ? `<${name} class="${className}">` : `<${name}>`;
      }
      return `<${name}>`;
    });
}
