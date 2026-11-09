"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteMediaAction, getMediaPublicUrl } from "@/actions/media";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Card, CardContent } from "@/components/ui/card";

export function MediaLibrary({
  items,
}: {
  items: { name: string }[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <MediaUploader
        label="Upload image"
        onUploaded={() => router.refresh()}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No uploaded files yet.
        </p>
      ) : (
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
                <p className="truncate text-xs text-muted-foreground">{file.name}</p>
                <ConfirmDelete
                  label="Remove file"
                  title="Remove this file?"
                  description="This deletes the uploaded file from storage. Pages still using this URL will show a broken image."
                  onConfirm={async () => {
                    setError(null);
                    const formData = new FormData();
                    formData.set("path", file.name);
                    try {
                      await deleteMediaAction(formData);
                      setFiles((current) => current.filter((item) => item.name !== file.name));
                      router.refresh();
                    } catch (caught) {
                      setError(
                        caught instanceof Error ? caught.message : "Could not remove this file.",
                      );
                    }
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
