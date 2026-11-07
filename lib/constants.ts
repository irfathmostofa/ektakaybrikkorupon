export const CACHE_TAGS = {
  siteSettings: "site-settings",
  causes: "causes",
  blog: "blog",
  pages: "pages",
  about: "about",
  gallery: "gallery",
  achievements: "achievements",
  finance: "finance",
  membership: "membership",
  careers: "careers",
  donations: "donations",
  packages: "packages",
  campaigns: "campaigns",
  subscribers: "subscribers",
} as const;

export const REVALIDATE_SECONDS = {
  siteSettings: 3600,
  causes: 300,
  blog: 300,
  pages: 3600,
} as const;

export const USER_ROLES = ["super_admin", "admin", "editor"] as const;

export const CAUSE_STATUSES = [
  "draft",
  "active",
  "completed",
  "archived",
] as const;

export const DONATION_STATUSES = [
  "pending",
  "success",
  "failed",
  "cancelled",
] as const;

export const BLOG_STATUSES = ["draft", "published", "archived"] as const;

export const PAGE_KEYS = [
  "home",
  "about",
  "contact",
  "gallery",
  "achievements",
  "transparency",
  "membership",
  "careers",
] as const;

export const ABOUT_SECTION_TYPES = [
  "story",
  "mission",
  "vision",
  "values",
  "timeline",
  "custom",
] as const;

export const FINANCE_KINDS = ["collection", "expense"] as const;

export const MEMBERSHIP_STATUSES = ["pending", "approved", "rejected"] as const;

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "volunteer",
] as const;

export const JOB_APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
] as const;

export const CAMPAIGN_STATUSES = [
  "draft",
  "sending",
  "sent",
  "partially_failed",
] as const;

export const CAMPAIGN_AUDIENCES = ["subscribers", "members", "both"] as const;

export const MEDIA_BUCKET = "media";

export const VISIBILITY_KEYS = [
  "about",
  "causes",
  "gallery",
  "achievements",
  "transparency",
  "membership",
  "careers",
  "blog",
  "contact",
] as const;

export const PUBLIC_NAV = [
  { href: "/about", key: "about" },
  { href: "/causes", key: "causes" },
  { href: "/gallery", key: "gallery" },
  { href: "/achievements", key: "achievements" },
  { href: "/transparency", key: "transparency" },
  { href: "/membership", key: "membership" },
  // { href: "/careers", key: "careers" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

export const THEME_FONTS = [
  "Fraunces",
  "Source Serif 4",
  "Newsreader",
  "Source Sans 3",
  "Figtree",
  "Nunito Sans",
] as const;
