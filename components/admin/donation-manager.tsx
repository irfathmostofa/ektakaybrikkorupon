"use client";

import { useMemo, useState } from "react";
import {
  deleteDonationAction,
  saveDonationAction,
} from "@/actions/donations";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
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
import { DONATION_STATUSES } from "@/lib/constants";
import type { CauseProject, Donation, DonationPackage } from "@/lib/types/database";

function DonationForm({
  donation,
  packages,
  causes,
}: {
  donation?: Donation;
  packages: DonationPackage[];
  causes: CauseProject[];
}) {
  return (
    <form action={asFormAction(saveDonationAction)} className="grid gap-3">
      {donation ? <input type="hidden" name="id" value={donation.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="donor_name" required>
            Donor
          </Label>
          <Input id="donor_name" name="donor_name" defaultValue={donation?.donor_name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="donor_email" required>
            Email
          </Label>
          <Input
            id="donor_email"
            name="donor_email"
            type="email"
            defaultValue={donation?.donor_email}
            required
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="donor_phone">Phone</Label>
          <Input id="donor_phone" name="donor_phone" defaultValue={donation?.donor_phone ?? ""} />
        </div>
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
            defaultValue={donation?.amount ?? 30}
            required
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="package_id">Package</Label>
          <select
            id="package_id"
            name="package_id"
            defaultValue={donation?.package_id ?? ""}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">None</option>
            {packages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.amount})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={donation?.status ?? "pending"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {DONATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cause_id">Cause</Label>
        <select
          id="cause_id"
          name="cause_id"
          defaultValue={donation?.cause_id ?? ""}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">General</option>
          {causes.map((cause) => (
            <option key={cause.id} value={cause.id}>
              {cause.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="transaction_id">Transaction ID</Label>
        <Input
          id="transaction_id"
          name="transaction_id"
          defaultValue={donation?.transaction_id ?? ""}
        />
      </div>
      <SubmitButton>{donation ? "Update donation" : "Add donation"}</SubmitButton>
    </form>
  );
}

export function DonationManager({
  donations,
  packages,
  causes,
}: {
  donations: Donation[];
  packages: DonationPackage[];
  causes: CauseProject[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Donation | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return donations.filter((item) => {
      if (status && item.status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return [
        item.donor_name,
        item.donor_email,
        item.transaction_id,
        item.package?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [donations, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>Search</Label>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Donor, email, package" />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">All</option>
            {DONATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto">
          <Button type="button" onClick={() => setCreating(true)}>
            Add donation
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((donation) => (
            <TableRow key={donation.id}>
              <TableCell>
                <div>{donation.donor_name}</div>
                <div className="text-xs text-muted-foreground">{donation.donor_email}</div>
              </TableCell>
              <TableCell>{Number(donation.amount).toLocaleString()}</TableCell>
              <TableCell>{donation.package?.name ?? "—"}</TableCell>
              <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="secondary">{donation.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(donation)}>
                    Edit
                  </Button>
                  <ConfirmDelete
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("id", donation.id);
                      await deleteDonationAction(formData);
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormDialog
        title={editing ? "Edit donation" : "Add donation"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DonationForm
          donation={editing ?? undefined}
          packages={packages}
          causes={causes}
        />
      </FormDialog>
    </div>
  );
}
