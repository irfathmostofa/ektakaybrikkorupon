import { listPages } from "@/actions/pages";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { PageManager } from "@/components/admin/page-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminPages() {
  await requireMenu("pages");
  const pages = await listPages();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Pages"
        description="Edit public page copy section by section. Home and about page content is grouped by hero, story, and more."
      />
      <PageManager pages={pages} />
    </section>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminPage>
      <AdminPages />
    </AdminPage>
  );
}
