import type { DateISO } from './types';

const MINUTE = 60 * 1000;

export const parseISO = (value: DateISO) => new Date(value);

export const toISO = (date: Date) => date.toISOString();

export const startOfDayUTC = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

export const endOfDayUTC = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCHours(23, 59, 59, 999);
  return copy;
};

export const addMinutes = (iso: DateISO, minutes: number) => {
  const date = new Date(iso);
  return new Date(date.getTime() + minutes * MINUTE).toISOString();
};

export const differenceInMinutes = (start: DateISO, end: DateISO) => {
  const delta = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(delta / MINUTE);
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const floorToIncrement = (date: Date, increment: number) => {
  const minutes = date.getUTCMinutes();
  const floored = minutes - (minutes % increment);
  const copy = new Date(date);
  copy.setUTCMinutes(floored, 0, 0);
  return copy;
};

export const ceilToIncrement = (date: Date, increment: number) => {
  const minutes = date.getUTCMinutes();
  const remainder = minutes % increment;
  if (remainder === 0) return date;
  const copy = new Date(date);
  copy.setUTCMinutes(minutes + (increment - remainder), 0, 0);
  return copy;
};

export const minutesBetween = (start: DateISO, end: DateISO) => Math.max(0, differenceInMinutes(start, end));

export const isWithin = (target: DateISO, start: DateISO, end: DateISO) => {
  const value = new Date(target).getTime();
  return value >= new Date(start).getTime() && value <= new Date(end).getTime();
};

export const overlaps = (startA: DateISO, endA: DateISO, startB: DateISO, endB: DateISO) => {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
};

export const getDayKey = (date: Date) => date.toISOString().slice(0, 10);

export const enumerateDays = (start: DateISO, end: DateISO) => {
  const startDate = startOfDayUTC(new Date(start));
  const endDate = startOfDayUTC(new Date(end));
  const days: string[] = [];
  for (let current = new Date(startDate); current <= endDate; current.setUTCDate(current.getUTCDate() + 1)) {
    days.push(current.toISOString().slice(0, 10));
  }
  return days;
};

export const enumerateHours = (incrementMinutes: number) => {
  const ticks: number[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += incrementMinutes) {
    ticks.push(minutes);
  }
  return ticks;
};

export const minutesToHHmm = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const hhmmToMinutes = (value: string) => {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
};

export const sortISO = (dates: DateISO[]) => [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
