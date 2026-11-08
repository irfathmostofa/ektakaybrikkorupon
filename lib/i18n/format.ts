import { type Locale } from "@/lib/i18n/config";

const DHAKA_TZ = "Asia/Dhaka";
const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
const MONTHS_EN_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dhakaParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DHAKA_TZ,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    day: read("day"),
    month: read("month"),
    year: read("year"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

export function localizeDigits(locale: Locale, value: string) {
  if (locale !== "bn") {
    return value;
  }
  return value.replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)] ?? digit);
}

export function formatDate(locale: Locale, value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) {
    return "";
  }
  const { day, month, year } = dhakaParts(date);
  if (locale === "bn") {
    return localizeDigits(
      locale,
      `${day} ${MONTHS_BN[month - 1]} ${year}`,
    );
  }
  return `${day} ${MONTHS_EN[month - 1]} ${year}`;
}

function groupInt(value: number) {
  const rounded = Math.round(Number(value) || 0);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function formatNumber(locale: Locale, value: number) {
  return localizeDigits(locale, groupInt(value));
}

export function formatCurrency(locale: Locale, value: number) {
  const amount = formatNumber(locale, value);
  return locale === "bn" ? `${amount} টাকা` : `BDT ${amount}`;
}

export function formatCompactNumber(locale: Locale, value: number) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs < 1000) {
    return localizeDigits(locale, `${sign}${Math.round(abs)}`);
  }
  if (abs < 1_000_000) {
    const scaled = Math.round(abs / 100) / 10;
    const text = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
    return localizeDigits(locale, `${sign}${text}K`);
  }
  const scaled = Math.round(abs / 100_000) / 10;
  const text = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
  return localizeDigits(locale, `${sign}${text}M`);
}

export function formatAdminNumber(value: number) {
  return groupInt(value);
}

export function formatAdminDate(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) {
    return "";
  }
  const { day, month, year } = dhakaParts(date);
  return `${String(day).padStart(2, "0")} ${MONTHS_EN_SHORT[month - 1]} ${year}`;
}

export function formatAdminDateTime(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) {
    return "";
  }
  const { day, month, year, hour, minute } = dhakaParts(date);
  return `${String(day).padStart(2, "0")} ${MONTHS_EN_SHORT[month - 1]} ${year}, ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function isPastDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }
  return value.slice(0, 10) < new Date().toISOString().slice(0, 10);
}
