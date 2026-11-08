"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { pickLocalized, type Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { GalleryImage } from "@/lib/types/database";

export function GalleryLightbox({
  images,
  locale,
  dict,
}: {
  images: GalleryImage[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef(0);
  const current = index === null ? null : images[index];

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => {
    setIndex((value) => {
      if (value === null) return value;
      return (value + images.length - 1) % images.length;
    });
  }, [images.length]);
  const next = useCallback(() => {
    setIndex((value) => {
      if (value === null) return value;
      return (value + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (index === null) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, prev, next]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, imageIndex) => {
          const alt =
            pickLocalized(locale, image.alt_text, image.alt_text_en) ||
            pickLocalized(locale, image.caption, image.caption_en);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-card text-left"
            >
              <span className="relative block aspect-[4/3] w-full">
                <Image
                  src={image.image_url}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </span>
              {alt ? (
                <span className="block px-3 py-3 text-sm text-muted-foreground sm:px-4">
                  {pickLocalized(locale, image.caption, image.caption_en)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pickLocalized(locale, current.caption, current.caption_en)}
          className="fixed inset-0 z-50 flex h-dvh max-h-dvh w-full flex-col bg-canopy/95"
          onClick={close}
          onTouchStart={(event) => {
            touchX.current = event.changedTouches[0]?.clientX ?? 0;
          }}
          onTouchEnd={(event) => {
            const x = event.changedTouches[0]?.clientX ?? 0;
            const delta = x - touchX.current;
            if (delta > 50) prev();
            if (delta < -50) next();
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-3 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="min-w-0 truncate text-sm text-canopy-foreground/80">
              {(index ?? 0) + 1} {dict.gallery.of} {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-white/10 p-2 text-canopy-foreground hover:bg-white/20"
              aria-label={dict.gallery.close}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-1 items-center">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}
              className="absolute left-2 z-10 rounded-full bg-black/40 p-2 text-canopy-foreground hover:bg-black/55 sm:left-4"
              aria-label={dict.gallery.previous}
            >
              <ChevronLeft className="size-5 sm:size-6" />
            </button>
            <figure
              className="flex h-full min-h-0 w-full min-w-0 flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative mx-12 min-h-0 w-auto flex-1 sm:mx-16">
                <Image
                  src={current.image_url}
                  alt={
                    pickLocalized(locale, current.alt_text, current.alt_text_en) ||
                    pickLocalized(locale, current.caption, current.caption_en)
                  }
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-sm text-canopy-foreground/85 sm:px-6">
                {pickLocalized(locale, current.caption, current.caption_en)}
              </figcaption>
            </figure>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              className="absolute right-2 z-10 rounded-full bg-black/40 p-2 text-canopy-foreground hover:bg-black/55 sm:right-4"
              aria-label={dict.gallery.next}
            >
              <ChevronRight className="size-5 sm:size-6" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
