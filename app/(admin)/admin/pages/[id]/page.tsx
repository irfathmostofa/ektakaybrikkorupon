import { notFound } from "next/navigation";
import { getPage } from "@/actions/pages";
import { PageForm } from "@/components/admin/page-form";

export default async function EditPageContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPage(id);

  if (!page) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit page</h1>
      <PageForm page={page} />
    </section>
  );
}
