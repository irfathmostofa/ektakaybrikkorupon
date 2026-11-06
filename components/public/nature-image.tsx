import { Leaf } from "lucide-react";
import Image from "next/image";
import { cn } from "cn";

export function NatureImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] w-full min-w-0 max-w-full items-center justify-center rounded-2xl bg-moss/60 text-primary",
          className,
        )}
      >
        <Leaf className="size-8 opacity-70" aria-hidden />
        <span className="sr-only">{alt}</span>
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
        className="object-cover"
      />
    </div>
  );
}
