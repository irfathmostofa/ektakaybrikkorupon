"use client";

import { useState } from "react";
import { FormDialog } from "@/components/admin/form-dialog";
import { PageForm } from "@/components/admin/page-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PageContent } from "@/lib/types/database";

export function PageManager({ pages }: { pages: PageContent[] }) {
  const [editing, setEditing] = useState<PageContent | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Title</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell>{page.page_key}</TableCell>
              <TableCell>{page.title}</TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(page)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormDialog
        title="Edit page"
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        size="lg"
      >
        {editing ? <PageForm page={editing} /> : null}
      </FormDialog>
    </>
  );
}
