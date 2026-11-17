const VIETNAM_OFFSET = 7 * 60 * 60 * 1000;
/** datetime-local values are always Vietnam time, independent of the browser timezone. */
export function toPostDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + VIETNAM_OFFSET).toISOString().slice(0, 19);
}
export function fromPostDateInput(
  value: string,
  original?: string | null,
): string | undefined {
  if (!value) return undefined;
  if (original && toPostDateInput(original) === value) return original;
  const date = new Date(`${value}+07:00`);
  if (Number.isNaN(date.getTime())) throw new Error("Thời gian không hợp lệ");
  return date.toISOString();
}
