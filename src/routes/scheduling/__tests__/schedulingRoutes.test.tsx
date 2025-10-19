import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { SchedulingLayout, ManagerConsole, EmployeePortal } from '..';
import { resetSchedulingApi } from '../../../api';

const renderWithRouter = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/scheduling" element={<SchedulingLayout />}>
          <Route path="manager" element={<ManagerConsole />} />
          <Route path="employee" element={<EmployeePortal />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Scheduling routes', () => {
  beforeEach(() => {
    resetSchedulingApi();
  });

  it('shows manager schedule builder and coverage', async () => {
    renderWithRouter('/scheduling/manager');

    await waitFor(() => expect(screen.getByText(/Schedule builder/i)).toBeInTheDocument());
    expect(screen.getByText(/Coverage heatmap/i)).toBeInTheDocument();
  });

  it('renders employee portal actions', async () => {
    renderWithRouter('/scheduling/employee');

    await waitFor(() => expect(screen.getByText(/My availability/i)).toBeInTheDocument());
    expect(screen.getByText(/Open shift bids/i)).toBeInTheDocument();
  });
});
