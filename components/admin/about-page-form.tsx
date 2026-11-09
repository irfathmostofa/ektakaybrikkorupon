"use client";

import { useActionState } from "react";
import { updateAboutSectionAction, updatePageSeoAction } from "@/actions/pages";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  mergeAboutSections,
  type AboutSectionKey,
  type AboutTextBlock,
} from "@/lib/content/about-sections";
import type { PageContent } from "@/lib/types/database";

const initialState: ActionState = {};

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Input id={name} name={name} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  );
}

function SectionForm({
  pageId,
  section,
  children,
}: {
  pageId: string;
  section: AboutSectionKey;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(updateAboutSectionAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={pageId} />
      <input type="hidden" name="section" value={section} />
      {children}
      <FormMessage state={state} />
      <SubmitButton>Save section</SubmitButton>
    </form>
  );
}

function TextBlockFields({
  block,
  withEyebrow = true,
}: {
  block: AboutTextBlock;
  withEyebrow?: boolean;
}) {
  return (
    <>
      {withEyebrow ? (
        <>
          <Field label="Eyebrow (Bangla)" name="eyebrow" defaultValue={block.eyebrow} />
          <Field label="Eyebrow (English)" name="eyebrow_en" defaultValue={block.eyebrow_en} />
        </>
      ) : null}
      <Field label="Title (Bangla)" name="title" defaultValue={block.title} />
      <Field label="Title (English)" name="title_en" defaultValue={block.title_en} />
      <RichTextEditor name="body" label="Body (Bangla)" defaultValue={block.body} />
      <RichTextEditor name="body_en" label="Body (English)" defaultValue={block.body_en} />
    </>
  );
}

function SeoForm({ page }: { page: PageContent }) {
  const [state, formAction] = useActionState(updatePageSeoAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={page.id} />
      <Field label="Meta title (Bangla)" name="meta_title" defaultValue={page.meta_title} />
      <Field label="Meta title (English)" name="meta_title_en" defaultValue={page.meta_title_en} />
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
      <ImageField name="hero_image_url" label="Hero image" defaultValue={page.hero_image_url} />
      <FormMessage state={state} />
      <SubmitButton>Save SEO</SubmitButton>
    </form>
  );
}

export function AboutPageForm({ page }: { page: PageContent }) {
  const sections = mergeAboutSections(page.sections);

  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="mission">Mission</TabsTrigger>
        <TabsTrigger value="vision">Vision</TabsTrigger>
        <TabsTrigger value="values">Values</TabsTrigger>
        <TabsTrigger value="story">Story</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="extra">More</TabsTrigger>
        <TabsTrigger value="impact">Impact</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <TabsContent value="hero">
        <SectionForm pageId={page.id} section="hero">
          <Field
            label="Eyebrow (Bangla)"
            name="eyebrow"
            defaultValue={sections.hero.eyebrow}
          />
          <Field
            label="Eyebrow (English)"
            name="eyebrow_en"
            defaultValue={sections.hero.eyebrow_en}
          />
          <Field label="Title (Bangla)" name="title" defaultValue={page.title} required />
          <Field label="Title (English)" name="title_en" defaultValue={page.title_en} />
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (Bangla)</Label>
            <Textarea id="subtitle" name="subtitle" defaultValue={page.subtitle ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle_en">Subtitle (English)</Label>
            <Textarea id="subtitle_en" name="subtitle_en" defaultValue={page.subtitle_en ?? ""} />
          </div>
          <RichTextEditor name="body" label="Body (Bangla)" defaultValue={page.body} />
          <RichTextEditor name="body_en" label="Body (English)" defaultValue={page.body_en} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="mission">
        <SectionForm pageId={page.id} section="mission">
          <TextBlockFields block={sections.mission} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="vision">
        <SectionForm pageId={page.id} section="vision">
          <TextBlockFields block={sections.vision} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="values">
        <SectionForm pageId={page.id} section="values">
          <TextBlockFields block={sections.values} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="story">
        <SectionForm pageId={page.id} section="story">
          <TextBlockFields block={sections.story} />
          <ImageField name="image_url" label="Story image" defaultValue={sections.story.image_url} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="timeline">
        <SectionForm pageId={page.id} section="timeline">
          <TextBlockFields block={sections.timeline} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="extra">
        <SectionForm pageId={page.id} section="extra">
          <TextBlockFields block={sections.extra} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="impact">
        <SectionForm pageId={page.id} section="impact">
          <Field
            label="Heading (Bangla)"
            name="heading"
            defaultValue={sections.impact.heading}
          />
          <Field
            label="Heading (English)"
            name="heading_en"
            defaultValue={sections.impact.heading_en}
          />
        </SectionForm>
      </TabsContent>

      <TabsContent value="team">
        <SectionForm pageId={page.id} section="team">
          <Field
            label="Heading (Bangla)"
            name="heading"
            defaultValue={sections.team.heading}
          />
          <Field
            label="Heading (English)"
            name="heading_en"
            defaultValue={sections.team.heading_en}
          />
        </SectionForm>
      </TabsContent>

      <TabsContent value="seo">
        <SeoForm page={page} />
      </TabsContent>
    </Tabs>
  );
}
