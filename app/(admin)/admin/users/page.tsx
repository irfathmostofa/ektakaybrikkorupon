import { getRoleMenusForAdmin, listUsers } from "@/actions/users";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { UserManager } from "@/components/admin/user-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminUsers() {
  const actor = await requireMenu("users");
  const [users, roleData] = await Promise.all([
    listUsers(),
    getRoleMenusForAdmin(),
  ]);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Users"
        description="Add staff, assign roles, and control menu access."
      />
      <UserManager users={users} actor={actor} roleMenus={roleData.menus} />
    </section>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminPage>
      <AdminUsers />
    </AdminPage>
  );
}
