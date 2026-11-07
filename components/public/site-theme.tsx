import type { SiteTheme } from "@/lib/types/database";

const FONT_STACKS: Record<string, string> = {
  Fraunces: "var(--font-fraunces), var(--font-bangla-serif), ui-serif, serif",
  "Source Serif 4": "var(--font-fraunces), var(--font-bangla-serif), ui-serif, serif",
  Newsreader: "var(--font-fraunces), var(--font-bangla-serif), ui-serif, serif",
  "Source Sans 3": "var(--font-source-sans), var(--font-bangla-sans), ui-sans-serif, sans-serif",
  Figtree: "var(--font-source-sans), var(--font-bangla-sans), ui-sans-serif, sans-serif",
  "Nunito Sans": "var(--font-source-sans), var(--font-bangla-sans), ui-sans-serif, sans-serif",
};

export function SiteThemeStyle({ theme }: { theme: SiteTheme }) {
  const heading = FONT_STACKS[theme.heading_font] ?? FONT_STACKS.Fraunces;
  const body = FONT_STACKS[theme.body_font] ?? FONT_STACKS["Source Sans 3"];
  const css = `:root{--primary:${theme.primary};--secondary:${theme.secondary};--font-heading:${heading};--font-sans:${body};--ring:${theme.primary};--sidebar-primary:${theme.primary};}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {theme.mode === "dark" ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("dark")`,
          }}
        />
      ) : null}
    </>
  );
}
