import { BlogForm } from "@/components/admin/blog-form";
import { requireStaff } from "@/lib/auth";

export default async function NewBlogPostPage() {
  await requireStaff();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <BlogForm />
    </section>
  );
}
