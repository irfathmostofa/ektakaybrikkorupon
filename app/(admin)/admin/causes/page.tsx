import Link from "next/link";
import { listCauses } from "@/actions/causes";
import { AdminPage } from "@/components/admin/admin-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function AdminCauses() {
  const causes = await listCauses();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Causes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage fundraising projects.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/causes/new" />}>
          New cause
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Goal</TableHead>
            <TableHead>Raised</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {causes.map((cause) => (
            <TableRow key={cause.id}>
              <TableCell>
                <Link href={`/admin/causes/${cause.id}`} className="hover:underline">
                  {cause.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{cause.status}</Badge>
              </TableCell>
              <TableCell>{cause.goal_amount}</TableCell>
              <TableCell>{cause.raised_amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

export default function AdminCausesPage() {
  return (
    <AdminPage>
      <AdminCauses />
    </AdminPage>
  );
}
