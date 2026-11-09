import Link from "next/link";
import { listBlogCategories, listBlogTags } from "@/actions/blog";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { BlogForm } from "@/components/admin/blog-form";
import { requireMenu } from "@/lib/admin/access";

async function NewBlogPost() {
  await requireMenu("blog");
  const [categories, tags] = await Promise.all([listBlogCategories(), listBlogTags()]);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Add new post"
        description="Write like WordPress: title, content, featured image, then publish."
        actions={
          <Link
            href="/admin/blog"
            className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
          >
            All posts
          </Link>
        }
      />
      <BlogForm categories={categories} tags={tags} />
    </section>
  );
}

export default function NewBlogPostPage() {
  return (
    <AdminPage>
      <NewBlogPost />
    </AdminPage>
  );
}
