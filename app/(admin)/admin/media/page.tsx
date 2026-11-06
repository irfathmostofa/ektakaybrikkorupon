import { listMedia } from "@/actions/media";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireStaff } from "@/lib/auth";

export default async function AdminMediaPage() {
  await requireStaff();
  const items = await listMedia();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Images are compressed in the browser before upload.
        </p>
      </div>
      <MediaLibrary items={items} />
    </section>
  );
}
