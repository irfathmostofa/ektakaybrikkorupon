# Master Prompt: Professional Foundation/NGO Website

Use this document as the source of truth for the full product scope. Build phase-by-phase. Do not proceed to the next phase until the current phase is confirmed working.

## Tech Stack

- Framework: Next.js (App Router, Server Components, Server Actions)
- UI/Styling: React, Tailwind CSS 4.3, shadcn/ui, Lucide Icons
- Animations: Framer Motion
- Backend & Auth: Supabase (Database, Auth, Row Level Security, Storage)
- Payment Gateway: SSL Commerz (for dynamic donations)
- Email Service: Email.js (for contact, receipts, membership, and career applications)
- SEO & Analytics: Google Search Console integration
- State & Optimization: Next.js native Cache, Cookies, dynamic imports
- Image Processing: Client/Server-side image compression (e.g. sharp or browser-image-compression) without quality loss before Supabase Storage upload
- Media Viewer: Accessible image lightbox (keyboard, swipe, captions, prev/next) for the public gallery
- Internationalization: Next.js locale routing. Default language is Bangla (`bn`). English (`en`) is fully available. Do not default the site to English.

## Core Requirement

Everything must be controllable from a secure Admin Panel. This includes page content, media, SSL Commerz credentials, Email.js keys, Google Search Console verification codes, gallery albums, achievements, dynamic About sections, collection and expense history, membership applications, and career listings.

Public visitors must be able to:

- Browse a photo gallery with lightbox viewing
- See achievements and impact milestones
- Read a fully dynamic About page (mission, vision, values, story, team, timeline)
- Inspect transparent collection (income) and expense history
- Apply to become a member
- Browse open roles and apply for careers
- Use the site in Bangla by default, and switch to English at any time

## Design Concept: Nature Conservation, Green & Alive

This foundation works for nature. The public site must feel like walking into a living landscape: calm, green, hopeful, and grounded. Not a generic charity template. Not a corporate SaaS dashboard. Not neon eco-tech. Think canopy light, moss, river stone, and handwritten field notes rendered with modern craft.

### Brand atmosphere

- Mission tone: protect, restore, and celebrate the natural world.
- Emotional register: serene confidence. Warm, not preachy. Alive, not sterile.
- Sensory references: morning forest, wet leaves, sunlight through canopy, river mist, soil after rain.
- Visual metaphor: growth, roots, water, habitat. Use these as texture and shape language, not clip-art icons dumped on every card.
- Avoid: pure grayscale shadcn defaults, harsh black CTAs, red emergency charity aesthetics, plastic stock-photo overlays, tropical neon greens, heavy drop shadows.

### Color system

Map these into CSS variables in `app/globals.css` (oklch) and shadcn tokens. Public pages use the nature palette. Admin may stay quieter but must still use the same primary green, not the default near-black primary.

| Token | Role | Direction |
| --- | --- | --- |
| `--background` | Page canvas | Warm off-white / parchment, like sun-bleached paper. Hint of green, never pure `#fff`. |
| `--foreground` | Body text | Deep forest / soil, not pure black. |
| `--primary` | Brand, CTAs, links | Rich leaf / canopy green. Saturated enough to feel alive. |
| `--primary-foreground` | Text on primary | Cream or pale mint, not stark white if it feels cheap. |
| `--secondary` | Soft fills | Sage / lichen. |
| `--accent` | Highlights, chips, hover | Fresh spring green or soft moss. |
| `--muted` | Section bands | Pale mist green or oat. |
| `--card` | Surfaces | Cream with a whisper of green. |
| `--border` | Dividers | Soft fern / stone. |
| `--ring` | Focus | Leaf green. |
| Earth | Supporting | Warm soil, clay, sand for secondary buttons and finance "expense" accents. |
| Water | Supporting | Quiet river blue-green for transparency/trust moments only. |
| Canopy dark | Footer, hero overlays | Deep pine / evergreen. |

Suggested public palette (implement as oklch equivalents, not as hardcoded one-off classes):

- Canopy: deep evergreen
- Leaf: mid green for primary buttons and nav active states
- Moss: muted sage for backgrounds and chips
- Mist: pale green-gray page sections
- Parchment: warm cream canvas
- Soil: brown-green for body text and footer
- Sunlit: soft gold only for achievement highlights and donation success, used sparingly

Charts (finance transparency): collections in leaf green, expenses in soil/clay. Never use default gray chart tokens on the public transparency page.

Dark mode is optional. If implemented, it must be a night-forest theme (deep pine background, pale mint text, bioluminescent-soft primary), not inverted gray.

### Typography

- Headings: a humanist serif or optical serif with natural contrast (e.g. Fraunces, Newsreader, or Source Serif 4). Slightly organic, editorial, not slab or theatrical script.
- Body: a clean humanist sans (e.g. Source Sans 3, Figtree, or Nunito Sans). High readability, rounded terminals welcome.
- Mono: only for transaction IDs and admin data, never for public headlines.
- Heading rhythm: generous tracking on small labels (`uppercase` + wide tracking for "Our habitat", "Impact"), large display headings on Home/About heroes.
- Do not keep Geist as the public brand face. Geist may remain on the admin panel if needed.

### Shape, texture, and layout

- Radius: slightly organic. Prefer `--radius` around `0.9rem` to `1.15rem`. Avoid sharp 2px enterprise cards and also avoid pill-everything.
- Cards: cream surfaces, thin moss borders, almost no shadow. Optional 1px inner highlight. Hover may lift 2–4px with a soft green-tinted shadow.
- Sections: alternate parchment and mist-green bands. Home should breathe with large vertical whitespace, like clearings between trees.
- Hero: full-width nature photography (forest, wetland, wildlife habitat) with a gentle dark-green gradient scrim and cream/mint type. Overlay must keep text WCAG AA.
- Organic motifs: very light leaf/vein SVG watermarks, curved section dividers, or a subtle grain/paper texture at 3–6% opacity. Never a repeating cartoon leaf background.
- Imagery: real conservation photography. Rounded-2xl photos, consistent 4:3 or 3:2 in grids. Gallery lightbox on a deep pine backdrop with cream captions.
- Icons: Lucide is fine. Stroke should feel light. Prefer nature-relevant metaphors (leaf, tree, droplets, sun, mountain, paw, sprout) where they help, not as decoration spam.

### Motion

- Framer Motion: slow, ease-out scroll reveals (fade + slight rise). Feels like wind, not bounce.
- Buttons: 150–200ms background/color transitions. Primary hover darkens toward canopy, not gray.
- Gallery lightbox: fade + scale 0.98 to 1. Keyboard and swipe remain required.
- Achievement counters: count-up when in view, once.
- No aggressive parallax, no looped decorative Lottie forests, no layout-shifting animations.

### Public UI patterns

- Header: translucent parchment/blur over the hero, forest-green wordmark, leaf-green active link, primary "Donate" and secondary "Become a member" in the nav. On scroll, solid cream bar with a thin moss border.
- Footer: deep pine background, cream text, pale mint links, social icons, small conservation tagline.
- Home: nature hero, impact counters (achievements), featured causes as habitat-style cards, recent gallery strip, transparency snapshot, membership CTA band in sage.
- About: editorial long-form. Mission/vision as two sage panels. Values as leaf-accent list. Team as portrait grid with moss nameplates. Timeline as a vertical branch/path, not a corporate stepper.
- Gallery: masonry or even album grid with cover photos. Lightbox is cinematic (dark forest, large image, caption).
- Achievements: oversized metric numerals in leaf green, short soil-colored labels, dated milestone path.
- Transparency: calm ledger. Green for collections, soil for expenses, clear balance. Must still feel inviting, not like a bank statement.
- Membership / Careers: forms on cream cards with moss focus rings. Success states use leaf + sprout language ("Application received. We will be in touch.").
- Donate CTA: the most saturated green on the site. Never bury it.

### Admin vs public

- Public: full nature brand (serif headings, green canvas, photography, organic motion).
- Admin: restrained moss/leaf primary on a clean cream/white app shell so staff can work fast. Do not force forest photography into data tables.
- Shared: same primary green, same radius, same buttons and inputs.

### Accessibility and quality bar

- Contrast: body text on parchment and cream-on-pine must meet WCAG AA.
- Focus rings: visible leaf-green rings on all interactive elements.
- Motion: respect `prefers-reduced-motion`.
- Do not convey meaning with green alone (finance tables need labels, not only color).

### Implementation notes

- Encode the palette in `app/globals.css` tokens and Tailwind theme. Do not scatter raw hex in components.
- Load brand fonts in `app/layout.tsx` and expose `--font-heading` / `--font-sans`. Heading and body fonts must include Bangla (Bengali script) glyphs. If the chosen serif/sans lack Bengali coverage, pair them with a Bangla face such as Noto Serif Bengali / Noto Sans Bengali and apply it whenever `lang` is `bn`.
- Root `html` must set `lang="bn"` by default and `lang="en"` on the English locale. Public UI copy, `dir`, dates, and numbers must follow the active locale.
- Phase 4 public pages must ship this nature design. Placeholder gray layouts are not acceptable for Home, About, Gallery, Achievements, Transparency, Membership, or Careers.
- Photography is first-class. Empty image slots should show a moss placeholder with a leaf icon, never a broken-image gray box.

## Phase 1: Project Setup & Architecture Initialization

- Initialize the Next.js project with Tailwind CSS 4.3 and configure shadcn/ui.
- Set up the folder structure for a clean separation of concerns (e.g. `app/(admin)`, `app/(public)`, `components`, `lib`, `actions`).
- Configure the Supabase client (Client and Server-side with Next.js Cookies for secure session management).
- Establish the foundational global layout and caching strategies.
- Configure i18n from day one: default locale `bn` (Bangla), second locale `en` (English). Unprefixed routes are Bangla. English lives under `/en`. Never treat English as the default.

## Phase 2: Database Schema & Supabase Configuration

Write the SQL schema, including Row Level Security (RLS) policies, for the following tables:

- `users`: Admin/Roles management.
- `causes_projects`: Title, slug, description, `goal_amount`, `raised_amount`, `image_url`, status.
- `donations`: Donor name, email, amount, `transaction_id`, `cause_id`, status, `created_at`.
- `site_settings`: CRUCIAL TABLE. Must store dynamic configurations securely:
  - General: `logo_url`, `foundation_name`, `foundation_name_en`, `contact_email`, `social_links`, `default_locale` (`bn`).
  - Payment: `sslcommerz_store_id`, `sslcommerz_store_password`.
  - Email: `emailjs_service_id`, `emailjs_template_id`, `emailjs_public_key`.
  - SEO: `google_site_verification_code`.
- `page_content`: CMS rows for public pages. Seed keys must include `home`, `about`, `contact`, `gallery`, `achievements`, `transparency`, `membership`, and `careers`. Each translatable field needs Bangla (canonical) and English columns, e.g. `title`, `title_en`, `subtitle`, `subtitle_en`, `body`, `body_en`, `meta_title`, `meta_title_en`, `meta_description`, `meta_description_en`. Seed Bangla copy first.
- `about_sections`: Dynamic About building blocks. Fields: `title`, `title_en`, `slug`, `section_type` (`story` | `mission` | `vision` | `values` | `timeline` | `custom`), `body`, `body_en`, `image_url`, `sort_order`, `is_published`.
- `team_members`: About/team roster. Fields: `full_name`, `full_name_en`, `role_title`, `role_title_en`, `bio`, `bio_en`, `photo_url`, `sort_order`, `is_published`.
- `gallery_albums`: Album title, slug, description, `cover_image_url`, `event_date`, `sort_order`, `is_published`. Translatable: `title`, `title_en`, `description`, `description_en`.
- `gallery_images`: `album_id`, `image_url`, `caption`, `caption_en`, `alt_text`, `alt_text_en`, `sort_order`, `is_published`. Public gallery must open these in a lightbox.
- `achievements`: Title, slug, description, `metric_value`, `metric_label`, `metric_label_en`, `achieved_on`, `image_url`, `sort_order`, `is_published`. Translatable: `title`, `title_en`, `description`, `description_en`. Used for impact counters, awards, and milestone cards.
- `finance_categories`: Name, `name_en`, `kind` (`collection` | `expense`), `is_active`.
- `finance_entries`: Transparent ledger. Fields: `kind` (`collection` | `expense`), `category_id`, `title`, `title_en`, `description`, `description_en`, `amount`, `entry_date`, `source_or_payee`, `receipt_url`, `is_published`. Collections are income (donations, grants, fundraising). Expenses are outgoing spend. Public history must show published entries only; never expose unpublished drafts.
- `membership_plans`: Plan name, slug, description, `fee_amount`, `duration_label`, `duration_label_en`, `benefits`, `benefits_en`, `is_active`, `sort_order`. Translatable: `name`, `name_en`, `description`, `description_en`.
- `membership_applications`: Become-a-member submissions. Fields: `full_name`, `email`, `phone`, `address`, `plan_id`, `motivation`, `status` (`pending` | `approved` | `rejected`), `admin_notes`, `locale`, `created_at`.
- `job_postings`: Career listings. Fields: `title`, `title_en`, `slug`, `department`, `department_en`, `location`, `location_en`, `employment_type` (`full_time` | `part_time` | `contract` | `volunteer`), `description`, `description_en`, `requirements`, `requirements_en`, `deadline`, `is_published`.
- `job_applications`: Career applications. Fields: `job_id`, `full_name`, `email`, `phone`, `cover_letter`, `resume_url`, `status` (`pending` | `reviewed` | `shortlisted` | `rejected`), `locale`, `created_at`.
- UI chrome (nav labels, buttons, form placeholders, validation, empty states, emails) lives in translation dictionaries (`bn` default, `en` fallback), not hardcoded English strings. CMS fields above are for editorial content only.

RLS rules:

- Public (`anon` / `authenticated`) may SELECT only published/active rows for about sections, team, gallery, achievements, finance entries, membership plans, and job postings.
- Public may INSERT membership applications and job applications with status `pending` only.
- Staff may full CRUD all CMS tables. Admins may update application statuses.
- Finance unpublished drafts and applicant PII must never leak through public SELECT policies.

## Phase 3: Secure Admin Panel & Global Settings

- Implement Supabase Auth (Email/Password) and middleware to protect `/admin` routes.
- Build the Admin Dashboard UI using shadcn/ui (Sidebar, Stat cards, Data tables). Dashboard stats must include published gallery items, achievements, pending membership applications, open jobs, and latest collection vs expense totals.
- Settings Module: Create a secure form to input and save all configuration variables (SSL Commerz, Email.js, Google Site Verification) into the `site_settings` table.
- Media Manager: Implement an image upload utility using a compression library. It must compress images without visible quality loss before uploading to Supabase Storage. Reuse this uploader for gallery images, about/team photos, achievement images, expense receipts, and resumes.
- Build CRUD interfaces for:
  - Causes, Blog Posts, and global site content (`page_content`)
  - Dynamic About sections and team members
  - Gallery albums and images (drag/sort order, captions, album cover)
  - Achievements / impact milestones
  - Finance categories and collection/expense entries (with publish toggle)
  - Membership plans and application review (approve/reject + notes)
  - Job postings and career application review (status workflow)
- Admin sidebar must expose: Dashboard, Causes, Blog, Pages, About, Gallery, Achievements, Finance, Membership, Careers, Media, Settings.
- Every editorial form that powers the public site must accept Bangla and English fields side by side (Bangla first, required; English optional but recommended). If English is empty, the public English locale falls back to Bangla rather than showing a blank page.
- Admin chrome may stay in English for staff efficiency, or offer a Bangla/English toggle. Public output is Bangla-first regardless.

## Phase 4: Public Frontend & Interactive UI

- Build the public-facing pages:
  - Home
  - About (fully dynamic)
  - Causes
  - Blog
  - Contact
  - Gallery
  - Achievements
  - Transparency (collection and expense history)
  - Become a Member
  - Careers
- Implement Framer Motion for scroll reveals, interactive buttons, and smooth page transitions.
- Ensure absolute responsiveness across all device sizes using Tailwind CSS 4.3.
- Implement Next.js image optimization (`next/image`) for blazing-fast load times.
- Fetch global settings (like the logo and social links) dynamically, utilizing Next.js caching to prevent unnecessary database reads.
- Public header/footer nav must include About, Causes, Gallery, Achievements, Transparency, Membership, Careers, Blog, and Contact.
- Default locale is Bangla. All public chrome, seeded CMS copy, buttons, forms, dates, and currency labels ship in Bangla first. English is a complete second locale, not a partial overlay.

### Language and locale

- Locales: `bn` (default), `en` (optional).
- Routing: Next.js App Router with `[locale]`. Bangla uses unprefixed paths (`/`, `/about`, `/gallery`). English uses `/en`, `/en/about`, `/en/gallery`.
- `html lang` is `bn` on default routes and `en` on `/en`. Document is `ltr` for both.
- Header includes a persistent language switcher: **বাংলা** | **English**. Switching keeps the visitor on the same page (About stays About, album slug stays the album).
- Persist the chosen locale in a cookie so return visits honor the last selection. First visit with no cookie is always Bangla, even if the browser is `en`.
- Static UI strings (Donate, Become a member, Read more, form labels, errors, empty states, footer) come from `messages/bn.json` and `messages/en.json` (or equivalent). Bangla files are the source of truth.
- Dates and numbers on the public site use `bn-BD` by default and `en-GB` (or `en`) on the English locale. Currency is BDT in both, with Bangla labels such as টাকা where appropriate.
- Do not mix languages on one view except inside the switcher itself.
- Admin-entered Bangla must render with a Bengali-capable font; never show tofu boxes.

### Gallery and Lightbox

- `/gallery` lists published albums with cover, date, and image count.
- `/gallery/[slug]` shows an album grid. Clicking any image opens a lightbox with:
  - Full-size image, caption, and alt text
  - Previous / next navigation
  - Keyboard support (Esc close, arrow keys)
  - Touch/swipe on mobile
  - Focus trap and accessible dialog semantics
- Home may feature a compact recent-album strip that also uses the same lightbox.

### Achievements

- `/achievements` shows published milestones as metric counters, award cards, and dated timeline items.
- Home and About must reuse featured achievements (e.g. lives reached, projects completed, funds deployed).

### Dynamic About

- `/about` is assembled only from CMS data: `page_content` (about), `about_sections` in `sort_order`, `team_members`, and featured achievements.
- Admins can add, reorder, hide, or rewrite About blocks without code changes.
- Render mission, vision, values, story, timeline, and team from `section_type`. Do not hardcode About copy.

### Collection and Expense History

- `/transparency` (label in nav: Transparency or Financials) shows:
  - Summary cards: total collected, total spent, remaining/balance for published entries
  - Filterable tables or year-grouped lists for collections and expenses
  - Category, date, amount, title, and optional receipt link
- Never show unpublished finance rows or internal admin notes on the public site.
- Home may show a short transparency snapshot linking to the full history.

### Become a Member

- `/membership` explains why to join, lists active `membership_plans`, and hosts a Become a Member form.
- Form fields: full name, email, phone, address, selected plan, motivation.
- Submit via Server Action into `membership_applications` with status `pending`.
- Show a success state; do not auto-approve.

### Careers

- `/careers` lists published `job_postings` (title, department, location, type, deadline).
- `/careers/[slug]` shows the full role and an application form (name, email, phone, cover letter, resume upload).
- Submit via Server Action into `job_applications` with status `pending`.
- Hide or mark expired roles after `deadline` unless the admin keeps them published.

## Phase 5: SSL Commerz Donation Gateway Integration

- Build a highly optimized, multi-step Donation Form UI using React Hook Form and shadcn/ui.
- Create a Next.js Server Action to initiate the SSL Commerz payment. Crucial: Dynamically fetch the `sslcommerz_store_id` and `sslcommerz_store_password` from the `site_settings` table securely.
- Set up the Next.js API routes for SSL Commerz webhooks (`/api/payment/success`, `/api/payment/fail`, `/api/payment/cancel`).
- Update the `donations` table and the respective cause's `raised_amount` securely upon a successful webhook response.
- Optionally record a published `finance_entries` collection row for each successful donation so Transparency stays in sync. If enabled, this must be idempotent on `transaction_id`.

## Phase 6: Email.js Integration & Notifications

- Create a utility to handle Email.js triggered via Next.js Server Actions.
- Fetch the Email.js API credentials dynamically from the `site_settings` table.
- Automated Trigger: Send a "Thank You & Receipt" email automatically when a donation is marked successful via the SSL Commerz webhook.
- Contact Form: Connect the public Contact Form to Email.js to send user inquiries directly to the foundation's admin email.
- Membership: Email the applicant a confirmation and notify the admin of a new Become a Member request.
- Careers: Email the applicant a confirmation and notify the admin of a new job application.
- Public-facing emails (donation receipt, membership confirmation, career confirmation, contact auto-reply) use the applicant's locale. Default to Bangla. Admin notification emails may stay in English.

## Phase 7: Professional SEO & Google Search Console

- Google Verification: Inject the `google_site_verification_code` (fetched from `site_settings`) into the root `layout.tsx` metadata (using Next.js `generateMetadata` verification object) so the site can be verified in Google Search Console.
- Dynamic Sitemap: Create `app/sitemap.ts` to dynamically generate a `sitemap.xml` that maps all static pages, active causes, blog posts, gallery albums, achievements, membership, and published job postings in both `bn` (default, unprefixed) and `en` (`/en/...`) with `xhtml:link` locale alternates.
- Robots.txt: Create `app/robots.ts` to generate a `robots.txt` that allows crawling of the public site but blocks the `/admin` routes.
- Metadata: Implement dynamic Open Graph tags and meta descriptions for Causes, Blog posts, Gallery albums, About, Achievements, Transparency, Membership, and Careers. Serve locale-specific titles/descriptions and `alternates.languages` for `bn` and `en`. Default Open Graph locale is `bn_BD`.
- Perform a final Lighthouse audit to ensure top scores in Performance, Accessibility, Best Practices, and SEO.

## Public Information Architecture

| Route (Bangla default) | English | Source | Notes |
| --- | --- | --- | --- |
| `/` | `/en` | `page_content.home` + featured causes, achievements, gallery, transparency snapshot | Default language Bangla |
| `/about` | `/en/about` | `page_content.about` + `about_sections` + `team_members` + achievements | Fully CMS-driven |
| `/gallery` | `/en/gallery` | `gallery_albums` | Album index |
| `/gallery/[slug]` | `/en/gallery/[slug]` | `gallery_images` | Grid + lightbox |
| `/achievements` | `/en/achievements` | `achievements` | Metrics, awards, timeline |
| `/transparency` | `/en/transparency` | `finance_entries` + `finance_categories` | Collection and expense history |
| `/membership` | `/en/membership` | `membership_plans` + application form | Become a member |
| `/careers` | `/en/careers` | `job_postings` | Open roles |
| `/careers/[slug]` | `/en/careers/[slug]` | `job_postings` + application form | Role detail |
| `/causes`, `/blog`, `/contact` | `/en/causes`, `/en/blog`, `/en/contact` | Existing modules | Unchanged purpose |

## Build Rules

- Acknowledge these comprehensive instructions.
- Start only by providing the terminal setup commands and the initial code/SQL schema for Phase 1 and Phase 2.
- Wait for approval before moving to Phase 3.
- New public pages and admin modules listed above are in scope; do not ship hardcoded About, gallery, achievement, finance, membership, or career copy.
- Do not ship an English-only UI. Bangla is the default language of the product. English is the second locale and must be complete.
