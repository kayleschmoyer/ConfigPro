export const differenceInCalendarDays = (a: Date, b: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((start - end) / msPerDay);
};
