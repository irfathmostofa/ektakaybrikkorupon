"use client";

import { useRef, useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { uploadMagazinePdfAction } from "@/actions/magazines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isGoogleDriveUrl, magazinePdfViewUrl } from "@/lib/google-drive";

export function PdfField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    setError(null);
    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file, file.name);
    startTransition(async () => {
      const result = await uploadMagazinePdfAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        setUrl(result.url);
      }
    });
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            {fileName ||
              (isGoogleDriveUrl(url)
                ? "Google Drive PDF"
                : url
                  ? "PDF uploaded"
                  : "No PDF selected")}
          </p>
          {url ? (
            <a
              href={magazinePdfViewUrl(url)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Preview PDF
            </a>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${name}-drive`}>PDF URL / Google Drive link</Label>
        <Input
          id={`${name}-drive`}
          value={url}
          onChange={(event) => {
            setFileName(null);
            setError(null);
            setUrl(event.target.value.trim());
          }}
          placeholder="https://drive.google.com/file/d/.../view"
        />
        <p className="text-xs text-muted-foreground">
          Paste a public Google Drive share link, or upload a PDF file. Drive files must be shared as
          Anyone with the link.
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
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
          {pending ? "Uploading..." : "Upload PDF"}
        </Button>
        {url ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setUrl("");
              setFileName(null);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
