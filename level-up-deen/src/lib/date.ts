export const defaultAppTimeZone = "Asia/Jakarta";

export function formatDateInTimeZone(date = new Date(), timeZone = defaultAppTimeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
