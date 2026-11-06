"use client";

import { useActionState } from "react";
import { submitJobApplicationAction } from "@/actions/public";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/actions/settings";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

const initial: ActionState = {};

export function JobForm({
  jobId,
  locale,
  dict,
}: {
  jobId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const [state, action] = useActionState(submitJobApplicationAction, initial);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-accent/40 px-6 py-8">
        <p className="font-heading text-xl text-primary">{dict.careers.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-1.5">
        <Label htmlFor="full_name">{dict.forms.fullName}</Label>
        <Input id="full_name" name="full_name" required placeholder={dict.forms.placeholderName} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{dict.forms.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={dict.forms.placeholderEmail}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">{dict.forms.phone}</Label>
        <Input id="phone" name="phone" required placeholder={dict.forms.placeholderPhone} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cover_letter">{dict.forms.coverLetter}</Label>
        <Textarea
          id="cover_letter"
          name="cover_letter"
          required
          placeholder={dict.forms.placeholderCover}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="resume">{dict.forms.resume}</Label>
        <Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx,image/*" />
      </div>
      {state.error === "email" ? (
        <p className="text-sm text-destructive">{dict.forms.invalidEmail}</p>
      ) : null}
      {state.error === "required" ? (
        <p className="text-sm text-destructive">{dict.forms.required}</p>
      ) : null}
      <SubmitButton pendingLabel={dict.actions.sending}>{dict.actions.submit}</SubmitButton>
    </form>
  );
}
