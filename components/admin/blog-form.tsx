"use client";

import { useActionState } from "react";
import {
  createBlogPostAction,
  deleteBlogPostAction,
  updateBlogPostAction,
} from "@/actions/blog";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_STATUSES } from "@/lib/constants";
import type { BlogPost } from "@/lib/types/database";

const initialState: ActionState = {};

export function BlogForm({ post }: { post?: BlogPost }) {
  const action = post ? updateBlogPostAction : createBlogPostAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid max-w-3xl gap-4">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}
        <div className="space-y-2">
          <Label htmlFor="title">Title (Bangla)</Label>
          <Input id="title" name="title" defaultValue={post?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_en">Title (English)</Label>
          <Input
            id="title_en"
            name="title_en"
            defaultValue={post?.title_en ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={post?.slug} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt (Bangla)</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt_en">Excerpt (English)</Label>
          <Textarea
            id="excerpt_en"
            name="excerpt_en"
            defaultValue={post?.excerpt_en ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content (Bangla)</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={post?.content ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content_en">Content (English)</Label>
          <Textarea
            id="content_en"
            name="content_en"
            defaultValue={post?.content_en ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {BLOG_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <ImageField
          name="cover_image_url"
          label="Cover image"
          defaultValue={post?.cover_image_url}
        />
        <FormMessage state={state} />
        <SubmitButton>{post ? "Update post" : "Create post"}</SubmitButton>
      </form>
      {post ? (
        <form action={deleteBlogPostAction}>
          <input type="hidden" name="id" value={post.id} />
          <Button type="submit" variant="destructive">
            Delete post
          </Button>
        </form>
      ) : null}
    </div>
  );
}
