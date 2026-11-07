"use client";

import { useActionState, useEffect } from "react";
import {
  createBlogPostAction,
  updateBlogPostAction,
} from "@/actions/blog";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_STATUSES } from "@/lib/constants";
import type { BlogCategory, BlogPost, BlogTag } from "@/lib/types/database";

const initialState: ActionState = {};

export function BlogForm({
  post,
  categories,
  tags,
  onSuccess,
}: {
  post?: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
  onSuccess?: () => void;
}) {
  const action = post ? updateBlogPostAction : createBlogPostAction;
  const [state, formAction] = useActionState(action, initialState);
  const selectedCategories = new Set((post?.categories ?? []).map((item) => item.id));
  const selectedTags = new Set((post?.tags ?? []).map((item) => item.id));

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="grid gap-4">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title (Bangla)</Label>
          <Input id="title" name="title" defaultValue={post?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_en">Title (English)</Label>
          <Input id="title_en" name="title_en" defaultValue={post?.title_en ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={post?.slug} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (Bangla)</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt_en">Excerpt (English)</Label>
        <Textarea id="excerpt_en" name="excerpt_en" defaultValue={post?.excerpt_en ?? ""} />
      </div>
      <RichTextEditor
        name="content"
        label="Content (Bangla)"
        defaultValue={post?.content}
      />
      <RichTextEditor
        name="content_en"
        label="Content (English)"
        defaultValue={post?.content_en}
      />
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={post?.status ?? "draft"}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {BLOG_STATUSES.filter((status) => status !== "archived").map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
      <ImageField
        name="cover_image_url"
        label="Featured image"
        defaultValue={post?.cover_image_url}
        library={false}
      />
      <FormMessage state={state} />
      <SubmitButton>{post ? "Update post" : "Create post"}</SubmitButton>
    </form>
  );
}
