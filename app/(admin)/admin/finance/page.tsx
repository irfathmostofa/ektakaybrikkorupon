import { listFinanceCategories, listFinanceEntries } from "@/actions/finance";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { FinanceManager } from "@/components/admin/finance-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminFinance() {
  await requireMenu("finance");
  const [entries, categories] = await Promise.all([
    listFinanceEntries(),
    listFinanceCategories(),
  ]);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Finance"
        description="Collections, expenses, totals, and published ledger entries."
      />
      <FinanceManager entries={entries} categories={categories} />
    </section>
  );
}

export default function AdminFinancePage() {
  return (
    <AdminPage>
      <AdminFinance />
    </AdminPage>
  );
}
