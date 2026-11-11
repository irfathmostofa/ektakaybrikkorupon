"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      className={compact ? "px-2" : "w-full justify-start"}
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
          window.location.replace("/admin/login");
        });
      }}
    >
      <LogOut />
      {compact ? (
        <span className="sr-only">{pending ? "Signing out..." : "Sign out"}</span>
      ) : (
        pending ? "Signing out..." : "Sign out"
      )}
    </Button>
  );
}
