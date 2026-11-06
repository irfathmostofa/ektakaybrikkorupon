import { notFound } from "next/navigation";
import { getBlogPost } from "@/actions/blog";
import { BlogForm } from "@/components/admin/blog-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
