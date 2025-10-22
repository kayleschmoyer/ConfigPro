export const differenceInMinutes = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / 60000);
};

export const minutesToHours = (minutes: number) => minutes / 60;
