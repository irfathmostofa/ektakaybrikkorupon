import { uploadMediaAction } from "@/actions/media";
import { compressImage } from "@/lib/compress-image";

export type MediaUploadMeta = {
  url: string;
  path?: string;
  originalSize: number;
  compressedSize: number;
};

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function savedPercent(originalSize: number, compressedSize: number) {
  if (originalSize <= 0 || compressedSize >= originalSize) {
    return 0;
  }
  return Math.round((1 - compressedSize / originalSize) * 100);
}

export type MediaUploadResult =
  | ({ ok: true } & MediaUploadMeta)
  | { ok: false; error: string; originalSize: number; compressedSize?: number };

export async function compressAndUploadImage(file: File): Promise<MediaUploadResult> {
  const originalSize = file.size;
  try {
    const compressed = await compressImage(file);
    const compressedSize = compressed.size;
    const formData = new FormData();
    formData.append("file", compressed, compressed.name);
    const result = await uploadMediaAction(formData);
    if (result.error || !result.url) {
      return {
        ok: false,
        error: result.error ?? "Upload failed.",
        originalSize,
        compressedSize,
      };
    }
    return {
      ok: true,
      url: result.url,
      path: result.path,
      originalSize,
      compressedSize,
    };
  } catch {
    return { ok: false, error: "Image compression failed.", originalSize };
  }
}
