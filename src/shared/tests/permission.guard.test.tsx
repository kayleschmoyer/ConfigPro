import { act, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';

import {
  RequirePermission,
  type RequirePermissionRenderContext,
} from '../../features/shared/access.guard';
import { renderWithProviders } from './mockProviders';

describe('RequirePermission guard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders children when the active role has the required permission', () => {
    renderWithProviders(
      <RequirePermission needs="Publish role templates and invitation policies">
        <div>permitted</div>
      </RequirePermission>,
    );

    expect(screen.getByText('permitted')).toBeInTheDocument();
  });

  it('renders the fallback and exposes missing permissions in the render context', () => {
    renderWithProviders(
      <RequirePermission
        needs="Approve shift changes and overtime requests"
        roleId="analyst"
        fallback={(context) => (
          <div>
            <span>blocked</span>
            <span data-testid="missing">{context.missing.join(',')}</span>
          </div>
        )}
      >
        <div>permitted</div>
      </RequirePermission>,
    );

    expect(screen.getByText('blocked')).toBeInTheDocument();
    expect(screen.queryByText('permitted')).not.toBeInTheDocument();
    expect(screen.getByTestId('missing').textContent).toContain(
      'Approve shift changes and overtime requests',
    );
  });

  it('allows consumers to switch the active role through the render context setter', async () => {
    let capturedContext: RequirePermissionRenderContext | undefined;

    renderWithProviders(
      <RequirePermission
        needs="Invite and offboard team members in assigned locations"
        fallback={(context) => {
          capturedContext = context;
          return <div>blocked</div>;
        }}
      >
        <div>permitted</div>
      </RequirePermission>,
    );

    await waitFor(() => expect(screen.getByText('blocked')).toBeInTheDocument());
    expect(capturedContext?.activeRole.id).toBe('org-admin');

    await act(async () => {
      capturedContext?.setActiveRole('people-manager');
    });

    await waitFor(() => expect(screen.getByText('permitted')).toBeInTheDocument());
    expect(screen.queryByText('blocked')).not.toBeInTheDocument();

    const stored = window.localStorage.getItem('configpro.activeRole');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? 'null')).toBe('people-manager');
  });
});
