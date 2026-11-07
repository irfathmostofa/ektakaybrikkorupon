"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FormDialog({
  triggerLabel,
  title,
  description,
  children,
  open: controlled,
  onOpenChange,
  size = "md",
}: {
  triggerLabel?: string;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlled ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;

  return (
    <>
      {triggerLabel ? (
        <Button type="button" onClick={() => setOpen(true)}>
          {triggerLabel}
        </Button>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={
            size === "lg"
              ? "max-h-[90vh] overflow-y-auto sm:max-w-3xl"
              : size === "md"
                ? "max-h-[90vh] overflow-y-auto sm:max-w-xl"
                : "sm:max-w-sm"
          }
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          {open
            ? typeof children === "function"
              ? children(() => setOpen(false))
              : children
            : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
