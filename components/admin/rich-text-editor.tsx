"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { uploadMediaAction } from "@/actions/media";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/compress-image";

const AlignImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "align-center",
      },
    };
  },
});

function isEmptyHtml(value: string) {
  return (
    !value.trim() ||
    /^<p>(<br\s*\/?>|&nbsp;|\s)*<\/p>$/i.test(value.trim()) ||
    !value
      .replace(/<br\s*\/?>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]*>/g, "")
      .trim()
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  className,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded px-2 py-1 text-xs hover:bg-background disabled:opacity-50 ${
        active ? "bg-background font-medium" : ""
      } ${className ?? ""}`}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
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
  const fileRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const initialHtml = defaultValue ?? "";
  const [html, setHtml] = useState(initialHtml);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      AlignImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: "Write here…",
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose-html min-h-36 px-3 py-2 text-sm outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      setHtml(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const next = defaultValue ?? "";
    const current = editor.getHTML();
    if (current === next || (isEmptyHtml(current) && isEmptyHtml(next))) {
      return;
    }
    editor.commands.setContent(next, { emitUpdate: false });
    setHtml(next);
  }, [defaultValue, editor]);

  const submittedValue = isEmptyHtml(html) ? "" : html;

  useEffect(() => {
    hiddenRef.current?.setCustomValidity(
      required && !submittedValue ? "This field is required." : "",
    );
  }, [required, submittedValue]);

  async function insertImage(file: File) {
    if (!editor) {
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name);
      const result = await uploadMediaAction(formData);
      if (!result.url) {
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent(`<img src="${result.url}" alt="" class="align-center" />`)
        .run();
    } finally {
      setUploading(false);
    }
  }

  function applyLink() {
    if (!editor) {
      return;
    }
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
      setLinkOpen(false);
      return;
    }
    const attrs = {
      href: url,
      target: linkNewTab ? "_blank" : null,
      rel: linkNewTab ? "noopener noreferrer" : null,
    };
    const text = linkText.trim();
    if (text && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text,
          marks: [{ type: "link", attrs }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    }
    setLinkOpen(false);
    setLinkText("");
    setLinkUrl("");
    setLinkNewTab(true);
  }

  function setImageAlign(align: string) {
    editor?.chain().focus().updateAttributes("image", { class: align }).run();
  }

  function openLinkPopover() {
    if (!editor) {
      return;
    }
    const previous = editor.getAttributes("link").href ?? "";
    setLinkUrl(typeof previous === "string" ? previous : "");
    setLinkText(
      editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " ",
      ),
    );
    setLinkNewTab(editor.getAttributes("link").target === "_blank" || !previous);
    setLinkOpen(true);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <div className="relative overflow-hidden rounded-lg border border-input bg-background">
        <div className="flex flex-wrap gap-1 border-b border-input bg-muted/40 p-1">
          <ToolbarButton
            active={editor?.isActive("bold")}
            className="font-bold"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("italic")}
            className="italic"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            I
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("underline")}
            className="underline"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            U
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            List
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </ToolbarButton>
          <ToolbarButton onClick={openLinkPopover}>Link</ToolbarButton>
          <ToolbarButton
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Image"}
          </ToolbarButton>
          {[
            { align: "align-left", label: "Left" },
            { align: "align-center", label: "Center" },
            { align: "align-right", label: "Right" },
            { align: "align-full", label: "Full" },
          ].map((item) => (
            <ToolbarButton
              key={item.align}
              active={editor?.isActive("image", { class: item.align })}
              onClick={() => setImageAlign(item.align)}
            >
              {item.label}
            </ToolbarButton>
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
        <EditorContent editor={editor} />
        <input
          ref={hiddenRef}
          id={name}
          type="text"
          name={name}
          value={submittedValue}
          required={required}
          tabIndex={-1}
          aria-label={label}
          className="pointer-events-none absolute bottom-2 left-3 h-px w-px opacity-0"
          onChange={() => {}}
          onFocus={() => editor?.commands.focus()}
          onInvalid={(event) => {
            event.preventDefault();
            hiddenRef.current?.setCustomValidity("This field is required.");
            editor?.commands.focus();
          }}
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
    </div>
  );
}
