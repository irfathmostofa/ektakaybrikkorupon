"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";

export function CountUp({
  value,
  locale,
  suffix = "",
  className,
}: {
  value: number;
  locale: Locale;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const node = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = node.current;
    if (!el) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) {
          return;
        }
        started.current = true;
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          setDisplay(Math.round(value * eased));
          if (t < 1) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={node} className={className}>
      {formatNumber(locale, display)}
      {suffix}
    </span>
  );
}
