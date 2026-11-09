"use client";

import { useActionState, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  approveMembershipApplicationsAction,
  deleteMembershipPlanAction,
  saveMembershipPlanAction,
  // updateMembershipApplicationAction,
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
import { formatAdminDate, formatAdminDateTime, formatAdminNumber } from "@/lib/i18n/format";
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
  return formatAdminDateTime(value);
}

function formatAmount(value: number) {
  return formatAdminNumber(value);
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

function planLabel(application: MembershipApplication) {
  if (!application.plan) {
    return "—";
  }
  return `${application.plan.name}${
    application.plan.fee_amount ? ` (${formatAmount(application.plan.fee_amount)})` : ""
  }${application.plan.duration_label ? ` · ${application.plan.duration_label}` : ""}`;
}

function ApplicationActions({
  application,
  onView,
  onUpdated,
}: {
  application: MembershipApplication;
  onView: () => void;
  onUpdated: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <Button type="button" size="sm" variant="outline" onClick={onView}>
        View
      </Button>
      {/* <form
        action={async (formData) => {
          await updateMembershipApplicationAction(formData);
          onUpdated();
        }}
        className="flex flex-wrap gap-2"
      >
        <input type="hidden" name="id" value={application.id} />
        <select
          name="status"
          defaultValue={application.status}
          className="h-8 min-w-28 flex-1 rounded-lg border border-input px-2 text-sm sm:flex-none"
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
      </form> */}
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
          <DetailRow label="Plan" value={planLabel(application)} />
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
          <div className="overflow-x-auto">
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
                    <TableCell className="whitespace-nowrap">{formatDate(donation.created_at)}</TableCell>
                    <TableCell>{formatAmount(donation.amount)}</TableCell>
                    <TableCell>{donation.package?.name ?? "—"}</TableCell>
                    <TableCell>{donation.cause?.title ?? "General"}</TableCell>
                    <TableCell>{donation.payment_method || "—"}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{donation.transaction_id || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{donation.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
  const router = useRouter();
  const [approving, startApprove] = useTransition();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [viewing, setViewing] = useState<MembershipApplication | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const pendingCount = applications.filter((item) => item.status === "pending").length;

  const donationsByApplication = useMemo(() => {
    const map = new Map<string, Donation[]>();
    for (const application of applications) {
      map.set(application.id, donationsForApplicant(application, donations));
    }
    return map;
  }, [applications, donations]);

  const filteredApplications = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((application) => {
      if (statusFilter && application.status !== statusFilter) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const related = donationsByApplication.get(application.id) ?? [];
      const donor = related[0];
      return [
        application.full_name,
        application.email,
        application.phone,
        application.address,
        application.motivation,
        application.plan?.name,
        donor?.donor_name,
        donor?.donor_email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [applications, donationsByApplication, query, statusFilter]);

  const filteredIds = filteredApplications.map((item) => item.id);
  const selectedVisible = selected.filter((id) => filteredIds.includes(id));
  const allVisibleSelected =
    filteredIds.length > 0 && selectedVisible.length === filteredIds.length;

  function toggleSelected(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id),
    );
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...filteredIds]));
      }
      return current.filter((id) => !filteredIds.includes(id));
    });
  }

  function approveSelected() {
    if (!selectedVisible.length) {
      return;
    }
    const formData = new FormData();
    for (const id of selectedVisible) {
      formData.append("ids", id);
    }
    startApprove(async () => {
      await approveMembershipApplicationsAction(formData);
      setSelected([]);
      router.refresh();
    });
  }

  return (
    <Tabs defaultValue={pendingCount > 0 ? "applications" : "plans"}>
      <TabsList className="w-full overflow-x-auto sm:w-auto">
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="applications">
          Applications
          {pendingCount > 0 ? (
            <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          ) : null}
        </TabsTrigger>
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
                <TableCell>{formatAdminNumber(plan.fee_amount)}</TableCell>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 space-y-1">
            <Label htmlFor="application-search">Search</Label>
            <Input
              id="application-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, phone, plan, donor"
            />
          </div>
          <div className="space-y-1 sm:w-44">
            <Label htmlFor="application-status">Status</Label>
            <select
              id="application-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">All</option>
              {MEMBERSHIP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            disabled={!selectedVisible.length || approving}
            onClick={approveSelected}
          >
            {approving
              ? "Approving..."
              : `Approve selected${selectedVisible.length ? ` (${selectedVisible.length})` : ""}`}
          </Button>
        </div>
        {filteredApplications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No applications match this search.
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {filteredApplications.map((application) => {
                const related = donationsByApplication.get(application.id) ?? [];
                const donor = related[0];
                const totalGiven = related.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                return (
                  <article
                    key={application.id}
                    className="space-y-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 size-4"
                          checked={selected.includes(application.id)}
                          onChange={(event) =>
                            toggleSelected(application.id, event.target.checked)
                          }
                        />
                      <div className="min-w-0">
                        <h3 className="truncate font-medium">{application.full_name}</h3>
                        <p className="truncate text-xs text-muted-foreground">{application.email}</p>
                        <p className="text-xs text-muted-foreground">{application.phone || "—"}</p>
                      </div>
                      </label>
                      <Badge variant="secondary">{application.status}</Badge>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Plan</dt>
                        <dd>{application.plan?.name ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Submitted</dt>
                        <dd>{formatAdminDate(application.created_at)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground">Address</dt>
                        <dd className="break-words">{application.address || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Donor</dt>
                        <dd>{donor ? donor.donor_name : "No donor"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Payments</dt>
                        <dd>
                          {related.length
                            ? `${related.length} · ${formatAmount(totalGiven)}`
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                    {application.motivation ? (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{application.motivation}</p>
                    ) : null}
                    <ApplicationActions
                      application={application}
                      onView={() => setViewing(application)}
                      onUpdated={() => router.refresh()}
                    />
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={allVisibleSelected}
                        onChange={(event) => toggleAllVisible(event.target.checked)}
                        aria-label="Select all applications"
                      />
                    </TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Donor / payments</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const related = donationsByApplication.get(application.id) ?? [];
                    const donor = related[0];
                    const totalGiven = related.reduce(
                      (sum, item) => sum + Number(item.amount || 0),
                      0,
                    );
                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="size-4"
                            checked={selected.includes(application.id)}
                            onChange={(event) =>
                              toggleSelected(application.id, event.target.checked)
                            }
                            aria-label={`Select ${application.full_name}`}
                          />
                        </TableCell>
                        <TableCell className="min-w-[180px] max-w-[260px]">
                          <div className="font-medium">{application.full_name}</div>
                          <div className="truncate text-xs text-muted-foreground">{application.email}</div>
                          <div className="text-xs text-muted-foreground">{application.phone || "—"}</div>
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          <div>{application.plan?.name ?? "—"}</div>
                          {application.plan ? (
                            <div className="text-xs text-muted-foreground">
                              {formatAmount(application.plan.fee_amount)}
                              {application.plan.duration_label
                                ? ` · ${application.plan.duration_label}`
                                : ""}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          {donor ? (
                            <div>
                              <div>{donor.donor_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {related.length} payment{related.length === 1 ? "" : "s"} ·{" "}
                                {formatAmount(totalGiven)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No donor</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatAdminDate(application.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{application.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <ApplicationActions
                            application={application}
                            onView={() => setViewing(application)}
                            onUpdated={() => router.refresh()}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
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
