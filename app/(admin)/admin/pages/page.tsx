import Link from "next/link";
import { listPages } from "@/actions/pages";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPagesPage() {
  const pages = await listPages();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit Home, About, and Contact content.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell>{page.page_key}</TableCell>
              <TableCell>
                <Link href={`/admin/pages/${page.id}`} className="hover:underline">
                  {page.title}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
