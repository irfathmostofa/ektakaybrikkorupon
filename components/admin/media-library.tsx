import Image from "next/image";
import { deleteMediaAction, getMediaPublicUrl } from "@/actions/media";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export async function MediaLibrary({
  items,
}: {
  items: { name: string }[];
}) {
  const files = await Promise.all(
    items.map(async (item) => ({
      name: item.name,
      url: await getMediaPublicUrl(item.name),
    })),
  );

  return (
    <div className="space-y-8">
      <MediaUploader />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <Card key={file.name}>
            <CardContent className="space-y-3">
              <div className="relative h-40 w-full overflow-hidden rounded-lg">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">{file.url}</p>
              <form action={deleteMediaAction}>
                <input type="hidden" name="path" value={file.name} />
                <Button type="submit" variant="destructive" size="sm">
                  Remove
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
