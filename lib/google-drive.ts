const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!DRIVE_HOSTS.has(host)) {
      return null;
    }
    const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch?.[1]) {
      return fileMatch[1];
    }
    const openMatch = parsed.pathname.match(/\/open\/?$/);
    const id = parsed.searchParams.get("id");
    if (id && (openMatch || parsed.pathname.startsWith("/uc") || parsed.pathname === "/open")) {
      return id;
    }
    if (id) {
      return id;
    }
    return null;
  } catch {
    return null;
  }
}

export function isGoogleDriveUrl(url: string): boolean {
  return Boolean(extractGoogleDriveFileId(url));
}

export function magazinePdfViewUrl(pdfUrl: string): string {
  const id = extractGoogleDriveFileId(pdfUrl);
  if (id) {
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return pdfUrl;
}

export function magazinePdfDownloadUrl(pdfUrl: string): string {
  const id = extractGoogleDriveFileId(pdfUrl);
  if (id) {
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  return pdfUrl;
}
