"use client";

import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { isGoogleDriveUrl, magazinePdfViewUrl } from "@/lib/google-drive";

export function PdfReader({
  src,
  title,
  downloadHref,
  downloadLabel,
}: {
  src: string;
  title: string;
  downloadHref: string;
  downloadLabel: string;
}) {
  const viewSrc = isGoogleDriveUrl(src)
    ? magazinePdfViewUrl(src)
    : `${src}#toolbar=1&navpanes=0`;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-canopy shadow-sm">
        <iframe
          src={viewSrc}
          title={title}
          allow="autoplay"
          className="h-[80vh] w-full bg-background"
        />
      </div>
      <a
        href={downloadHref}
        className={`${buttonVariants({ size: "sm" })} inline-flex`}
      >
        <Download className="size-4" />
        {downloadLabel}
      </a>
    </div>
  );
}
