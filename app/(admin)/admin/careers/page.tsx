
import { listJobApplications, listJobPostings } from "@/actions/careers";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { CareerManager } from "@/components/admin/career-manager";

async function AdminCareers() {
  const [jobs, applications] = await Promise.all([
    listJobPostings(),
    listJobApplications(),
  ]);
  return (
    <section className="space-y-6">
      <AdminHeader title="Careers" description="Job listings and applications." />
      <CareerManager jobs={jobs} applications={applications} />
    </section>
  );
}

export default function AdminCareersPage() {
  return (
    <AdminPage>
      <AdminCareers />
    </AdminPage>
  );
}
