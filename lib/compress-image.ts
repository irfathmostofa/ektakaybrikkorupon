import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/x-icon" ||
    file.type === "image/vnd.microsoft.icon" ||
    file.name.toLowerCase().endsWith(".ico")
  ) {
    return file;
  }

  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.92,
    fileType: file.type,
  });
}
