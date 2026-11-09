"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlogPostAction,
  updateBlogPostAction,
} from "@/actions/blog";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { MediaUploader } from "@/components/admin/media-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
import type { BlogCategory, BlogPost, BlogTag } from "@/lib/types/database";

const initialState: ActionState = {};

export function BlogForm({
  post,
  categories,
  tags,
}: {
  post?: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
}) {
  const router = useRouter();
  const action = post ? updateBlogPostAction : createBlogPostAction;
  const [state, formAction] = useActionState(action, initialState);
  const [title, setTitle] = useState(post?.title ?? "");
  const [titleEn, setTitleEn] = useState(post?.title_en ?? "");
  const [manualSlug, setManualSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [locale, setLocale] = useState<"bn" | "en">("bn");
  const slug = slugTouched ? manualSlug : slugify(titleEn);
  const selectedCategories = useMemo(
    () => new Set((post?.categories ?? []).map((item) => item.id)),
    [post?.categories],
  );
  const selectedTags = useMemo(
    () => new Set((post?.tags ?? []).map((item) => item.id)),
    [post?.tags],
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin/blog");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="space-y-5">
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add title"
            className="h-auto border-0 bg-transparent px-0 text-2xl font-heading shadow-none focus-visible:ring-0 sm:text-3xl"
          />
          <Input
            id="title_en"
            name="title_en"
            required
            value={titleEn}
            onChange={(event) => setTitleEn(event.target.value)}
            placeholder="English title"
            className="h-auto border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Permalink:</span>
            <span className="rounded bg-muted px-1.5 py-0.5">/blog/</span>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setManualSlug(event.target.value);
              }}
              className="h-7 max-w-xs"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Content</p>
            <div className="inline-flex rounded-lg bg-muted p-1 text-muted-foreground">
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-sm ${locale === "bn" ? "bg-background text-foreground shadow-sm" : ""}`}
                onClick={() => setLocale("bn")}
              >
                Bangla
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-sm ${locale === "en" ? "bg-background text-foreground shadow-sm" : ""}`}
                onClick={() => setLocale("en")}
              >
                English
              </button>
            </div>
          </div>
          <div className={locale === "bn" ? "block" : "hidden"}>
            <RichTextEditor
              name="content"
              defaultValue={post?.content}
              required
              variant="document"
              placeholder="Write your post…"
            />
          </div>
          <div className={locale === "en" ? "block" : "hidden"}>
            <RichTextEditor
              name="content_en"
              defaultValue={post?.content_en}
              variant="document"
              placeholder="Write the English version…"
            />
          </div>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium capitalize text-foreground">{status}</span>
            </p>
            <FormMessage state={state} />
            <div className="flex flex-wrap gap-2">
              <SubmitButton
                variant="outline"
                pendingLabel="Saving..."
                name="status"
                value="draft"
                onClick={() => setStatus("draft")}
              >
                Save draft
              </SubmitButton>
              <SubmitButton
                pendingLabel="Publishing..."
                name="status"
                value="published"
                onClick={() => setStatus("published")}
              >
                {post?.status === "published" ? "Update" : "Publish"}
              </SubmitButton>
            </div>
            {post?.status === "published" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/blog/${post.slug}`, "_blank", "noopener,noreferrer")}
              >
                View post
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured image</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader
              name="cover_image_url"
              label=""
              defaultValue={post?.cover_image_url}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="category_ids"
                  value={category.id}
                  defaultChecked={selectedCategories.has(category.id)}
                />
                {category.name}
              </label>
            ))}
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">Add categories first.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={selectedTags.has(tag.id)}
                />
                {tag.name}
              </label>
            ))}
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">Add tags first.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Excerpt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="excerpt">Bangla</Label>
              <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt_en">English</Label>
              <Textarea
                id="excerpt_en"
                name="excerpt_en"
                defaultValue={post?.excerpt_en ?? ""}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
