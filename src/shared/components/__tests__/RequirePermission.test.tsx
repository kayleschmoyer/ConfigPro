import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequirePermission } from '../RequirePermission';
import type { CurrentUser } from '../../state/auth';
import { useCurrentUser } from '../../state/auth';

vi.mock('../../state/auth', () => ({
  useCurrentUser: vi.fn(),
}));

const mockUseCurrentUser = vi.mocked(useCurrentUser);

const createUser = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  orgId: 'org-123',
  roles: ['viewer'],
  permissions: [],
  attributes: {},
  ...overrides,
});

describe('RequirePermission', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReset();
  });

  it('renders children when the current user has the owner role', () => {
    mockUseCurrentUser.mockReturnValue(createUser({ roles: ['owner'], permissions: [] }));

    render(
      <RequirePermission perm="policies:approve">
        <span>secured content</span>
      </RequirePermission>
    );

    expect(screen.getByText('secured content')).toBeInTheDocument();
  });

  it('renders the fallback when permissions are missing', () => {
    mockUseCurrentUser.mockReturnValue(createUser({ roles: ['viewer'], permissions: [] }));

    render(
      <RequirePermission perm="reports:view:team" fallback={<span>denied</span>}>
        <span>secured content</span>
      </RequirePermission>
    );

    expect(screen.getByText('denied')).toBeInTheDocument();
    expect(screen.queryByText('secured content')).not.toBeInTheDocument();
  });

  it('allows access when any required permission is present', () => {
    mockUseCurrentUser.mockReturnValue(
      createUser({ roles: ['manager'], permissions: ['reports:view:team'] })
    );

    render(
      <RequirePermission perm={['reports:view:team', 'unknown:permission']} match="any">
        <span>secured content</span>
      </RequirePermission>
    );

    expect(screen.getByText('secured content')).toBeInTheDocument();
  });
});
