"use client";

import { useState, useTransition } from "react";
import {
  createBlogCategoryAction,
  createBlogTagAction,
  deleteBlogCategoryAction,
  deleteBlogPostAction,
  deleteBlogTagAction,
  toggleBlogPostStatusAction,
  updateBlogCategoryAction,
  updateBlogTagAction,
} from "@/actions/blog";
import { BlogForm } from "@/components/admin/blog-form";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asFormAction } from "@/lib/admin/form-action";
import type { BlogCategory, BlogPost, BlogTag } from "@/lib/types/database";

function TaxonomyForm({
  item,
  action,
}: {
  item?: BlogCategory | BlogTag;
  action: typeof createBlogCategoryAction;
}) {
  return (
    <form action={asFormAction(action)} className="grid gap-3">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="name">Name (Bangla)</Label>
        <Input id="name" name="name" defaultValue={item?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" defaultValue={item?.name_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={item?.slug} />
      </div>
      <SubmitButton>{item ? "Save" : "Add"}</SubmitButton>
    </form>
  );
}

export function BlogManager({
  posts,
  categories,
  tags,
}: {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
}) {
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Tabs defaultValue="posts">
      <TabsList>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="tags">Tags</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreating(true)}>
            Add new
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reads</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <button
                    type="button"
                    className="text-left hover:underline"
                    onClick={() => setEditing(post)}
                  >
                    {post.title}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{post.status}</Badge>
                </TableCell>
                <TableCell>{post.view_count ?? 0}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {(post.categories ?? []).map((item) => item.name).join(", ") || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(post)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending && pendingId === post.id}
                      onClick={() => {
                        setPendingId(post.id);
                        startTransition(async () => {
                          const formData = new FormData();
                          formData.set("id", post.id);
                          await toggleBlogPostStatusAction(formData);
                          setPendingId(null);
                        });
                      }}
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    {post.status === "published" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, "_blank", "noopener,noreferrer")}
                      >
                        View
                      </Button>
                    ) : null}
                    <ConfirmDelete
                      onConfirm={async () => {
                        const formData = new FormData();
                        formData.set("id", post.id);
                        await deleteBlogPostAction(formData);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        <FormDialog triggerLabel="Add new" title="Add category">
          <TaxonomyForm action={createBlogCategoryAction} />
        </FormDialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <FormDialog triggerLabel="Edit" title="Edit category">
                      <TaxonomyForm item={category} action={updateBlogCategoryAction} />
                    </FormDialog>
                    <ConfirmDelete
                      onConfirm={async () => {
                        const formData = new FormData();
                        formData.set("id", category.id);
                        await deleteBlogCategoryAction(formData);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="tags" className="space-y-4">
        <FormDialog triggerLabel="Add new" title="Add tag">
          <TaxonomyForm action={createBlogTagAction} />
        </FormDialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell>{tag.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <FormDialog triggerLabel="Edit" title="Edit tag">
                      <TaxonomyForm item={tag} action={updateBlogTagAction} />
                    </FormDialog>
                    <ConfirmDelete
                      onConfirm={async () => {
                        const formData = new FormData();
                        formData.set("id", tag.id);
                        await deleteBlogTagAction(formData);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <FormDialog
        title={editing ? "Edit post" : "Add post"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <BlogForm
          post={editing ?? undefined}
          categories={categories}
          tags={tags}
          onSuccess={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </FormDialog>
    </Tabs>
  );
}
