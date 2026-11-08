"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { getMediaPublicUrl, listMedia, uploadMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/compress-image";

type MediaItem = { name: string; url: string };

export function ImageUploader({
  name,
  label,
  defaultValue,
  library = true,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  library?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadLibrary() {
    setLibraryLoading(true);
    try {
      const listed = await listMedia();
      const withUrls = await Promise.all(
        listed.map(async (item) => ({
          name: item.name,
          url: await getMediaPublicUrl(item.name),
        })),
      );
      setItems(withUrls);
    } finally {
      setLibraryLoading(false);
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name);
      startTransition(async () => {
        const result = await uploadMediaAction(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.url) {
          setUrl(result.url);
        }
      });
    } catch {
      setError("Image compression failed.");
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <div className="relative h-36 w-full overflow-hidden rounded-lg border border-dashed border-input bg-muted/30">
        {preview || url ? (
          <Image
            src={preview || url}
            alt=""
            fill
            className="object-cover"
            sizes="400px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
        >
          {pending ? "Uploading..." : "Upload from device"}
        </Button>
        {library ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={libraryLoading}
            onClick={() => {
              setLibraryOpen(true);
              void loadLibrary();
            }}
          >
            {libraryLoading ? "Loading..." : "Choose from library"}
          </Button>
        ) : null}
        {url ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setUrl("");
              setPreview(null);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Library</DialogTitle>
          </DialogHeader>
          {libraryLoading ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <span className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
              Loading library...
            </div>
          ) : items.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-ring"
                  onClick={() => {
                    setUrl(item.url);
                    setPreview(null);
                    setLibraryOpen(false);
                  }}
                >
                  <div className="relative h-28 w-full">
                    <Image
                      src={item.url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                      unoptimized
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No images in the library yet.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
