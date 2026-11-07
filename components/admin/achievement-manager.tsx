"use client";

import { useState } from "react";
import { deleteAchievementAction, saveAchievementAction } from "@/actions/achievements";
import { asFormAction } from "@/lib/admin/form-action";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
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
import type { Achievement } from "@/lib/types/database";

function AchievementForm({ item }: { item?: Achievement }) {
  return (
    <form action={asFormAction(saveAchievementAction)} className="grid gap-3">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title (Bangla)</Label>
        <Input id="title" name="title" defaultValue={item?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title_en">Title (English)</Label>
        <Input id="title_en" name="title_en" defaultValue={item?.title_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={item?.slug} />
      </div>
      <RichTextEditor
        name="description"
        label="Description (Bangla)"
        defaultValue={item?.description}
      />
      <RichTextEditor
        name="description_en"
        label="Description (English)"
        defaultValue={item?.description_en}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="metric_value">Metric value</Label>
          <Input
            id="metric_value"
            name="metric_value"
            type="number"
            defaultValue={item?.metric_value ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metric_label">Metric label</Label>
          <Input id="metric_label" name="metric_label" defaultValue={item?.metric_label ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="achieved_on">Date</Label>
        <Input id="achieved_on" name="achieved_on" type="date" defaultValue={item?.achieved_on ?? ""} />
      </div>
      <ImageField name="image_url" label="Image" defaultValue={item?.image_url} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={item?.is_published} />
        Published
      </label>
      <SubmitButton>{item ? "Save" : "Create"}</SubmitButton>
    </form>
  );
}

export function AchievementManager({ items }: { items: Achievement[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          Add new
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Metric</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>
                {item.metric_value ?? "—"} {item.metric_label}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{item.is_published ? "published" : "draft"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(item)}>
                    Edit
                  </Button>
                  <ConfirmDelete
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("id", item.id);
                      await deleteAchievementAction(formData);
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormDialog
        title={editing ? "Edit achievement" : "Add achievement"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <AchievementForm key={editing?.id ?? "new"} item={editing ?? undefined} />
      </FormDialog>
    </div>
  );
}
