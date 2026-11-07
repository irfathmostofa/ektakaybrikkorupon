import {
  getBlogAnalytics,
  listBlogCategories,
  listBlogPosts,
  listBlogTags,
} from "@/actions/blog";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlogManager } from "@/components/admin/blog-manager";
import { StatCard } from "@/components/admin/stat-card";
import { requireMenu } from "@/lib/admin/access";

async function AdminBlog() {
  await requireMenu("blog");
  const [posts, categories, tags, analytics] = await Promise.all([
    listBlogPosts(),
    listBlogCategories(),
    listBlogTags(),
    getBlogAnalytics(),
  ]);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Blog"
        description="Manage posts, categories, tags, and read analytics."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Posts" value={posts.length} />
        <StatCard title="Total reads" value={analytics.totalReads} />
        <StatCard title="Total visitors" value={analytics.totalVisitors} />
      </div>
      <BlogManager posts={posts} categories={categories} tags={tags} />
    </section>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminPage>
      <AdminBlog />
    </AdminPage>
  );
}
