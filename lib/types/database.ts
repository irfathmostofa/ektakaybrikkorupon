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

export type SocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
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
  title_en?: string | null;
  slug: string;
  description: string | null;
  description_en?: string | null;
  short_description: string | null;
  short_description_en?: string | null;
  goal_amount: number;
  raised_amount: number;
  image_url: string | null;
  status: CauseStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string | null;
  donor_address?: string | null;
  message?: string | null;
  locale?: string | null;
  amount: number;
  transaction_id: string | null;
  cause_id: string | null;
  status: DonationStatus;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  logo_url: string | null;
  foundation_name: string;
  foundation_name_en?: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  address_en?: string | null;
  social_links: SocialLinks;
  default_locale?: string | null;
  sslcommerz_store_id: string | null;
  sslcommerz_store_password: string | null;
  sslcommerz_is_live: boolean;
  emailjs_service_id: string | null;
  emailjs_template_id: string | null;
  emailjs_public_key: string | null;
  emailjs_private_key: string | null;
  google_site_verification_code: string | null;
  meta_title: string | null;
  meta_title_en?: string | null;
  meta_description: string | null;
  meta_description_en?: string | null;
  updated_at: string;
};

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
>;

export type BlogPost = {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en?: string | null;
  content: string | null;
  content_en?: string | null;
  cover_image_url: string | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PageContent = {
  id: string;
  page_key: string;
  title: string;
  title_en?: string | null;
  subtitle: string | null;
  subtitle_en?: string | null;
  body: string | null;
  body_en?: string | null;
  hero_image_url: string | null;
  meta_title: string | null;
  meta_title_en?: string | null;
  meta_description: string | null;
  meta_description_en?: string | null;
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
  transaction_id?: string | null;
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
      site_settings: Table<SiteSettings, Partial<SiteSettings>, Partial<SiteSettings>>;
      blog_posts: Table<
        BlogPost,
        Partial<BlogPost> & Pick<BlogPost, "title" | "slug">,
        Partial<BlogPost>
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
        {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          plan_id: string | null;
          motivation: string | null;
          status: MembershipStatus;
          admin_notes: string | null;
          locale: string | null;
          created_at: string;
        },
        {
          full_name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          plan_id?: string | null;
          motivation?: string | null;
          status?: MembershipStatus;
          locale?: string | null;
        },
        Partial<{
          status: MembershipStatus;
          admin_notes: string | null;
        }>
      >;
      job_postings: Table<
        JobPosting,
        Partial<JobPosting> & Pick<JobPosting, "title" | "slug">,
        Partial<JobPosting>
      >;
      job_applications: Table<
        {
          id: string;
          job_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          cover_letter: string | null;
          resume_url: string | null;
          status: JobApplicationStatus;
          locale: string | null;
          created_at: string;
        },
        {
          job_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          cover_letter?: string | null;
          resume_url?: string | null;
          status?: JobApplicationStatus;
          locale?: string | null;
        },
        Partial<{
          status: JobApplicationStatus;
        }>
      >;
    };
    Views: {
      site_settings_public: {
        Row: PublicSiteSettings;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
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
    };
    CompositeTypes: Record<string, never>;
  };
};
