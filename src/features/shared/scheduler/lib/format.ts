import { DateISO } from './types';
import { differenceInMinutes, minutesToHHmm } from './time';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
});

const longDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDate = (iso: DateISO, long = false) => (long ? longDateFormatter : dateFormatter).format(new Date(iso));

export const formatTime = (iso: DateISO) => timeFormatter.format(new Date(iso));

export const formatRange = (start: DateISO, end: DateISO) => `${formatTime(start)} – ${formatTime(end)}`;

export const formatDuration = (start: DateISO, end: DateISO) => {
  const minutes = differenceInMinutes(start, end);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }
  if (hours) return `${hours}h`;
  return `${mins}m`;
};

export const formatMinutes = (value: number) => {
  if (value % 60 === 0) return `${value / 60}h`;
  return `${Math.floor(value / 60)}h ${value % 60}m`;
};

export const formatHHmm = (value: number) => minutesToHHmm(value);
