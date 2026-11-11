"use client";

import { useEffect } from "react";

export function HardRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <p className="text-sm text-muted-foreground">Redirecting to admin...</p>
  );
}
