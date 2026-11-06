import { notFound } from "next/navigation";
import { getBlogPost } from "@/actions/blog";
import { AdminPage } from "@/components/admin/admin-page";
import { BlogForm } from "@/components/admin/blog-form";

async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <BlogForm post={post} />
    </section>
  );
}

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AdminPage>
      <EditBlogPost params={params} />
    </AdminPage>
  );
}
