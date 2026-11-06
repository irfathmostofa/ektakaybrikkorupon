"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Lock, Sprout } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { initiateDonationAction } from "@/actions/donate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { pickLocalized, type Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { donationInputSchema, type DonationInput } from "@/lib/payments/schema";
import type { CauseProject } from "@/lib/types/database";

const PRESETS = [30, 90, 180, 360, 1000];

type Step = 0 | 1 | 2;

export function DonationForm({
  causes,
  locale,
  dict,
  initialCauseId,
}: {
  causes: CauseProject[];
  locale: Locale;
  dict: Dictionary;
  initialCauseId?: string | null;
}) {
  const [step, setStep] = useState<Step>(0);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<DonationInput>({
    resolver: zodResolver(donationInputSchema),
    defaultValues: {
      amount: 30,
      cause_id: initialCauseId || "",
      donor_name: "",
      donor_email: "",
      donor_phone: "",
      donor_address: "",
      message: "",
      locale,
    },
    mode: "onTouched",
  });

  const amount = useWatch({ control: form.control, name: "amount" });
  const causeId = useWatch({ control: form.control, name: "cause_id" });
  const selectedCause = useMemo(
    () => causes.find((item) => item.id === causeId) ?? null,
    [causes, causeId],
  );

  const steps = [
    dict.donate.stepAmount,
    dict.donate.stepDetails,
    dict.donate.stepReview,
  ];

  function fieldError(name: keyof DonationInput) {
    const err = form.formState.errors[name];
    if (!err) {
      return null;
    }
    if (name === "donor_email") {
      return dict.forms.invalidEmail;
    }
    if (name === "amount") {
      return dict.donate.minAmount;
    }
    return dict.forms.required;
  }

  async function goNext() {
    const fields: (keyof DonationInput)[] =
      step === 0
        ? ["amount", "cause_id"]
        : ["donor_name", "donor_email", "donor_phone", "donor_address", "message"];
    const valid = await form.trigger(fields);
    if (valid) {
      setErrorKey(null);
      setStep((value) => (value === 2 ? 2 : ((value + 1) as Step)));
    }
  }

  function onSubmit(values: DonationInput) {
    setErrorKey(null);
    startTransition(async () => {
      const result = await initiateDonationAction({
        ...values,
        cause_id: values.cause_id || undefined,
        locale,
      });
      if (result.gatewayUrl) {
        window.location.assign(result.gatewayUrl);
        return;
      }
      setErrorKey(result.error ?? "gateway");
    });
  }

  const submitError =
    errorKey === "cause"
      ? dict.donate.causeError
      : errorKey === "save"
        ? dict.donate.saveError
        : errorKey === "invalid"
          ? dict.forms.required
          : errorKey
            ? dict.donate.gatewayError
            : null;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <ol className="grid grid-cols-3 gap-2 text-xs tracking-wide uppercase">
        {steps.map((label, index) => (
          <li
            key={label}
            className={`rounded-full px-2 py-2 text-center ${
              index === step
                ? "bg-primary text-primary-foreground"
                : index < step
                  ? "bg-accent text-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>{dict.donate.amount}</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESETS.map((value) => {
                const active = Number(amount) === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => form.setValue("amount", value, { shouldValidate: true })}
                    className={`rounded-xl border px-3 py-3 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {formatCurrency(locale, value)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">{dict.donate.customAmount}</Label>
            <Input
              id="amount"
              type="number"
              min={10}
              step={1}
              {...form.register("amount", { valueAsNumber: true })}
            />
            {fieldError("amount") ? (
              <p className="text-sm text-destructive">{fieldError("amount")}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cause_id">{dict.donate.cause}</Label>
            <select
              id="cause_id"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              {...form.register("cause_id")}
            >
              <option value="">{dict.donate.generalFund}</option>
              {causes.map((cause) => (
                <option key={cause.id} value={cause.id}>
                  {pickLocalized(locale, cause.title, cause.title_en)}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" size="lg" className="w-full" onClick={goNext}>
            {dict.donate.next}
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Field label={dict.forms.fullName} htmlFor="donor_name" error={fieldError("donor_name")}>
            <Input
              id="donor_name"
              autoComplete="name"
              placeholder={dict.forms.placeholderName}
              {...form.register("donor_name")}
            />
          </Field>
          <Field label={dict.forms.email} htmlFor="donor_email" error={fieldError("donor_email")}>
            <Input
              id="donor_email"
              type="email"
              autoComplete="email"
              placeholder={dict.forms.placeholderEmail}
              {...form.register("donor_email")}
            />
          </Field>
          <Field label={dict.forms.phone} htmlFor="donor_phone" error={fieldError("donor_phone")}>
            <Input
              id="donor_phone"
              autoComplete="tel"
              placeholder={dict.forms.placeholderPhone}
              {...form.register("donor_phone")}
            />
          </Field>
          <Field label={dict.forms.address} htmlFor="donor_address">
            <Input
              id="donor_address"
              autoComplete="street-address"
              placeholder={dict.forms.placeholderAddress}
              {...form.register("donor_address")}
            />
          </Field>
          <Field label={dict.donate.message} htmlFor="message">
            <Textarea
              id="message"
              placeholder={dict.donate.placeholderMessage}
              {...form.register("message")}
            />
          </Field>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
              {dict.donate.back}
            </Button>
            <Button type="button" className="flex-1" onClick={goNext}>
              {dict.donate.next}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-accent/30 p-5">
            <p className="flex items-center gap-2 text-xs tracking-[0.18em] text-primary uppercase">
              <Sprout className="size-3.5" />
              {dict.donate.reviewTitle}
            </p>
            <p className="mt-3 font-heading text-4xl text-primary">
              {formatCurrency(locale, Number(amount) || 0)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {selectedCause
                ? pickLocalized(locale, selectedCause.title, selectedCause.title_en)
                : dict.donate.generalFund}
            </p>
            <dl className="mt-5 space-y-2 text-sm">
              <Row label={dict.forms.fullName} value={form.getValues("donor_name")} />
              <Row label={dict.forms.email} value={form.getValues("donor_email")} />
              <Row label={dict.forms.phone} value={form.getValues("donor_phone")} />
            </dl>
          </div>
          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            {dict.donate.secureNote}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
              {dict.donate.back}
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={pending}>
              {pending ? dict.donate.processing : dict.donate.pay}
            </Button>
          </div>
        </div>
      ) : null}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Leaf className="size-3.5 text-primary" />
        {locale === "bn"
          ? `${formatNumber(locale, Number(amount) || 0)} ${dict.donate.currency}`
          : `${dict.donate.currency} ${formatNumber(locale, Number(amount) || 0)}`}
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
