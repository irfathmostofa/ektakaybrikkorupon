"use client";

import { useState } from "react";
import { deleteCauseAction } from "@/actions/causes";
import { CauseForm } from "@/components/admin/cause-form";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
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
import type { CauseProject } from "@/lib/types/database";

export function CauseManager({ causes }: { causes: CauseProject[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CauseProject | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          Add new
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Goal</TableHead>
            <TableHead>Raised</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {causes.map((cause) => (
            <TableRow key={cause.id}>
              <TableCell>{cause.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{cause.status}</Badge>
              </TableCell>
              <TableCell>{cause.goal_amount}</TableCell>
              <TableCell>{cause.raised_amount}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(cause)}
                  >
                    Edit
                  </Button>
                  <ConfirmDelete
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("id", cause.id);
                      await deleteCauseAction(formData);
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormDialog
        title={editing ? "Edit cause" : "Add cause"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <CauseForm
          cause={editing ?? undefined}
          onSuccess={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </FormDialog>
    </div>
  );
}
