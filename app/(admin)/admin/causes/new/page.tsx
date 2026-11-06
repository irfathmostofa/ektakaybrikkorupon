import { CauseForm } from "@/components/admin/cause-form";
import { requireStaff } from "@/lib/auth";

export default async function NewCausePage() {
  await requireStaff();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New cause</h1>
      <CauseForm />
    </section>
  );
}
