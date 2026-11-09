import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, listBlogCategories, listBlogTags } from "@/actions/blog";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { BlogForm } from "@/components/admin/blog-form";
import { requireMenu } from "@/lib/admin/access";

async function EditBlogPost({ id }: { id: string }) {
  await requireMenu("blog");
  const [post, categories, tags] = await Promise.all([
    getBlogPost(id),
    listBlogCategories(),
    listBlogTags(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Edit post"
        description="Update content, featured image, categories, and publish status."
        actions={
          <Link
            href="/admin/blog"
            className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
          >
            All posts
          </Link>
        }
      />
      <BlogForm post={post} categories={categories} tags={tags} />
    </section>
  );
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminPage>
      <EditBlogPost id={id} />
    </AdminPage>
  );
}
