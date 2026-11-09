"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";

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
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/12 text-primary",
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function EditorToolbar({
  editor,
  onOpenLink,
  onInsertImage,
}: {
  editor: Editor | null;
  onOpenLink: () => void;
  onInsertImage: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/40 px-2 py-1.5">
      <ToolbarGroup>
        <ToolbarButton
          title="Undo"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarGroup>
        <ToolbarButton
          title="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarGroup>
        <ToolbarButton
          title="Heading 1"
          active={editor?.isActive("heading", { level: 1 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal line"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarGroup>
        <ToolbarButton
          title="Bulleted list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarGroup>
        <ToolbarButton title="Insert link" active={editor?.isActive("link")} onClick={onOpenLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Remove link"
          disabled={!editor?.isActive("link")}
          onClick={() => editor?.chain().focus().unsetLink().run()}
        >
          <Unlink className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={onInsertImage}>
          <ImageIcon className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarGroup>
        <ToolbarButton
          title="Align left"
          active={editor?.isActive({ textAlign: "left" })}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor?.isActive({ textAlign: "center" })}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor?.isActive({ textAlign: "right" })}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor?.isActive({ textAlign: "justify" })}
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
     
    </div>
  );
}

export function RichTextEditor({
  name,
  label,
  defaultValue,
  required,
  placeholder = "Start writing…",
  variant = "default",
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
  variant?: "default" | "document";
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const initialHtml = defaultValue ?? "";
  const [html, setHtml] = useState(initialHtml);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const documentMode = variant === "document";

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      AlignImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: cn(
          "prose-html overflow-y-auto px-4 py-3 leading-relaxed outline-none",
          documentMode
            ? "min-h-[32rem] max-h-[70vh] text-base"
            : "min-h-48 max-h-[28rem] text-sm",
        ),
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
    editor.commands.setContent(next);
  }, [defaultValue, editor]);

  const submittedValue = isEmptyHtml(html) ? "" : html;

  useEffect(() => {
    hiddenRef.current?.setCustomValidity(
      required && !submittedValue ? "This field is required." : "",
    );
  }, [required, submittedValue]);

  function insertUploadedImage(url: string) {
    if (!editor || !url) {
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(`<img src="${url}" alt="" class="align-center" />`)
      .run();
    setMediaOpen(false);
    setPendingImageUrl("");
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
      {label ? (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      ) : null}
      <div className="relative overflow-hidden rounded-xl border border-input bg-background shadow-sm transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <EditorToolbar
          editor={editor}
          onOpenLink={openLinkPopover}
          onInsertImage={() => setMediaOpen(true)}
        />
        {linkOpen ? (
          <div className="grid gap-2 border-b border-input bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center">
            <Input
              placeholder="Link text"
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
            />
            <Input
              placeholder="https://"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(event) => setLinkNewTab(event.target.checked)}
              />
              New tab
            </label>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={applyLink}>
                Apply
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setLinkOpen(false)}>
                Cancel
              </Button>
            </div>
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
          aria-label={label ?? name}
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
      <Dialog
        open={mediaOpen}
        onOpenChange={(open) => {
          setMediaOpen(open);
          if (!open) {
            setPendingImageUrl("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
          </DialogHeader>
          <MediaUploader
            label="Upload or choose an image"
            onUploaded={(nextUrl) => setPendingImageUrl(nextUrl)}
          />
          <Button
            type="button"
            disabled={!pendingImageUrl}
            onClick={() => insertUploadedImage(pendingImageUrl)}
          >
            Insert into post
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
