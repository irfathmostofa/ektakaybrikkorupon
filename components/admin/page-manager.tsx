"use client";

import { useState } from "react";
import { AboutPageForm } from "@/components/admin/about-page-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { HomePageForm } from "@/components/admin/home-page-form";
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
        title={
          editing?.page_key === "home"
            ? "Edit home page"
            : editing?.page_key === "about"
              ? "Edit about page"
              : "Edit page"
        }
        description={
          editing?.page_key === "home"
            ? "Update each home section from its own tab."
            : editing?.page_key === "about"
              ? "Update each about section from its own tab."
              : undefined
        }
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        size="lg"
      >
        {editing ? (
          editing.page_key === "home" ? (
            <HomePageForm key={editing.id} page={editing} />
          ) : editing.page_key === "about" ? (
            <AboutPageForm key={editing.id} page={editing} />
          ) : (
            <PageForm key={editing.id} page={editing} />
          )
        ) : null}
      </FormDialog>
    </>
  );
}
