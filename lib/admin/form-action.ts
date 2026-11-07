import type { ActionState } from "@/actions/settings";

export function asFormAction(
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>,
) {
  return async (formData: FormData) => {
    await action({}, formData);
  };
}
