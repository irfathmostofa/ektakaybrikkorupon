"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMediaAction } from "@/actions/media";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/compress-image";

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function wrapSelectedImage(align: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  const node = selection.anchorNode;
  const element =
    node instanceof HTMLElement
      ? node
      : node?.parentElement;
  const image =
    element instanceof HTMLImageElement
      ? element
      : element?.querySelector?.("img") ??
        (element?.closest("img") as HTMLImageElement | null);
  if (!image) {
    return;
  }
  image.classList.remove("align-left", "align-center", "align-right", "align-full");
  image.classList.add(align);
}

export function RichTextEditor({
  name,
  label,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [uploading, setUploading] = useState(false);
  const savedRange = useRef<Range | null>(null);

  function sync() {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  function rememberRange() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRange.current = selection.getRangeAt(0);
    }
  }

  function restoreRange() {
    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
  }

  useEffect(() => {
    if (editorRef.current && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
      sync();
    }
  }, [defaultValue]);

  async function insertImage(file: File) {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name);
      const result = await uploadMediaAction(formData);
      if (!result.url) {
        return;
      }
      restoreRange();
      editorRef.current?.focus();
      exec(
        "insertHTML",
        `<img src="${result.url}" alt="" class="align-center" />`,
      );
      sync();
    } finally {
      setUploading(false);
    }
  }

  function applyLink() {
    const url = linkUrl.trim();
    if (!url) {
      setLinkOpen(false);
      return;
    }
    restoreRange();
    editorRef.current?.focus();
    const text = linkText.trim() || url;
    const target = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
    exec("insertHTML", `<a href="${url}"${target}>${text}</a>`);
    sync();
    setLinkOpen(false);
    setLinkText("");
    setLinkUrl("");
    setLinkNewTab(true);
  }

  const tools = [
    { cmd: "bold", label: "B", className: "font-bold" },
    { cmd: "italic", label: "I", className: "italic" },
    { cmd: "underline", label: "U", className: "underline" },
    { cmd: "insertUnorderedList", label: "List" },
    { cmd: "formatBlock", label: "H2", value: "h2" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="overflow-hidden rounded-lg border border-input">
        <div className="flex flex-wrap gap-1 border-b border-input bg-muted/40 p-1">
          {tools.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`rounded px-2 py-1 text-xs hover:bg-background ${item.className ?? ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                exec(item.cmd, item.value);
                sync();
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="rounded px-2 py-1 text-xs hover:bg-background"
            onMouseDown={(event) => {
              event.preventDefault();
              rememberRange();
              const selection = window.getSelection()?.toString() ?? "";
              setLinkText(selection);
              setLinkOpen(true);
            }}
          >
            Link
          </button>
          <button
            type="button"
            className="rounded px-2 py-1 text-xs hover:bg-background"
            disabled={uploading}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberRange();
              fileRef.current?.click();
            }}
          >
            {uploading ? "Uploading..." : "Image"}
          </button>
          {[
            { align: "align-left", label: "Left" },
            { align: "align-center", label: "Center" },
            { align: "align-right", label: "Right" },
            { align: "align-full", label: "Full" },
          ].map((item) => (
            <button
              key={item.align}
              type="button"
              className="rounded px-2 py-1 text-xs hover:bg-background"
              onMouseDown={(event) => {
                event.preventDefault();
                wrapSelectedImage(item.align);
                sync();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {linkOpen ? (
          <div className="grid gap-2 border-b border-input bg-muted/20 p-2 sm:grid-cols-[1fr_1fr_auto_auto]">
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              placeholder="Link text"
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
            />
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              placeholder="https://"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(event) => setLinkNewTab(event.target.checked)}
              />
              New tab
            </label>
            <button
              type="button"
              className="h-8 rounded-md bg-primary px-2 text-xs text-primary-foreground"
              onClick={applyLink}
            >
              Attach
            </button>
          </div>
        ) : null}
        <div
          id={name}
          ref={editorRef}
          contentEditable
          className="prose-html min-h-36 px-3 py-2 text-sm outline-none"
          onInput={sync}
          onBlur={sync}
          suppressContentEditableWarning
        />
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
            void insertImage(file);
          }
        }}
      />
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </div>
  );
}
