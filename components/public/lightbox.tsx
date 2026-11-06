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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
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
              className="group overflow-hidden rounded-2xl border border-border bg-card text-left"
            >
              <span className="relative block aspect-[4/3]">
                <Image
                  src={image.image_url}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </span>
              {alt ? (
                <span className="block px-4 py-3 text-sm text-muted-foreground">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-canopy/92 p-4"
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
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-canopy-foreground hover:bg-white/20"
            aria-label={dict.gallery.close}
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
            className="absolute left-3 rounded-full bg-white/10 p-2 text-canopy-foreground hover:bg-white/20 md:left-6"
            aria-label={dict.gallery.previous}
          >
            <ChevronLeft className="size-6" />
          </button>
          <figure
            className="relative max-h-[82vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Image
                src={current.image_url}
                alt={
                  pickLocalized(locale, current.alt_text, current.alt_text_en) ||
                  pickLocalized(locale, current.caption, current.caption_en)
                }
                fill
                priority
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center text-sm text-canopy-foreground/85">
              {pickLocalized(locale, current.caption, current.caption_en)}
              <span className="mt-1 block text-xs opacity-70">
                {(index ?? 0) + 1} {dict.gallery.of} {images.length}
              </span>
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="absolute right-3 rounded-full bg-white/10 p-2 text-canopy-foreground hover:bg-white/20 md:right-6"
            aria-label={dict.gallery.next}
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      ) : null}
    </>
  );
}
