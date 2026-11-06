import type { ActionState } from "@/actions/settings";

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }

  if (state.success) {
    return <p className="text-sm text-emerald-700">{state.success}</p>;
  }

  return null;
}
