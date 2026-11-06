import { Leaf } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <Leaf className="size-8 text-primary/70" />
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">{message}</p>
    </div>
  );
}
