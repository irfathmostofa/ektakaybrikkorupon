import { notFound } from "next/navigation";
import { getCause } from "@/actions/causes";
import { AdminPage } from "@/components/admin/admin-page";
import { CauseForm } from "@/components/admin/cause-form";

async function EditCause({ params }: { params: Promise<{ id: string }> }) {
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

export default function EditCausePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AdminPage>
      <EditCause params={params} />
    </AdminPage>
  );
}
