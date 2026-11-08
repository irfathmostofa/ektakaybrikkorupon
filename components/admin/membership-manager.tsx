"use client";

import { useActionState, useState } from "react";
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
import type { MembershipApplication, MembershipPlan } from "@/lib/types/database";

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

export function MembershipManager({
  plans,
  applications,
}: {
  plans: MembershipPlan[];
  applications: MembershipApplication[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);

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
      <TabsContent value="applications">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.full_name}</TableCell>
                <TableCell>{application.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{application.status}</Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    </Tabs>
  );
}
