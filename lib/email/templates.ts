import { getDictionary } from "@/lib/i18n/dictionary";
import { formatCurrency } from "@/lib/i18n/format";
import { getLocale, type Locale } from "@/lib/i18n/config";

export type EmailPayload = {
  to_email: string;
  to_name: string;
  subject: string;
  title: string;
  message: string;
  message_html?: string;
  reply_to?: string;
  from_name?: string;
  unsubscribe_link?: string;
};

function localeOf(value: string | null | undefined): Locale {
  return getLocale(value);
}

export function donationReceiptEmail(input: {
  donorName: string;
  donorEmail: string;
  amount: number;
  transactionId: string | null;
  locale?: string | null;
  foundationName: string;
}): EmailPayload {
  const locale = localeOf(input.locale);
  const dict = getDictionary(locale);
  const amount = formatCurrency(locale, Number(input.amount) || 0);
  const transaction = input.transactionId
    ? `${dict.donate.transaction}: ${input.transactionId}`
    : "";

  return {
    to_email: input.donorEmail,
    to_name: input.donorName,
    subject: dict.email.donationReceiptSubject.replace("{name}", input.foundationName),
    title: dict.email.donationReceiptTitle,
    message: [
      dict.email.donationReceiptBody
        .replace("{name}", input.donorName)
        .replace("{amount}", amount)
        .replace("{foundation}", input.foundationName),
      transaction,
    ]
      .filter(Boolean)
      .join("\n\n"),
    reply_to: undefined,
  };
}

export function contactAutoReplyEmail(input: {
  fullName: string;
  email: string;
  message: string;
  locale?: string | null;
  foundationName: string;
}): EmailPayload {
  const locale = localeOf(input.locale);
  const dict = getDictionary(locale);
  return {
    to_email: input.email,
    to_name: input.fullName,
    subject: dict.email.contactReplySubject.replace("{name}", input.foundationName),
    title: dict.email.contactReplyTitle,
    message: dict.email.contactReplyBody.replace("{name}", input.fullName),
  };
}

export function contactAdminEmail(input: {
  fullName: string;
  email: string;
  message: string;
  adminEmail: string;
  foundationName: string;
}): EmailPayload {
  return {
    to_email: input.adminEmail,
    to_name: input.foundationName,
    subject: `New contact message from ${input.fullName}`,
    title: "New contact inquiry",
    message: [
      `${input.fullName} <${input.email}> sent a message:`,
      "",
      input.message,
    ].join("\n"),
    reply_to: input.email,
  };
}

export function membershipConfirmationEmail(input: {
  fullName: string;
  email: string;
  planName: string;
  locale?: string | null;
  foundationName: string;
}): EmailPayload {
  const locale = localeOf(input.locale);
  const dict = getDictionary(locale);
  return {
    to_email: input.email,
    to_name: input.fullName,
    subject: dict.email.membershipConfirmSubject.replace("{name}", input.foundationName),
    title: dict.email.membershipConfirmTitle,
    message: dict.email.membershipConfirmBody
      .replace("{name}", input.fullName)
      .replace("{plan}", input.planName),
  };
}

export function membershipAdminEmail(input: {
  fullName: string;
  email: string;
  phone: string;
  planName: string;
  motivation: string;
  adminEmail: string;
  foundationName: string;
}): EmailPayload {
  return {
    to_email: input.adminEmail,
    to_name: input.foundationName,
    subject: `New membership application: ${input.fullName}`,
    title: "New Become a Member request",
    message: [
      `Name: ${input.fullName}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Plan: ${input.planName}`,
      "",
      input.motivation,
    ].join("\n"),
    reply_to: input.email,
  };
}

export function membershipWelcomeEmail(input: {
  fullName: string;
  email: string;
  planName: string;
  locale?: string | null;
  foundationName: string;
}): EmailPayload {
  const locale = localeOf(input.locale);
  const dict = getDictionary(locale);
  return {
    to_email: input.email,
    to_name: input.fullName,
    subject: dict.email.membershipWelcomeSubject.replace("{name}", input.foundationName),
    title: dict.email.membershipWelcomeTitle,
    message: dict.email.membershipWelcomeBody
      .replace("{name}", input.fullName)
      .replace("{plan}", input.planName)
      .replace("{foundation}", input.foundationName),
  };
}

export function donationAdminEmail(input: {
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  amount: number;
  transactionId: string | null;
  adminEmail: string;
  foundationName: string;
}): EmailPayload {
  const amount = formatCurrency("en", Number(input.amount) || 0);
  return {
    to_email: input.adminEmail,
    to_name: input.foundationName,
    subject: `New donation received: ${amount}`,
    title: "New donation received",
    message: [
      `Donor: ${input.donorName}`,
      `Email: ${input.donorEmail}`,
      input.donorPhone ? `Phone: ${input.donorPhone}` : "",
      `Amount: ${amount}`,
      input.transactionId ? `Transaction: ${input.transactionId}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    reply_to: input.donorEmail,
  };
}

export function careerConfirmationEmail(input: {
  fullName: string;
  email: string;
  jobTitle: string;
  locale?: string | null;
  foundationName: string;
}): EmailPayload {
  const locale = localeOf(input.locale);
  const dict = getDictionary(locale);
  return {
    to_email: input.email,
    to_name: input.fullName,
    subject: dict.email.careerConfirmSubject.replace("{name}", input.foundationName),
    title: dict.email.careerConfirmTitle,
    message: dict.email.careerConfirmBody
      .replace("{name}", input.fullName)
      .replace("{role}", input.jobTitle),
  };
}

export function careerAdminEmail(input: {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  coverLetter: string;
  resumeUrl?: string | null;
  adminEmail: string;
  foundationName: string;
}): EmailPayload {
  return {
    to_email: input.adminEmail,
    to_name: input.foundationName,
    subject: `New job application: ${input.fullName} for ${input.jobTitle}`,
    title: "New career application",
    message: [
      `Name: ${input.fullName}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Role: ${input.jobTitle}`,
      input.resumeUrl ? `Resume: ${input.resumeUrl}` : "",
      "",
      input.coverLetter,
    ]
      .filter((line, index, rows) => line !== "" || rows[index - 1] !== "")
      .join("\n"),
    reply_to: input.email,
  };
}
