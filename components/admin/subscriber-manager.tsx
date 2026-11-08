"use client";

import { useState } from "react";
import {
  deleteSubscriberAction,
  importSubscribersAction,
  saveSubscriberAction,
} from "@/actions/campaigns";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { asFormAction } from "@/lib/admin/form-action";
import type { EmailSubscriber } from "@/lib/types/database";

function SubscriberForm({ item }: { item?: EmailSubscriber }) {
  return (
    <form action={asFormAction(saveSubscriberAction)} className="grid gap-3">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="full_name">Name</Label>
        <Input id="full_name" name="full_name" defaultValue={item?.full_name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" defaultValue={item?.email} required />
      </div>
      <SubmitButton>{item ? "Save" : "Add subscriber"}</SubmitButton>
    </form>
  );
}

export function SubscriberManager({ subscribers }: { subscribers: EmailSubscriber[] }) {
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  function exportCsv() {
    const rows = ["email,full_name", ...subscribers.map((item) => `${item.email},${item.full_name ?? ""}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
        <Button type="button" variant="outline" onClick={() => setImporting(true)}>
          Import CSV
        </Button>
        <Button type="button" onClick={() => setCreating(true)}>
          Add subscriber
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.full_name || "—"}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell className="text-right">
                <ConfirmDelete
                  onConfirm={async () => {
                    const formData = new FormData();
                    formData.set("id", item.id);
                    await deleteSubscriberAction(formData);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormDialog
        title="Add subscriber"
        open={creating}
        onOpenChange={setCreating}
      >
        <SubscriberForm />
      </FormDialog>
      <FormDialog
        title="Import subscribers"
        open={importing}
        onOpenChange={setImporting}
      >
        <form action={asFormAction(importSubscribersAction)} className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="csv" required>
              CSV (email,full_name)
            </Label>
            <Textarea id="csv" name="csv" rows={8} required />
          </div>
          <SubmitButton>Import</SubmitButton>
        </form>
      </FormDialog>
    </div>
  );
}
