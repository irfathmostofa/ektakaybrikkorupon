"use client";

import { useState } from "react";
import {
  deleteJobPostingAction,
  saveJobPostingAction,
  updateJobApplicationAction,
} from "@/actions/careers";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asFormAction } from "@/lib/admin/form-action";
import { EMPLOYMENT_TYPES, JOB_APPLICATION_STATUSES } from "@/lib/constants";
import type { JobApplication, JobPosting } from "@/lib/types/database";

function JobForm({ job }: { job?: JobPosting }) {
  return (
    <form action={asFormAction(saveJobPostingAction)} className="grid gap-3">
      {job ? <input type="hidden" name="id" value={job.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={job?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title_en">Title (English)</Label>
        <Input id="title_en" name="title_en" defaultValue={job?.title_en ?? ""} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={job?.department ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={job?.location ?? ""} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employment_type">Type</Label>
          <select
            id="employment_type"
            name="employment_type"
            defaultValue={job?.employment_type ?? "full_time"}
            className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={job?.deadline ?? ""} />
        </div>
      </div>
      <RichTextEditor
        name="description"
        label="Description (Bangla)"
        defaultValue={job?.description}
      />
      <RichTextEditor
        name="description_en"
        label="Description (English)"
        defaultValue={job?.description_en}
      />
      <RichTextEditor
        name="requirements"
        label="Requirements (Bangla)"
        defaultValue={job?.requirements}
      />
      <RichTextEditor
        name="requirements_en"
        label="Requirements (English)"
        defaultValue={job?.requirements_en}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={job?.is_published} />
        Published
      </label>
      <SubmitButton>{job ? "Save job" : "Create job"}</SubmitButton>
    </form>
  );
}

export function CareerManager({
  jobs,
  applications,
}: {
  jobs: JobPosting[];
  applications: JobApplication[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<JobPosting | null>(null);

  return (
    <Tabs defaultValue="jobs">
      <TabsList>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
      </TabsList>
      <TabsContent value="jobs" className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreating(true)}>
            Add new
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{job.is_published ? "published" : "draft"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(job)}>
                      Edit
                    </Button>
                    <ConfirmDelete
                      onConfirm={async () => {
                        const formData = new FormData();
                        formData.set("id", job.id);
                        await deleteJobPostingAction(formData);
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
                  <form action={updateJobApplicationAction} className="flex gap-2">
                    <input type="hidden" name="id" value={application.id} />
                    <select
                      name="status"
                      defaultValue={application.status}
                      className="h-8 rounded-lg border border-input px-2 text-sm"
                    >
                      {JOB_APPLICATION_STATUSES.map((status) => (
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
        title={editing ? "Edit job" : "Add job"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <JobForm key={editing?.id ?? "new"} job={editing ?? undefined} />
      </FormDialog>
    </Tabs>
  );
}
