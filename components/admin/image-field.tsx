"use client";

import { MediaUploader } from "@/components/admin/media-uploader";

export function ImageField({
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
  return (
    <MediaUploader
      name={name}
      label={label}
      defaultValue={defaultValue}
      library={library}
    />
  );
}
