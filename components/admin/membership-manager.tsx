"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import {
  deleteMembershipPlanAction,
  saveMembershipPlanAction,
  updateMembershipApplicationAction,
} from "@/actions/membership";
import type { ActionState } from "@/actions/settings";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { FormMessage } from "@/components/admin/form-message";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEMBERSHIP_STATUSES } from "@/lib/constants";
import type { Donation, MembershipApplication, MembershipPlan } from "@/lib/types/database";

const initialState: ActionState = {};

function PlanForm({ plan }: { plan?: MembershipPlan }) {
  const [state, formAction] = useActionState(saveMembershipPlanAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      {plan ? <input type="hidden" name="id" value={plan.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Name (Bangla)
        </Label>
        <Input id="name" name="name" defaultValue={plan?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" defaultValue={plan?.name_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={plan?.slug ?? ""} />
      </div>
      <RichTextEditor
        name="description"
        label="Description (Bangla)"
        defaultValue={plan?.description}
        required
      />
      <RichTextEditor
        name="description_en"
        label="Description (English)"
        defaultValue={plan?.description_en}
      />
      <RichTextEditor name="benefits" label="Benefits (Bangla)" defaultValue={plan?.benefits} />
      <RichTextEditor
        name="benefits_en"
        label="Benefits (English)"
        defaultValue={plan?.benefits_en}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fee_amount">Fee</Label>
          <Input
            id="fee_amount"
            name="fee_amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={plan?.fee_amount ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_label">Duration</Label>
          <Input
            id="duration_label"
            name="duration_label"
            defaultValue={plan?.duration_label ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration_label_en">Duration (English)</Label>
          <Input
            id="duration_label_en"
            name="duration_label_en"
            defaultValue={plan?.duration_label_en ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={plan?.sort_order ?? 0}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true} />
        Active
      </label>
      <FormMessage state={state} />
      <SubmitButton>{plan ? "Save plan" : "Create plan"}</SubmitButton>
    </form>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatAmount(value: number) {
  return Number(value).toLocaleString();
}

function normalizeContact(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function donationsForApplicant(application: MembershipApplication, donations: Donation[]) {
  const email = normalizeContact(application.email);
  const phone = normalizeContact(application.phone).replace(/\s+/g, "");
  return donations.filter((donation) => {
    const donorEmail = normalizeContact(donation.donor_email);
    const donorPhone = normalizeContact(donation.donor_phone).replace(/\s+/g, "");
    return (email && donorEmail === email) || (phone && donorPhone && donorPhone === phone);
  });
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-2 last:border-b-0 sm:grid-cols-[160px_1fr]">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm">{value || "—"}</dd>
    </div>
  );
}

function ApplicationDetails({
  application,
  donations,
}: {
  application: MembershipApplication;
  donations: Donation[];
}) {
  const donor = donations[0];
  const totalGiven = donations.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 font-heading text-sm">Submitted application</h3>
        <dl>
          <DetailRow label="Full name" value={application.full_name} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Phone" value={application.phone} />
          <DetailRow label="Address" value={application.address} />
          <DetailRow
            label="Plan"
            value={
              application.plan
                ? `${application.plan.name}${
                    application.plan.fee_amount
                      ? ` (${formatAmount(application.plan.fee_amount)})`
                      : ""
                  }${application.plan.duration_label ? ` · ${application.plan.duration_label}` : ""}`
                : "—"
            }
          />
          <DetailRow label="Motivation" value={application.motivation} />
          <DetailRow label="Locale" value={application.locale} />
          <DetailRow label="Status" value={application.status} />
          <DetailRow label="Admin notes" value={application.admin_notes} />
          <DetailRow label="Submitted" value={formatDate(application.created_at)} />
        </dl>
      </section>
      <section>
        <h3 className="mb-2 font-heading text-sm">Donor info</h3>
        {donor ? (
          <dl>
            <DetailRow label="Donor name" value={donor.donor_name} />
            <DetailRow label="Donor email" value={donor.donor_email} />
            <DetailRow label="Donor phone" value={donor.donor_phone} />
            <DetailRow label="Donor address" value={donor.donor_address} />
            <DetailRow label="Payments" value={`${donations.length} · total ${formatAmount(totalGiven)}`} />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No matching donor record for this applicant.</p>
        )}
      </section>
      <section>
        <h3 className="mb-2 font-heading text-sm">Payment history</h3>
        {donations.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Cause</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Txn</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{formatDate(donation.created_at)}</TableCell>
                  <TableCell>{formatAmount(donation.amount)}</TableCell>
                  <TableCell>{donation.package?.name ?? "—"}</TableCell>
                  <TableCell>{donation.cause?.title ?? "General"}</TableCell>
                  <TableCell>{donation.payment_method || "—"}</TableCell>
                  <TableCell>{donation.transaction_id || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{donation.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No payment history for this applicant.</p>
        )}
      </section>
    </div>
  );
}

export function MembershipManager({
  plans,
  applications,
  donations,
}: {
  plans: MembershipPlan[];
  applications: MembershipApplication[];
  donations: Donation[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [viewing, setViewing] = useState<MembershipApplication | null>(null);

  const donationsByApplication = useMemo(() => {
    const map = new Map<string, Donation[]>();
    for (const application of applications) {
      map.set(application.id, donationsForApplicant(application, donations));
    }
    return map;
  }, [applications, donations]);

  return (
    <Tabs defaultValue="plans">
      <TabsList className="w-full overflow-x-auto sm:w-auto">
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
      </TabsList>
      <TabsContent value="plans" className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreating(true)}>
            Add new
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{Number(plan.fee_amount).toLocaleString()}</TableCell>
                <TableCell>{plan.duration_label || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{plan.is_active ? "active" : "hidden"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(plan)}>
                      Edit
                    </Button>
                    <ConfirmDelete
                      onConfirm={async () => {
                        const formData = new FormData();
                        formData.set("id", plan.id);
                        await deleteMembershipPlanAction(formData);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="applications" className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Motivation</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const related = donationsByApplication.get(application.id) ?? [];
                const donor = related[0];
                const totalGiven = related.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>{application.full_name}</div>
                      <div className="text-xs text-muted-foreground">{application.locale || "bn"}</div>
                    </TableCell>
                    <TableCell>
                      <div>{application.email}</div>
                      <div className="text-xs text-muted-foreground">{application.phone || "—"}</div>
                    </TableCell>
                    <TableCell className="max-w-[180px] whitespace-pre-wrap">
                      {application.address || "—"}
                    </TableCell>
                    <TableCell>
                      {application.plan ? (
                        <div>
                          <div>{application.plan.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatAmount(application.plan.fee_amount)}
                            {application.plan.duration_label ? ` · ${application.plan.duration_label}` : ""}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-pre-wrap">
                      {application.motivation || "—"}
                    </TableCell>
                    <TableCell>
                      {donor ? (
                        <div>
                          <div>{donor.donor_name}</div>
                          <div className="text-xs text-muted-foreground">{donor.donor_email}</div>
                          <div className="text-xs text-muted-foreground">{donor.donor_phone || "—"}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No donor</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {related.length ? (
                        <div>
                          <div>{related.length} payment{related.length === 1 ? "" : "s"}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatAmount(totalGiven)}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{application.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setViewing(application)}
                        >
                          View
                        </Button>
                        <form action={updateMembershipApplicationAction} className="flex flex-wrap gap-2">
                          <input type="hidden" name="id" value={application.id} />
                          <select
                            name="status"
                            defaultValue={application.status}
                            className="h-8 rounded-lg border border-input px-2 text-sm"
                          >
                            {MEMBERSHIP_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="outline">
                            Save
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <FormDialog
        title={editing ? "Edit plan" : "Add plan"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <PlanForm key={editing?.id ?? "new"} plan={editing ?? undefined} />
      </FormDialog>
      <FormDialog
        title={viewing ? viewing.full_name : "Application"}
        description="All submitted applicant details, matching donor info, and payment history."
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) {
            setViewing(null);
          }
        }}
        size="lg"
      >
        {viewing ? (
          <ApplicationDetails
            application={viewing}
            donations={donationsByApplication.get(viewing.id) ?? []}
          />
        ) : null}
      </FormDialog>
    </Tabs>
  );
}
