import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={compact ? "px-2" : "w-full justify-start"}
      >
        <LogOut />
        {compact ? <span className="sr-only">Sign out</span> : "Sign out"}
      </Button>
    </form>
  );
}
