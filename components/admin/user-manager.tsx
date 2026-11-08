"use client";

import { useState } from "react";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/actions/users";
import { updateRoleMenusAction } from "@/actions/settings";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asFormAction } from "@/lib/admin/form-action";
import {
  ADMIN_MENU_KEYS,
  ADMIN_MENU_LABELS,
  menusForRole,
  type AdminMenuKey,
} from "@/lib/admin/menus";
import { USER_ROLES } from "@/lib/constants";
import type { RoleMenus, User, UserRole } from "@/lib/types/database";

function UserForm({
  user,
  actor,
}: {
  user?: User;
  actor: User;
}) {
  const roles = USER_ROLES.filter(
    (role) => role !== "super_admin" || actor.role === "super_admin",
  );
  return (
    <form
      action={asFormAction(user ? updateUserAction : createUserAction)}
      className="grid gap-3"
    >
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={user?.full_name ?? ""} />
      </div>
      {user ? null : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "editor"}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton>{user ? "Save user" : "Add user"}</SubmitButton>
    </form>
  );
}

export function UserManager({
  users,
  actor,
  roleMenus,
}: {
  users: User[];
  actor: User;
  roleMenus: RoleMenus;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const adminMenus = menusForRole("admin", roleMenus);
  const editorMenus = menusForRole("editor", roleMenus);
  const assignable = ADMIN_MENU_KEYS.filter((key) => key !== "users" || true);

  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        {actor.role === "super_admin" ? (
          <TabsTrigger value="access">Role access</TabsTrigger>
        ) : null}
      </TabsList>
      <TabsContent value="users" className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreating(true)}>
            Add user
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(user)}>
                      Edit
                    </Button>
                    {user.id !== actor.id ? (
                      <ConfirmDelete
                        onConfirm={async () => {
                          const formData = new FormData();
                          formData.set("id", user.id);
                          await deleteUserAction(formData);
                        }}
                      />
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      {actor.role === "super_admin" ? (
        <TabsContent value="access">
          <form action={asFormAction(updateRoleMenusAction)} className="space-y-6">
            {(["admin", "editor"] as UserRole[]).map((role) => {
              const selected = new Set(role === "admin" ? adminMenus : editorMenus);
              return (
                <div key={role} className="rounded-xl border border-border p-4">
                  <p className="mb-3 text-sm font-medium capitalize">{role.replace("_", " ")}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {assignable.map((key: AdminMenuKey) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name={`${role}_menus`}
                          value={key}
                          defaultChecked={selected.has(key)}
                        />
                        {ADMIN_MENU_LABELS[key]}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            <SubmitButton>Save access</SubmitButton>
          </form>
        </TabsContent>
      ) : null}
      <FormDialog
        title={editing ? "Edit user" : "Add user"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <UserForm user={editing ?? undefined} actor={actor} />
      </FormDialog>
    </Tabs>
  );
}
