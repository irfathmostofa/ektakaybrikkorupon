"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/compress-image";

export function MediaUploader({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      setError("Choose an image to upload.");
      return;
    }

    setError(null);
    setMessage("Compressing image...");

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name);

      startTransition(async () => {
        const result = await uploadMediaAction(formData);
        if (result.error) {
          setError(result.error);
          setMessage(null);
          return;
        }
        setMessage(result.success ?? "Uploaded.");
        if (result.url) {
          onUploaded?.(result.url);
        }
        form.reset();
        router.refresh();
      });
    } catch {
      setError("Image compression failed.");
      setMessage(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="file">Upload image</Label>
        <Input id="file" name="file" type="file" accept="image/*" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading..." : "Compress and upload"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
