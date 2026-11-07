"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  addGalleryImagesAction,
  deleteGalleryAlbumAction,
  deleteGalleryImageAction,
  reorderGalleryImagesAction,
  saveGalleryAlbumAction,
} from "@/actions/gallery";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { asFormAction } from "@/lib/admin/form-action";
import type { GalleryAlbum, GalleryImage } from "@/lib/types/database";

function AlbumForm({ album }: { album?: GalleryAlbum }) {
  return (
    <form action={asFormAction(saveGalleryAlbumAction)} className="grid gap-3">
      {album ? <input type="hidden" name="id" value={album.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title (Bangla)</Label>
        <Input id="title" name="title" defaultValue={album?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title_en">Title (English)</Label>
        <Input id="title_en" name="title_en" defaultValue={album?.title_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={album?.slug} />
      </div>
      <RichTextEditor
        name="description"
        label="Description"
        defaultValue={album?.description}
      />
      <div className="space-y-2">
        <Label htmlFor="event_date">Event date</Label>
        <Input
          id="event_date"
          name="event_date"
          type="date"
          defaultValue={album?.event_date ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={album?.sort_order ?? 0}
        />
      </div>
      <ImageField
        name="cover_image_url"
        label="Cover image"
        defaultValue={album?.cover_image_url}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={album?.is_published} />
        Published
      </label>
      <SubmitButton>{album ? "Save category" : "Create category"}</SubmitButton>
    </form>
  );
}

function MultiImageForm({ albumId }: { albumId: string }) {
  return (
    <form action={asFormAction(addGalleryImagesAction)} className="grid gap-3">
      <input type="hidden" name="album_id" value={albumId} />
      <ImageUploader
        name="image_url"
        label="Upload image"
        defaultValue=""
      />
      <p className="text-xs text-muted-foreground">
        Upload one image at a time, then save. Repeat to add more.
      </p>
      <SubmitButton>Add image</SubmitButton>
    </form>
  );
}

export function GalleryManager({
  albums,
  imagesByAlbum,
}: {
  albums: GalleryAlbum[];
  imagesByAlbum: Record<string, GalleryImage[]>;
}) {
  const [selectedId, setSelectedId] = useState(albums[0]?.id ?? "");
  const selected = albums.find((album) => album.id === selectedId) ?? albums[0];
  const images = useMemo(
    () => imagesByAlbum[selected?.id ?? ""] ?? [],
    [imagesByAlbum, selected?.id],
  );
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) {
      return;
    }
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    const formData = new FormData();
    formData.set("ordered_ids", next.map((item) => item.id).join(","));
    startTransition(async () => {
      await reorderGalleryImagesAction(formData);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        <FormDialog triggerLabel="Add category" title="Add gallery category">
          <AlbumForm />
        </FormDialog>
        <div className="space-y-1">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setSelectedId(album.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                selected?.id === album.id
                  ? "bg-sidebar-accent font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <span>{album.title}</span>
              <span className="text-xs text-muted-foreground">{album.image_count ?? 0}</span>
            </button>
          ))}
        </div>
      </aside>

      {selected ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">
                  {selected.is_published ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {images.length} images
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <FormDialog triggerLabel="Edit category" title="Edit gallery category">
                <AlbumForm album={selected} />
              </FormDialog>
              <FormDialog triggerLabel="Upload images" title="Upload images" size="md">
                <MultiImageForm albumId={selected.id} />
              </FormDialog>
              <ConfirmDelete
                title="Delete this category?"
                onConfirm={async () => {
                  const formData = new FormData();
                  formData.set("id", selected.id);
                  await deleteGalleryAlbumAction(formData);
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative h-40 w-full">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text ?? ""}
                    fill
                    className="object-cover"
                    sizes="300px"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || index === 0}
                      onClick={() => move(index, -1)}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || index === images.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      Down
                    </Button>
                  </div>
                  <ConfirmDelete
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("id", image.id);
                      await deleteGalleryImageAction(formData);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">Create a gallery category to start uploading.</p>
      )}
    </div>
  );
}
