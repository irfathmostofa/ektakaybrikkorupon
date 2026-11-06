"use client";

import { useActionState } from "react";
import { updatePageAction } from "@/actions/pages";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PageContent } from "@/lib/types/database";

const initialState: ActionState = {};

export function PageForm({ page }: { page: PageContent }) {
  const [state, formAction] = useActionState(updatePageAction, initialState);

  return (
    <form action={formAction} className="grid max-w-3xl gap-4">
      <input type="hidden" name="id" value={page.id} />
      <p className="text-sm text-muted-foreground">Page key: {page.page_key}</p>
      <div className="space-y-2">
        <Label htmlFor="title">Title (Bangla)</Label>
        <Input id="title" name="title" defaultValue={page.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title_en">Title (English)</Label>
        <Input id="title_en" name="title_en" defaultValue={page.title_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Bangla)</Label>
        <Input id="subtitle" name="subtitle" defaultValue={page.subtitle ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle_en">Subtitle (English)</Label>
        <Input
          id="subtitle_en"
          name="subtitle_en"
          defaultValue={page.subtitle_en ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Body (Bangla)</Label>
        <Textarea id="body" name="body" defaultValue={page.body ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body_en">Body (English)</Label>
        <Textarea id="body_en" name="body_en" defaultValue={page.body_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta title (Bangla)</Label>
        <Input
          id="meta_title"
          name="meta_title"
          defaultValue={page.meta_title ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta_title_en">Meta title (English)</Label>
        <Input
          id="meta_title_en"
          name="meta_title_en"
          defaultValue={page.meta_title_en ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta description (Bangla)</Label>
        <Textarea
          id="meta_description"
          name="meta_description"
          defaultValue={page.meta_description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta_description_en">Meta description (English)</Label>
        <Textarea
          id="meta_description_en"
          name="meta_description_en"
          defaultValue={page.meta_description_en ?? ""}
        />
      </div>
      <ImageField
        name="hero_image_url"
        label="Hero image"
        defaultValue={page.hero_image_url}
      />
      <FormMessage state={state} />
      <SubmitButton>Save page</SubmitButton>
    </form>
  );
}
