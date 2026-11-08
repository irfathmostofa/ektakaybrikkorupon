"use client";

import { useActionState, useEffect } from "react";
import {
  createCauseAction,
  updateCauseAction,
} from "@/actions/causes";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAUSE_STATUSES } from "@/lib/constants";
import type { CauseProject } from "@/lib/types/database";

const initialState: ActionState = {};

export function CauseForm({
  cause,
  onSuccess,
}: {
  cause?: CauseProject;
  onSuccess?: () => void;
}) {
  const action = cause ? updateCauseAction : createCauseAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="grid gap-4">
      {cause ? <input type="hidden" name="id" value={cause.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="title" required>
          Title (Bangla)
        </Label>
        <Input id="title" name="title" defaultValue={cause?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title_en">Title (English)</Label>
        <Input id="title_en" name="title_en" defaultValue={cause?.title_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={cause?.slug} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="short_description">Short description (Bangla)</Label>
        <Input
          id="short_description"
          name="short_description"
          defaultValue={cause?.short_description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="short_description_en">Short description (English)</Label>
        <Input
          id="short_description_en"
          name="short_description_en"
          defaultValue={cause?.short_description_en ?? ""}
        />
      </div>
      <RichTextEditor
        name="description"
        label="Description (Bangla)"
        defaultValue={cause?.description}
        required
      />
      <RichTextEditor
        name="description_en"
        label="Description (English)"
        defaultValue={cause?.description_en}
      />
      <div className="space-y-2">
        <Label htmlFor="goal_amount">Goal amount</Label>
        <Input
          id="goal_amount"
          name="goal_amount"
          type="number"
          min="0"
          step="0.01"
          defaultValue={cause?.goal_amount ?? 0}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={cause?.status ?? "draft"}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {CAUSE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={cause?.featured} />
        Featured
      </label>
      <ImageField
        name="image_url"
        label="Cover image"
        defaultValue={cause?.image_url}
      />
      <FormMessage state={state} />
      <SubmitButton>{cause ? "Update cause" : "Create cause"}</SubmitButton>
    </form>
  );
}
