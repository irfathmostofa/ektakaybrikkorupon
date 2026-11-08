export type UserRole = "super_admin" | "admin" | "editor";
export type CauseStatus = "draft" | "active" | "completed" | "archived";
export type DonationStatus = "pending" | "success" | "failed" | "cancelled";
export type BlogStatus = "draft" | "published" | "archived";
export type AboutSectionType =
  | "story"
  | "mission"
  | "vision"
  | "values"
  | "timeline"
  | "custom";
export type FinanceKind = "collection" | "expense";
export type MembershipStatus = "pending" | "approved" | "rejected";
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "volunteer";
export type JobApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected";
export type ContentLocale = "bn" | "en";
export type CampaignStatus = "draft" | "sending" | "sent" | "partially_failed";
export type CampaignAudience = "subscribers" | "members" | "both";

export type SocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
};

export type SiteVisibility = {
  about: boolean;
  causes: boolean;
  gallery: boolean;
  achievements: boolean;
  transparency: boolean;
  membership: boolean;
  careers: boolean;
  blog: boolean;
  contact: boolean;
  magazines: boolean;
};

export type ThemeMode = "light" | "dark" | "system";

export type SiteTheme = {
  primary: string;
  secondary: string;
  heading_font: string;
  body_font: string;
  mode: ThemeMode;
};

export const DEFAULT_SITE_VISIBILITY: SiteVisibility = {
  about: true,
  causes: true,
  gallery: true,
  achievements: true,
  transparency: true,
  membership: true,
  careers: false,
  blog: true,
  contact: true,
  magazines: true,
};

export const DEFAULT_SITE_THEME: SiteTheme = {
  primary: "oklch(0.48 0.12 145)",
  secondary: "oklch(0.9 0.04 145)",
  heading_font: "Fraunces",
  body_font: "Source Sans 3",
  mode: "light",
};

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CauseProject = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  short_description: string | null;
  short_description_en: string | null;
  goal_amount: number;
  raised_amount: number;
  image_url: string | null;
  status: CauseStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type DonationPackage = {
  id: string;
  name: string;
  name_en: string | null;
  amount: number;
  description: string | null;
  description_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  donor_address: string | null;
  message: string | null;
  locale: ContentLocale | string | null;
  amount: number;
  transaction_id: string | null;
  cause_id: string | null;
  package_id: string | null;
  status: DonationStatus;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  cause?: Pick<CauseProject, "id" | "title" | "title_en"> | null;
  package?: Pick<DonationPackage, "id" | "name" | "name_en" | "amount"> | null;
};

export type SiteSettings = {
  id: number;
  logo_url: string | null;
  foundation_name: string;
  foundation_name_en: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  address_en: string | null;
  social_links: SocialLinks;
  default_locale: ContentLocale | string | null;
  sslcommerz_store_id: string | null;
  sslcommerz_store_password: string | null;
  sslcommerz_is_live: boolean;
  emailjs_service_id: string | null;
  emailjs_template_id: string | null;
  emailjs_public_key: string | null;
  emailjs_private_key: string | null;
  google_site_verification_code: string | null;
  meta_title: string | null;
  meta_title_en: string | null;
  meta_description: string | null;
  meta_description_en: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  visitor_count: number;
  visibility: SiteVisibility;
  theme: SiteTheme;
  role_menus: RoleMenus;
  updated_at: string;
};

export type RoleMenus = Partial<Record<UserRole, string[]>>;

export type PublicSiteSettings = Pick<
  SiteSettings,
  | "logo_url"
  | "foundation_name"
  | "foundation_name_en"
  | "contact_email"
  | "contact_phone"
  | "address"
  | "address_en"
  | "social_links"
  | "google_site_verification_code"
  | "meta_title"
  | "meta_title_en"
  | "meta_description"
  | "meta_description_en"
  | "favicon_url"
  | "og_image_url"
  | "visitor_count"
  | "visibility"
  | "theme"
>;

export type BlogCategory = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  created_at: string;
};

export type BlogTag = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string | null;
  content_en: string | null;
  cover_image_url: string | null;
  status: BlogStatus;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories?: BlogCategory[];
  tags?: BlogTag[];
};

export type PageContent = {
  id: string;
  page_key: string;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  body: string | null;
  body_en: string | null;
  hero_image_url: string | null;
  meta_title: string | null;
  meta_title_en: string | null;
  meta_description: string | null;
  meta_description_en: string | null;
  sections: Record<string, unknown> | null;
  updated_at: string;
};

export type AboutSection = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  section_type: AboutSectionType;
  body: string | null;
  body_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TeamMember = {
  id: string;
  full_name: string;
  full_name_en: string | null;
  role_title: string;
  role_title_en: string | null;
  bio: string | null;
  bio_en: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  sort_order: number;
  is_published: boolean;
  image_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type GalleryImage = {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  caption_en: string | null;
  alt_text: string | null;
  alt_text_en: string | null;
  sort_order: number;
  is_published: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  metric_value: number | null;
  metric_label: string | null;
  metric_label_en: string | null;
  achieved_on: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type FinanceCategory = {
  id: string;
  name: string;
  name_en: string | null;
  kind: FinanceKind;
  is_active: boolean;
};

export type FinanceEntry = {
  id: string;
  kind: FinanceKind;
  category_id: string | null;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  amount: number;
  entry_date: string;
  source_or_payee: string | null;
  receipt_url: string | null;
  is_published: boolean;
  transaction_id: string | null;
  category?: FinanceCategory | null;
};

export type MembershipPlan = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  fee_amount: number;
  duration_label: string | null;
  duration_label_en: string | null;
  benefits: string | null;
  benefits_en: string | null;
  is_active: boolean;
  sort_order: number;
};

export type MembershipApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  plan_id: string | null;
  motivation: string | null;
  status: MembershipStatus;
  admin_notes: string | null;
  locale: ContentLocale | string | null;
  created_at: string;
  plan?: Pick<MembershipPlan, "id" | "name" | "name_en" | "fee_amount" | "duration_label"> | null;
};

export type JobPosting = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  department: string | null;
  department_en: string | null;
  location: string | null;
  location_en: string | null;
  employment_type: EmploymentType;
  description: string | null;
  description_en: string | null;
  requirements: string | null;
  requirements_en: string | null;
  deadline: string | null;
  is_published: boolean;
};

export type JobApplication = {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  status: JobApplicationStatus;
  locale: ContentLocale | string | null;
  created_at: string;
};

export type EmailSubscriber = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
};

export type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  audience: CampaignAudience;
  status: CampaignStatus;
  sent_at: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
};

export type Magazine = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  pdf_url: string;
  issue_date: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

type Table<TRow, TInsert, TUpdate> = {
  Row: TRow;
  Insert: TInsert;
  Update: TUpdate;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<User, Partial<User> & Pick<User, "id" | "email">, Partial<User>>;
      causes_projects: Table<
        CauseProject,
        Partial<CauseProject> & Pick<CauseProject, "title" | "slug">,
        Partial<CauseProject>
      >;
      donations: Table<
        Donation,
        Partial<Donation> & Pick<Donation, "donor_name" | "donor_email" | "amount">,
        Partial<Donation>
      >;
      donation_packages: Table<
        DonationPackage,
        Partial<DonationPackage> & Pick<DonationPackage, "name" | "amount">,
        Partial<DonationPackage>
      >;
      site_settings: Table<SiteSettings, Partial<SiteSettings>, Partial<SiteSettings>>;
      blog_posts: Table<
        BlogPost,
        Partial<BlogPost> & Pick<BlogPost, "title" | "slug">,
        Partial<BlogPost>
      >;
      blog_categories: Table<
        BlogCategory,
        Partial<BlogCategory> & Pick<BlogCategory, "name" | "slug">,
        Partial<BlogCategory>
      >;
      blog_tags: Table<
        BlogTag,
        Partial<BlogTag> & Pick<BlogTag, "name" | "slug">,
        Partial<BlogTag>
      >;
      blog_post_categories: Table<
        { post_id: string; category_id: string },
        { post_id: string; category_id: string },
        Partial<{ post_id: string; category_id: string }>
      >;
      blog_post_tags: Table<
        { post_id: string; tag_id: string },
        { post_id: string; tag_id: string },
        Partial<{ post_id: string; tag_id: string }>
      >;
      page_content: Table<
        PageContent,
        Partial<PageContent> & Pick<PageContent, "page_key" | "title">,
        Partial<PageContent>
      >;
      about_sections: Table<
        AboutSection,
        Partial<AboutSection> & Pick<AboutSection, "title" | "slug" | "section_type">,
        Partial<AboutSection>
      >;
      team_members: Table<
        TeamMember,
        Partial<TeamMember> & Pick<TeamMember, "full_name" | "role_title">,
        Partial<TeamMember>
      >;
      gallery_albums: Table<
        GalleryAlbum,
        Partial<GalleryAlbum> & Pick<GalleryAlbum, "title" | "slug">,
        Partial<GalleryAlbum>
      >;
      gallery_images: Table<
        GalleryImage,
        Partial<GalleryImage> & Pick<GalleryImage, "album_id" | "image_url">,
        Partial<GalleryImage>
      >;
      achievements: Table<
        Achievement,
        Partial<Achievement> & Pick<Achievement, "title" | "slug">,
        Partial<Achievement>
      >;
      finance_categories: Table<
        FinanceCategory,
        Partial<FinanceCategory> & Pick<FinanceCategory, "name" | "kind">,
        Partial<FinanceCategory>
      >;
      finance_entries: Table<
        FinanceEntry,
        Partial<FinanceEntry> &
          Pick<FinanceEntry, "kind" | "title" | "amount" | "entry_date">,
        Partial<FinanceEntry>
      >;
      membership_plans: Table<
        MembershipPlan,
        Partial<MembershipPlan> & Pick<MembershipPlan, "name" | "slug">,
        Partial<MembershipPlan>
      >;
      membership_applications: Table<
        MembershipApplication,
        Partial<MembershipApplication> &
          Pick<MembershipApplication, "full_name" | "email">,
        Partial<Pick<MembershipApplication, "status" | "admin_notes">>
      >;
      job_postings: Table<
        JobPosting,
        Partial<JobPosting> & Pick<JobPosting, "title" | "slug">,
        Partial<JobPosting>
      >;
      job_applications: Table<
        JobApplication,
        Partial<JobApplication> &
          Pick<JobApplication, "job_id" | "full_name" | "email">,
        Partial<Pick<JobApplication, "status">>
      >;
      email_subscribers: Table<
        EmailSubscriber,
        Partial<EmailSubscriber> & Pick<EmailSubscriber, "email">,
        Partial<EmailSubscriber>
      >;
      email_campaigns: Table<
        EmailCampaign,
        Partial<EmailCampaign> & Pick<EmailCampaign, "name" | "subject">,
        Partial<EmailCampaign>
      >;
      magazines: Table<
        Magazine,
        Partial<Magazine> & Pick<Magazine, "title" | "slug" | "pdf_url">,
        Partial<Magazine>
      >;
    };
    Views: {
      site_settings_public: {
        Row: PublicSiteSettings;
        Relationships: [];
      };
    };
    Functions: {
      increment_blog_view: {
        Args: { post_slug: string };
        Returns: undefined;
      };
      increment_site_visitors: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      cause_status: CauseStatus;
      donation_status: DonationStatus;
      blog_status: BlogStatus;
      about_section_type: AboutSectionType;
      finance_kind: FinanceKind;
      membership_status: MembershipStatus;
      employment_type: EmploymentType;
      job_application_status: JobApplicationStatus;
      campaign_status: CampaignStatus;
      campaign_audience: CampaignAudience;
    };
    CompositeTypes: Record<string, never>;
  };
};
