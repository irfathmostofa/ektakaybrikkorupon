"use client";

import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
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

  function sync() {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  useEffect(() => {
    if (editorRef.current && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
      sync();
    }
  }, [defaultValue]);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="overflow-hidden rounded-lg border border-input">
        <div className="flex flex-wrap gap-1 border-b border-input bg-muted/40 p-1">
          {[
            { cmd: "bold", label: "B", className: "font-bold" },
            { cmd: "italic", label: "I", className: "italic" },
            { cmd: "underline", label: "U", className: "underline" },
            { cmd: "insertUnorderedList", label: "List" },
            { cmd: "formatBlock", label: "H2", value: "h2" },
          ].map((item) => (
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
              const url = window.prompt("Link URL");
              if (url) {
                exec("createLink", url);
                sync();
              }
            }}
          >
            Link
          </button>
        </div>
        <div
          id={name}
          ref={editorRef}
          contentEditable
          className="min-h-36 px-3 py-2 text-sm outline-none"
          onInput={sync}
          onBlur={sync}
          suppressContentEditableWarning
        />
      </div>
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
