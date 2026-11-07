import { listGalleryAlbums, listGalleryImages } from "@/actions/gallery";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminGallery() {
  await requireMenu("gallery");
  const albums = await listGalleryAlbums();
  const imagesByAlbum: Record<string, Awaited<ReturnType<typeof listGalleryImages>>> = {};
  await Promise.all(
    albums.map(async (album) => {
      imagesByAlbum[album.id] = await listGalleryImages(album.id);
    }),
  );

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Gallery"
        description="Category-wise albums that mirror the public gallery."
      />
      <GalleryManager albums={albums} imagesByAlbum={imagesByAlbum} />
    </section>
  );
}

export default function AdminGalleryPage() {
  return (
    <AdminPage>
      <AdminGallery />
    </AdminPage>
  );
}
