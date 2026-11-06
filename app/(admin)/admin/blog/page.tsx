import Link from "next/link";
import { listBlogPosts } from "@/actions/blog";
import { AdminPage } from "@/components/admin/admin-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function AdminBlog() {
  const posts = await listBlogPosts();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft and publish foundation updates.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/blog/new" />}>
          New post
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link href={`/admin/blog/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{post.status}</Badge>
              </TableCell>
              <TableCell>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
