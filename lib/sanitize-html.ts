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
]);

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
        const href = attrs.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
        const safe = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/")
          ? href
          : "#";
        return `<a href="${safe}" rel="noopener noreferrer" target="_blank">`;
      }
      return `<${name}>`;
    });
}
