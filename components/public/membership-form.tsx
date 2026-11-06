"use client";

import { useActionState } from "react";
import { submitMembershipAction } from "@/actions/public";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/actions/settings";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { pickLocalized } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { MembershipPlan } from "@/lib/types/database";

const initial: ActionState = {};

export function MembershipForm({
  plans,
  locale,
  dict,
}: {
  plans: MembershipPlan[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [state, action] = useActionState(submitMembershipAction, initial);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-accent/40 px-6 py-8">
        <p className="font-heading text-xl text-primary">{dict.membership.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <input type="hidden" name="locale" value={locale} />
      <Field label={dict.forms.fullName} htmlFor="full_name">
        <Input
          id="full_name"
          name="full_name"
          required
          placeholder={dict.forms.placeholderName}
        />
      </Field>
      <Field label={dict.forms.email} htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={dict.forms.placeholderEmail}
        />
      </Field>
      <Field label={dict.forms.phone} htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          required
          placeholder={dict.forms.placeholderPhone}
        />
      </Field>
      <Field label={dict.forms.address} htmlFor="address">
        <Input
          id="address"
          name="address"
          required
          placeholder={dict.forms.placeholderAddress}
        />
      </Field>
      <Field label={dict.forms.plan} htmlFor="plan_id">
        <select
          id="plan_id"
          name="plan_id"
          required
          defaultValue=""
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="" disabled>
            {dict.forms.selectPlan}
          </option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {pickLocalized(locale, plan.name, plan.name_en)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={dict.forms.motivation} htmlFor="motivation">
        <Textarea
          id="motivation"
          name="motivation"
          required
          placeholder={dict.forms.placeholderMotivation}
        />
      </Field>
      {state.error === "email" ? (
        <p className="text-sm text-destructive">{dict.forms.invalidEmail}</p>
      ) : null}
      {state.error === "required" ? (
        <p className="text-sm text-destructive">{dict.forms.required}</p>
      ) : null}
      <SubmitButton pendingLabel={dict.actions.sending}>
        {dict.actions.submit}
      </SubmitButton>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
