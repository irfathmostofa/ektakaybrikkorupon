import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
        <LogOut />
        Sign out
      </Button>
    </form>
  );
}
