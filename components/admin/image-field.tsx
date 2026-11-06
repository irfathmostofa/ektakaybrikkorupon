"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "@/components/admin/media-uploader";

export function ImageField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          name={name}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
        />
      </div>
      <MediaUploader onUploaded={setUrl} />
    </div>
  );
}
