import { differenceInMinutes } from './time';
import { Employee, Shift } from './types';

type FairnessSnapshot = {
  gini: number;
  variance: number;
  totalMinutes: number;
  perEmployee: Record<string, number>;
};

export const computeFairness = (employees: Employee[], shifts: Shift[]): FairnessSnapshot => {
  const perEmployee: Record<string, number> = {};
  employees.forEach((employee) => {
    perEmployee[employee.id] = 0;
  });
  shifts.forEach((shift) => {
    if (!shift.employeeId) return;
    perEmployee[shift.employeeId] = (perEmployee[shift.employeeId] ?? 0) + differenceInMinutes(shift.start, shift.end);
  });
  const minutes = Object.values(perEmployee);
  const totalMinutes = minutes.reduce((sum, value) => sum + value, 0);
  const mean = minutes.length ? totalMinutes / minutes.length : 0;
  const variance =
    minutes.length > 1
      ? minutes.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / minutes.length
      : 0;
  const gini = minutes.length <= 1 ? 0 : computeGini(minutes);
  return { gini, variance, totalMinutes, perEmployee };
};

const computeGini = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  const cumulative = sorted.reduce((acc, value, index) => acc + value * (index + 1), 0);
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  if (sum === 0) return 0;
  return (2 * cumulative) / (n * sum) - (n + 1) / n;
};

export const fairnessScore = (snapshot: FairnessSnapshot) => 1 - snapshot.gini;

export const compareFairness = (before: FairnessSnapshot, after: FairnessSnapshot) =>
  fairnessScore(after) - fairnessScore(before);
