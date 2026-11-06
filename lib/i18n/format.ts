import { dateLocales, type Locale } from "@/lib/i18n/config";

export function formatDate(locale: Locale, value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(dateLocales[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(dateLocales[locale]).format(value);
}

export function formatCurrency(locale: Locale, value: number) {
  const amount = new Intl.NumberFormat(dateLocales[locale], {
    maximumFractionDigits: 0,
  }).format(value);
  return locale === "bn" ? `${amount} টাকা` : `BDT ${amount}`;
}

export function formatCompactNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(dateLocales[locale], {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function isPastDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }
  return value.slice(0, 10) < new Date().toISOString().slice(0, 10);
}
