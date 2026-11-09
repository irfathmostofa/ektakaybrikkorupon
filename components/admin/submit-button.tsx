"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  name,
  value,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  name?: string;
  value?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  onClick?: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      name={name}
      value={value}
      variant={variant}
      onClick={onClick}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
