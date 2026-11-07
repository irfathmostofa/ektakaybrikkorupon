"use client";

import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

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
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-canopy shadow-sm">
        <iframe
          src={`${src}#toolbar=1&navpanes=0`}
          title={title}
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
