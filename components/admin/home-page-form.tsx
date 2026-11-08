"use client";

import { useActionState, useState } from "react";
import { updateHomeSectionAction, updatePageSeoAction } from "@/actions/pages";
import type { ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  mergeHomeSections,
  type HomeFeature,
  type HomeSectionKey,
  type HomeStat,
} from "@/lib/content/home-sections";
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
  section: HomeSectionKey;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(updateHomeSectionAction, initialState);

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

function emptyStat(): HomeStat {
  return {
    value: "",
    value_en: "",
    label: "",
    label_en: "",
    numeric: null,
    suffix: "",
  };
}

function emptyFeature(): HomeFeature {
  return {
    title: "",
    title_en: "",
    body: "",
    body_en: "",
  };
}

function StatsEditor({ stats }: { stats: HomeStat[] }) {
  const [items, setItems] = useState(stats.length ? stats : [emptyStat()]);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Stat {index + 1}</p>
            {items.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setItems(items.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Value (Bangla)" name={`stat_value_${index}`} defaultValue={item.value} />
            <Field
              label="Value (English)"
              name={`stat_value_en_${index}`}
              defaultValue={item.value_en}
            />
            <Field label="Label (Bangla)" name={`stat_label_${index}`} defaultValue={item.label} />
            <Field
              label="Label (English)"
              name={`stat_label_en_${index}`}
              defaultValue={item.label_en}
            />
            <Field
              label="Numeric value"
              name={`stat_numeric_${index}`}
              defaultValue={item.numeric == null ? "" : String(item.numeric)}
            />
            <Field
              label="Suffix"
              name={`stat_suffix_${index}`}
              defaultValue={item.suffix}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => setItems([...items, emptyStat()])}>
        Add stat
      </Button>
    </div>
  );
}

function FeaturesEditor({ items }: { items: HomeFeature[] }) {
  const [features, setFeatures] = useState(items.length ? items : [emptyFeature()]);

  return (
    <div className="space-y-4">
      {features.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Feature {index + 1}</p>
            {features.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFeatures(features.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            ) : null}
          </div>
          <Field
            label="Title (Bangla)"
            name={`feature_title_${index}`}
            defaultValue={item.title}
          />
          <Field
            label="Title (English)"
            name={`feature_title_en_${index}`}
            defaultValue={item.title_en}
          />
          <RichTextEditor
            name={`feature_body_${index}`}
            label="Body (Bangla)"
            defaultValue={item.body}
          />
          <RichTextEditor
            name={`feature_body_en_${index}`}
            label="Body (English)"
            defaultValue={item.body_en}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => setFeatures([...features, emptyFeature()])}
      >
        Add feature
      </Button>
    </div>
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

export function HomePageForm({ page }: { page: PageContent }) {
  const sections = mergeHomeSections(page.sections);

  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="impact">Impact</TabsTrigger>
        <TabsTrigger value="story">Story</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="how">How it works</TabsTrigger>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="cta">CTA</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <TabsContent value="hero">
        <SectionForm pageId={page.id} section="hero">
          <Field label="Eyebrow (Bangla)" name="eyebrow" defaultValue={sections.hero.eyebrow} />
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
          <Field
            label="Donate button (Bangla)"
            name="donate_label"
            defaultValue={sections.hero.donate_label}
          />
          <Field
            label="Donate button (English)"
            name="donate_label_en"
            defaultValue={sections.hero.donate_label_en}
          />
          <Field
            label="Work button (Bangla)"
            name="work_label"
            defaultValue={sections.hero.work_label}
          />
          <Field
            label="Work button (English)"
            name="work_label_en"
            defaultValue={sections.hero.work_label_en}
          />
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
          <StatsEditor stats={sections.impact.stats} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="story">
        <SectionForm pageId={page.id} section="story">
          <Field label="Title (Bangla)" name="title" defaultValue={sections.story.title} />
          <Field label="Title (English)" name="title_en" defaultValue={sections.story.title_en} />
          <RichTextEditor name="body" label="Body (Bangla)" defaultValue={sections.story.body} />
          <RichTextEditor
            name="body_en"
            label="Body (English)"
            defaultValue={sections.story.body_en}
          />
          <ImageField name="image_url" label="Story image" defaultValue={sections.story.image_url} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="features">
        <SectionForm pageId={page.id} section="features">
          <Field
            label="Eyebrow (Bangla)"
            name="eyebrow"
            defaultValue={sections.features.eyebrow}
          />
          <Field
            label="Eyebrow (English)"
            name="eyebrow_en"
            defaultValue={sections.features.eyebrow_en}
          />
          <Field
            label="Heading (Bangla)"
            name="heading"
            defaultValue={sections.features.heading}
          />
          <Field
            label="Heading (English)"
            name="heading_en"
            defaultValue={sections.features.heading_en}
          />
          <FeaturesEditor items={sections.features.items} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="how">
        <SectionForm pageId={page.id} section="how">
          <Field label="Title (Bangla)" name="title" defaultValue={sections.how.title} />
          <Field label="Title (English)" name="title_en" defaultValue={sections.how.title_en} />
          <RichTextEditor name="body" label="Body (Bangla)" defaultValue={sections.how.body} />
          <RichTextEditor name="body_en" label="Body (English)" defaultValue={sections.how.body_en} />
        </SectionForm>
      </TabsContent>

      <TabsContent value="listings">
        <SectionForm pageId={page.id} section="listings">
          <Field
            label="Causes eyebrow (Bangla)"
            name="causes_eyebrow"
            defaultValue={sections.listings.causes_eyebrow}
          />
          <Field
            label="Causes eyebrow (English)"
            name="causes_eyebrow_en"
            defaultValue={sections.listings.causes_eyebrow_en}
          />
          <Field
            label="Causes heading (Bangla)"
            name="causes_heading"
            defaultValue={sections.listings.causes_heading}
          />
          <Field
            label="Causes heading (English)"
            name="causes_heading_en"
            defaultValue={sections.listings.causes_heading_en}
          />
          <Field
            label="Gallery heading (Bangla)"
            name="gallery_heading"
            defaultValue={sections.listings.gallery_heading}
          />
          <Field
            label="Gallery heading (English)"
            name="gallery_heading_en"
            defaultValue={sections.listings.gallery_heading_en}
          />
          <Field
            label="Transparency heading (Bangla)"
            name="transparency_heading"
            defaultValue={sections.listings.transparency_heading}
          />
          <Field
            label="Transparency heading (English)"
            name="transparency_heading_en"
            defaultValue={sections.listings.transparency_heading_en}
          />
        </SectionForm>
      </TabsContent>

      <TabsContent value="cta">
        <SectionForm pageId={page.id} section="cta">
          <Field label="Title (Bangla)" name="title" defaultValue={sections.cta.title} />
          <Field label="Title (English)" name="title_en" defaultValue={sections.cta.title_en} />
          <RichTextEditor name="body" label="Body (Bangla)" defaultValue={sections.cta.body} />
          <RichTextEditor name="body_en" label="Body (English)" defaultValue={sections.cta.body_en} />
          <Field
            label="Join button (Bangla)"
            name="join_label"
            defaultValue={sections.cta.join_label}
          />
          <Field
            label="Join button (English)"
            name="join_label_en"
            defaultValue={sections.cta.join_label_en}
          />
          <Field
            label="Donate button (Bangla)"
            name="donate_label"
            defaultValue={sections.cta.donate_label}
          />
          <Field
            label="Donate button (English)"
            name="donate_label_en"
            defaultValue={sections.cta.donate_label_en}
          />
        </SectionForm>
      </TabsContent>

      <TabsContent value="seo">
        <SeoForm page={page} />
      </TabsContent>
    </Tabs>
  );
}
