import { notFound } from "next/navigation";
import { getCause } from "@/actions/causes";
import { CauseForm } from "@/components/admin/cause-form";

export default async function EditCausePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cause = await getCause(id);

  if (!cause) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit cause</h1>
      <CauseForm cause={cause} />
    </section>
  );
}
