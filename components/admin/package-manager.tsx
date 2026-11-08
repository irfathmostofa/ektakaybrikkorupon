"use client";

import { useState } from "react";
import {
  deleteDonationPackageAction,
  saveDonationPackageAction,
} from "@/actions/donations";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { asFormAction } from "@/lib/admin/form-action";
import { formatAdminNumber } from "@/lib/i18n/format";
import type { DonationPackage } from "@/lib/types/database";

function PackageForm({ item }: { item?: DonationPackage }) {
  return (
    <form action={asFormAction(saveDonationPackageAction)} className="grid gap-3">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Name (Bangla)
        </Label>
        <Input id="name" name="name" defaultValue={item?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" defaultValue={item?.name_en ?? ""} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount" required>
            Amount
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="0.01"
            defaultValue={item?.amount ?? 30}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={item?.sort_order ?? 0}
          />
        </div>
      </div>
      <RichTextEditor
        name="description"
        label="Description (Bangla)"
        defaultValue={item?.description}
        required
      />
      <RichTextEditor
        name="description_en"
        label="Description (English)"
        defaultValue={item?.description_en}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true} />
        Active
      </label>
      <SubmitButton>{item ? "Update package" : "Create package"}</SubmitButton>
    </form>
  );
}

export function PackageManager({ packages }: { packages: DonationPackage[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DonationPackage | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          Add package
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{formatAdminNumber(item.amount)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.is_active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(item)}>
                    Edit
                  </Button>
                  <ConfirmDelete
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("id", item.id);
                      await deleteDonationPackageAction(formData);
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormDialog
        title={editing ? "Edit package" : "Add package"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <PackageForm key={editing?.id ?? "new"} item={editing ?? undefined} />
      </FormDialog>
    </div>
  );
}
