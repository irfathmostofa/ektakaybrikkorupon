"use client";

import { ImageUploader } from "@/components/admin/image-uploader";

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
    <ImageUploader
      name={name}
      label={label}
      defaultValue={defaultValue}
      library={library}
    />
  );
}
