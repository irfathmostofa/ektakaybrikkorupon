"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { deleteMediaAction, getMediaPublicUrl } from "@/actions/media";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Card, CardContent } from "@/components/ui/card";

export function MediaLibrary({
  items,
}: {
  items: { name: string }[];
}) {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      items.map(async (item) => ({
        name: item.name,
        url: await getMediaPublicUrl(item.name),
      })),
    ).then((next) => {
      if (!cancelled) {
        setFiles(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className="space-y-8">
      <ImageUploader name="unused" label="Upload image" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <Card key={file.name}>
            <CardContent className="space-y-3">
              <div className="relative h-40 w-full overflow-hidden rounded-lg">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">{file.url}</p>
              <ConfirmDelete
                onConfirm={async () => {
                  const formData = new FormData();
                  formData.set("path", file.name);
                  await deleteMediaAction(formData);
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
