"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import {
  deleteMediaAction,
  getMediaPublicUrl,
  listMedia,
} from "@/actions/media";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  compressAndUploadImage,
  formatBytes,
  savedPercent,
} from "@/lib/admin/upload-image";
import { cn } from "cn";

type MediaItem = { name: string; url: string };

export function MediaUploader({
  name,
  label = "Upload image",
  defaultValue,
  library = true,
  onUploaded,
}: {
  name?: string;
  label?: string;
  defaultValue?: string | null;
  library?: boolean;
  onUploaded?: (url: string, path?: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setError(null);
    setOriginalSize(file.size);
    setCompressedSize(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
    startTransition(async () => {
      const result = await compressAndUploadImage(file);
      if (result.compressedSize != null) {
        setCompressedSize(result.compressedSize);
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(result.url);
      onUploaded?.(result.url, result.path);
    });
  }

  const saved =
    originalSize != null && compressedSize != null
      ? savedPercent(originalSize, compressedSize)
      : null;

  return (
    <div className="space-y-3">
      {label ? <Label>{label}</Label> : null}
      {name ? <input type="hidden" name={name} value={url} /> : null}
      <div
        className={cn(
          "relative flex h-40 w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-dashed border-input bg-muted/30 transition-colors",
          dragOver && "border-primary bg-primary/5",
        )}
        onClick={() => fileRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
      >
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
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8" />
            <span className="flex items-center gap-1 text-xs">
              <Upload className="size-3.5" />
              Drop an image or click to upload
            </span>
          </div>
        )}
        {pending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-medium">
            {compressedSize == null ? "Compressing…" : "Uploading…"}
          </div>
        ) : null}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            handleFile(file);
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
              setOriginalSize(null);
              setCompressedSize(null);
              onUploaded?.("");
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {originalSize != null ? (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
          <p>
            <span className="text-muted-foreground">Original: </span>
            <span className="font-medium">{formatBytes(originalSize)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">After compress: </span>
            <span className="font-medium">
              {compressedSize == null ? "Compressing…" : formatBytes(compressedSize)}
            </span>
            {saved != null && saved > 0 ? (
              <span className="text-emerald-700"> · saved {saved}%</span>
            ) : null}
          </p>
        </div>
      ) : null}
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
                <div key={item.name} className="space-y-2">
                  <button
                    type="button"
                    className="w-full overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-ring"
                    onClick={() => {
                      setUrl(item.url);
                      setPreview(null);
                      setOriginalSize(null);
                      setCompressedSize(null);
                      setLibraryOpen(false);
                      onUploaded?.(item.url, item.name);
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
                  <ConfirmDelete
                    label="Remove"
                    title="Remove this file?"
                    description="This deletes the uploaded file from storage."
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("path", item.name);
                      await deleteMediaAction(formData);
                      setItems((current) => current.filter((file) => file.name !== item.name));
                      if (url.includes(item.name)) {
                        setUrl("");
                        setPreview(null);
                      }
                    }}
                  />
                </div>
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
