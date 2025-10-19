import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ForecastingLayout, DemandStudio, ScenarioWorkbench } from '..';
import { resetForecastingApi } from '../../../api';

const renderWithRouter = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/forecasting" element={<ForecastingLayout />}>
          <Route path="studio" element={<DemandStudio />} />
          <Route path="workbench" element={<ScenarioWorkbench />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Forecasting routes', () => {
  beforeEach(() => {
    resetForecastingApi();
  });

  it('renders demand studio metrics', async () => {
    renderWithRouter('/forecasting/studio');

    await waitFor(() => expect(screen.getByText(/Strategic overview/i)).toBeInTheDocument());
    expect(screen.getByText(/Channel mix intelligence/i)).toBeInTheDocument();
  });

  it('renders scenario workbench controls', async () => {
    renderWithRouter('/forecasting/workbench');

    await waitFor(() => expect(screen.getByText(/Scenario orchestration/i)).toBeInTheDocument());
    expect(screen.getByText(/Tune assumptions/i)).toBeInTheDocument();
  });
});
