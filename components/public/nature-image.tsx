import { Leaf } from "lucide-react";
import Image from "next/image";
import { cn } from "cn";

export function NatureImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  natural = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  natural?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex w-full min-w-0 max-w-full items-center justify-center rounded-2xl bg-moss/60 text-primary",
          natural ? "min-h-[16rem]" : "aspect-[4/3]",
          className,
        )}
      >
        <Leaf className="size-8 opacity-70" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  if (natural) {
    return (
      <div className={cn("w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-moss/40", className)}>
        <img
          src={src}
          alt={alt}
          className={cn("block h-auto w-full", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[4/3] w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-moss/40", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
