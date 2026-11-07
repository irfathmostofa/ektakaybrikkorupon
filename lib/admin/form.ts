export function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function formOptional(formData: FormData, key: string) {
  return formString(formData, key) || null;
}

export function formNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export function formChecked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function formIdList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}
