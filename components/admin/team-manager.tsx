"use client";

import { useState } from "react";
import { deleteTeamMemberAction, saveTeamMemberAction } from "@/actions/team";
import { asFormAction } from "@/lib/admin/form-action";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
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
import type { TeamMember } from "@/lib/types/database";

function TeamMemberForm({ member }: { member?: TeamMember }) {
  return (
    <form action={asFormAction(saveTeamMemberAction)} className="grid gap-3">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="full_name" required>
          Name (Bangla)
        </Label>
        <Input id="full_name" name="full_name" defaultValue={member?.full_name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="full_name_en">Name (English)</Label>
        <Input
          id="full_name_en"
          name="full_name_en"
          defaultValue={member?.full_name_en ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role_title" required>
          Role (Bangla)
        </Label>
        <Input id="role_title" name="role_title" defaultValue={member?.role_title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role_title_en">Role (English)</Label>
        <Input
          id="role_title_en"
          name="role_title_en"
          defaultValue={member?.role_title_en ?? ""}
        />
      </div>
      <RichTextEditor name="bio" label="Bio (Bangla)" defaultValue={member?.bio} />
      <RichTextEditor name="bio_en" label="Bio (English)" defaultValue={member?.bio_en} />
      <ImageField name="photo_url" label="Photo" defaultValue={member?.photo_url} />
      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={member?.sort_order ?? 0}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={member?.is_published ?? true}
        />
        Published
      </label>
      <SubmitButton>{member ? "Save" : "Add member"}</SubmitButton>
    </form>
  );
}

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Team members</h2>
          <p className="text-sm text-muted-foreground">
            People shown on the public about page.
          </p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          Add new
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No team members yet.
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>{member.role_title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {member.is_published ? "published" : "draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(member)}
                    >
                      Edit
                    </Button>
                    <ConfirmDelete
                      onConfirm={async () => {
                        const formData = new FormData();
                        formData.set("id", member.id);
                        await deleteTeamMemberAction(formData);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <FormDialog
        title={editing ? "Edit team member" : "Add team member"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <TeamMemberForm key={editing?.id ?? "new"} member={editing ?? undefined} />
      </FormDialog>
    </div>
  );
}
