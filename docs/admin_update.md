# Admin Panel Upgrade

Build/upgrade the admin panel (React + Vite, Supabase, Tailwind) with the following requirements.

## 1. General UX
- Page navigation must be fast: use client-side routing, lazy-load pages, and cache fetched data so switching pages doesn't refetch every time.
- Sidebar navigation drives the data: each menu item opens its own page with its own list/table.
- Every "Add new" action opens a modal form (no separate page).
- Every section needs full CRUD (Create, Read, Update, Delete), with a delete confirmation dialog.
- Add a "View Website" button in the admin header that opens the public site in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
- Wherever a page has multiple segments (especially Settings), use a tab control.

## 2. Content Editing & Media
- Use a rich text editor for all content/description fields.
- Create a reusable Image Uploader component with:
  - Upload from device (with preview)
  - "Choose from Media Library" option to pick previously uploaded images
- Use this component everywhere an image is needed.
- Add a Media Library page to browse, upload, and delete images.

## 3. Blog Management
- Full CRUD for posts (title, slug, content, featured image, status: draft/published).
- Categories: CRUD, assign one or more to a post.
- Tags: CRUD, assign multiple to a post.
- Analytics: track and display total reads per post and total visitors (show on the blog list and a dashboard widget).

## 4. Collection & Expense Records
- Dynamic Collection records: add/edit/delete entries (date, title/source, amount, note).
- Dynamic Expense records: add/edit/delete entries (date, category, amount, note).
- Show totals and balance (collection minus expense) with a date/category filter.

## 5. Gallery
- Gallery must mirror the public Gallery page: category-wise.
- Admin can create/edit/delete gallery categories.
- Upload images into a selected category (multiple upload supported), and reorder/delete images.

## 6. Settings (use tabs)
- General: site name, logo, favicon, contact info, social links.
- Visibility: toggle show/hide for each website section or page.
- Theme: dynamic theme management (primary/secondary colors, fonts, light/dark mode), saved to the database and applied on the public site.