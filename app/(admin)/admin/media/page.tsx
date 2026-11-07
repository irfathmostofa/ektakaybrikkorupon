import { listMedia } from "@/actions/media";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireStaff } from "@/lib/auth";

async function AdminMedia() {
  await requireStaff();
  const items = await listMedia();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Media"
        description="Browse, upload, and delete images used across the site."
      />
      <MediaLibrary items={items} />
    </section>
  );
}

export default function AdminMediaPage() {
  return (
    <AdminPage>
      <AdminMedia />
    </AdminPage>
  );
}
